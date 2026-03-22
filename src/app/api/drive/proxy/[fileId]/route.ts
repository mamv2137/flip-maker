import { createClient } from '@/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

type Context = {
  params: Promise<{ fileId: string }>
}

/**
 * Get a valid Google access token for a book creator.
 * Uses a SECURITY DEFINER function to bypass RLS.
 */
async function getTokenForCreator(creatorId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_creator_drive_token', {
    creator_uuid: creatorId,
  })

  if (error || !data?.[0]?.google_access_token) {
    console.log('[drive-proxy] No token found for creator:', creatorId, error?.message)
    return null
  }

  const row = data[0]

  // Check expiry (5 min buffer)
  const expiresAt = row.google_token_expires_at
    ? new Date(row.google_token_expires_at)
    : null
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now() + 5 * 60 * 1000

  if (!isExpired) {
    return row.google_access_token
  }

  // Refresh
  if (!row.google_refresh_token) return null

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: row.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) {
      console.log('[drive-proxy] Token refresh failed:', res.status)
      return null
    }

    const tokenData = await res.json()
    const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString()

    // Save refreshed token (this uses the current user's RLS context, but
    // the creator viewing their own book will succeed. For readers, this may
    // fail silently which is fine — the token still works for this request.)
    await supabase
      .from('profiles')
      .update({
        google_access_token: tokenData.access_token,
        google_token_expires_at: newExpiresAt,
      })
      .eq('id', creatorId)

    return tokenData.access_token
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, context: Context) {
  const { fileId } = await context.params

  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
  }

  const creatorId = request.nextUrl.searchParams.get('creator')

  // Drive API v3 endpoint — alt=media returns raw file content (no HTML confirmation page)
  const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`

  try {
    // Try 1: Use the creator's Google token (private files via Drive API)
    if (creatorId) {
      const accessToken = await getTokenForCreator(creatorId)

      if (accessToken) {
        const res = await fetch(driveApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (res.ok && res.body) {
          return new Response(res.body, {
            headers: {
              'Content-Type': 'application/pdf',
              'Cache-Control': 'private, max-age=3600',
            },
          })
        }
      }
    }

    // Try 2: Public download URL fallback (for public links without token)
    const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const res = await fetch(publicUrl, { redirect: 'follow' })

    if (!res.ok) {
      return NextResponse.json({ error: 'File not accessible' }, { status: 404 })
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html') || !res.body) {
      return NextResponse.json(
        { error: 'File is not accessible. The creator may need to reconnect Google Drive.' },
        { status: 403 }
      )
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 })
  }
}
