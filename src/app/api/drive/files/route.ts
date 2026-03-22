import { getGoogleAccessToken } from '@/lib/google-tokens'
import { NextResponse, type NextRequest } from 'next/server'

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files'

export async function GET(request: NextRequest) {
  const accessToken = await getGoogleAccessToken()

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Drive not connected. Please re-login with Google to grant access.' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const folderId = searchParams.get('folderId') || 'root'
  const pageToken = searchParams.get('pageToken') || undefined

  // Only PDFs and folders
  let driveQuery = `'${folderId}' in parents and trashed = false`
  driveQuery += ` and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.folder')`

  if (query) {
    driveQuery += ` and name contains '${query.replace(/'/g, "\\'")}'`
  }

  const params = new URLSearchParams({
    q: driveQuery,
    fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime,thumbnailLink)',
    orderBy: 'folder,name',
    pageSize: '50',
  })
  if (pageToken) params.set('pageToken', pageToken)

  try {
    const res = await fetch(`${DRIVE_API}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: 'Google token expired. Please re-login with Google.' },
          { status: 401 }
        )
      }
      const text = await res.text()
      return NextResponse.json({ error: `Drive API error: ${text}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Drive files' }, { status: 502 })
  }
}
