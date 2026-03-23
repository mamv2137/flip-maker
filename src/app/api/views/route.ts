import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { headers } from 'next/headers'

/**
 * POST /api/views — Count a unique view for a book.
 * Deduplication: same (IP + User-Agent + BookID) within 24 hours = 1 view.
 */
export async function POST(request: Request) {
  const { bookId } = await request.json()

  if (!bookId) {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 })
  }

  // Build fingerprint from IP + User-Agent + BookID
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  const fingerprint = createHash('sha256')
    .update(`${ip}|${userAgent}|${bookId}`)
    .digest('hex')

  const supabase = await createClient()
  const month = new Date().toISOString().slice(0, 7) // '2026-03'

  // Try to count the view (returns false if already counted in last 24h)
  const { data: counted } = await supabase.rpc('try_count_view', {
    p_book_id: bookId,
    p_fingerprint: fingerprint,
    p_month: month,
  })

  // Record analytics event regardless (for detailed tracking)
  await supabase.from('analytics_events').insert({
    book_id: bookId,
    event_type: 'view',
    ip_address: ip,
    metadata: { month, unique: !!counted },
  })

  return NextResponse.json({ counted: !!counted })
}
