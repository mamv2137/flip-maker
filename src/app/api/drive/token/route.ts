import { createClient } from '@/supabase/server'
import { getGoogleAccessToken } from '@/lib/google-tokens'
import { NextResponse } from 'next/server'

// POST: Save Google tokens from client after OAuth login
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { access_token, refresh_token } = body

  if (!access_token) {
    return NextResponse.json({ error: 'access_token is required' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

  const updates: Record<string, string | null> = {
    google_access_token: access_token,
    google_token_expires_at: expiresAt,
  }
  if (refresh_token) {
    updates.google_refresh_token = refresh_token
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved: true })
}

// GET: Check if we have a valid token that actually works with Drive API
export async function GET() {
  const token = await getGoogleAccessToken()

  if (!token) {
    return NextResponse.json({ hasToken: false })
  }

  // Verify the token has Drive scope by making a lightweight API call
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (res.ok) {
      return NextResponse.json({ hasToken: true })
    }
    // Token exists but doesn't have Drive scope
    return NextResponse.json({ hasToken: false })
  } catch {
    return NextResponse.json({ hasToken: false })
  }
}
