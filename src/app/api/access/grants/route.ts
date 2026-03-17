import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/access/grants?bookId=xxx — list all access grants for a book
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')

  if (!bookId) {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 })
  }

  // Verify book ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('creator_id', user.id)
    .single()

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const { data: grants, error } = await supabase
    .from('access_grants')
    .select('id, buyer_email, granted_by, accessed_at, created_at')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(grants)
}
