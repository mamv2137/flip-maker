import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/views — Increment view count for a book.
 * Called from the reader page when a book is viewed.
 * Also records an analytics event.
 */
export async function POST(request: Request) {
  const { bookId } = await request.json()

  if (!bookId) {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const month = new Date().toISOString().slice(0, 7) // '2026-03'

  // Increment monthly view counter
  await supabase.rpc('increment_book_view', {
    p_book_id: bookId,
    p_month: month,
  })

  // Also record analytics event
  await supabase.from('analytics_events').insert({
    book_id: bookId,
    event_type: 'view',
    metadata: { month },
  })

  return NextResponse.json({ counted: true })
}
