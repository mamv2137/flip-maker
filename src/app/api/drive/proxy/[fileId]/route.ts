import { getDriveDownloadUrl } from '@/lib/google-drive'
import { NextResponse } from 'next/server'

type Context = {
  params: Promise<{ fileId: string }>
}

export async function GET(_request: Request, context: Context) {
  const { fileId } = await context.params

  // Validate fileId format
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
  }

  try {
    const url = getDriveDownloadUrl(fileId)
    const res = await fetch(url, { redirect: 'follow' })

    if (!res.ok) {
      return NextResponse.json({ error: 'File not accessible' }, { status: 404 })
    }

    const contentType = res.headers.get('content-type') || 'application/pdf'

    // If Google returns HTML (non-public file), return error
    if (contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'File is not public' },
        { status: 403 }
      )
    }

    const body = res.body
    if (!body) {
      return NextResponse.json({ error: 'Empty response' }, { status: 502 })
    }

    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 })
  }
}
