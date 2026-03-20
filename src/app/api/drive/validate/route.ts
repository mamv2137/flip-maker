import { createClient } from '@/supabase/server'
import { parseDriveFileId, validateDriveFile } from '@/lib/google-drive'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await request.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const fileId = parseDriveFileId(url)
  if (!fileId) {
    return NextResponse.json(
      { valid: false, error: 'Invalid Google Drive URL. Please paste a valid sharing link.' },
      { status: 200 }
    )
  }

  const result = await validateDriveFile(fileId)

  return NextResponse.json({ ...result, fileId: result.valid ? fileId : undefined })
}
