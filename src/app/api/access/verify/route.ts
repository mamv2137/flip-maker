import { verifyMagicLinkToken } from '@/lib/magic-link'
import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const payload = await verifyMagicLinkToken(token)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  // Verify the grant still exists
  const supabase = await createClient()
  const { data: grant } = await supabase
    .from('access_grants')
    .select('*, books(slug, title, status)')
    .eq('id', payload.grantId)
    .single()

  if (!grant) {
    return NextResponse.json({ error: 'Access grant not found' }, { status: 404 })
  }

  // Mark as accessed if first time
  if (!grant.accessed_at) {
    await supabase
      .from('access_grants')
      .update({ accessed_at: new Date().toISOString() })
      .eq('id', grant.id)
  }

  return NextResponse.json({
    valid: true,
    grantId: grant.id,
    bookId: grant.book_id,
    book: grant.books,
  })
}
