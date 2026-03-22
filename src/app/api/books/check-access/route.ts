import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, slug } = await request.json()

  if (!email || !slug) {
    return NextResponse.json({ error: 'Email and slug are required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find the book by slug
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!book) {
    return NextResponse.json({ hasAccess: false })
  }

  // Check if there's an access grant for this email
  const { data: grant } = await supabase
    .from('access_grants')
    .select('id')
    .eq('book_id', book.id)
    .eq('buyer_email', email.toLowerCase().trim())
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ hasAccess: !!grant })
}
