import { getDownloadUrl } from '@/lib/storage'
import { NextResponse } from 'next/server'

type Context = {
  params: Promise<{ path: string[] }>
}

/**
 * Proxy route for Seafile files.
 * GET /api/storage/pdfs/book-id/file.pdf → redirects to Seafile download URL
 * GET /api/storage/covers/book-id.jpg → redirects to Seafile download URL
 */
export async function GET(_request: Request, context: Context) {
  const { path } = await context.params
  const filePath = '/' + path.join('/')

  try {
    const downloadUrl = await getDownloadUrl(filePath)
    return NextResponse.redirect(downloadUrl)
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
