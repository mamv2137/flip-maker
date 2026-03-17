import { createClient } from '@/supabase/server'
import { createMagicLinkToken } from '@/lib/magic-link'
import { sendMagicLinkEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookId, buyerEmail } = await request.json()

  if (!bookId || !buyerEmail) {
    return NextResponse.json(
      { error: 'bookId and buyerEmail are required' },
      { status: 400 },
    )
  }

  // Verify the book belongs to this creator
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('creator_id', user.id)
    .single()

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  // Create or get existing access grant
  const { data: grant, error: grantError } = await supabase
    .from('access_grants')
    .upsert(
      {
        book_id: bookId,
        buyer_email: buyerEmail.toLowerCase().trim(),
        granted_by: 'manual',
      },
      { onConflict: 'book_id,buyer_email' },
    )
    .select()
    .single()

  if (grantError) {
    return NextResponse.json({ error: grantError.message }, { status: 500 })
  }

  // Generate magic link token
  const token = await createMagicLinkToken({
    grantId: grant.id,
    bookId: book.id,
    email: buyerEmail,
  })

  // Update the grant with the token
  await supabase
    .from('access_grants')
    .update({ magic_link_token: token })
    .eq('id', grant.id)

  // Build magic link URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const magicLinkUrl = `${appUrl}/read/${book.slug}?token=${token}`

  // Get creator display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  // Send email
  const emailResult = await sendMagicLinkEmail({
    to: buyerEmail,
    bookTitle: book.title,
    creatorName: profile?.display_name || user.email || 'A creator',
    magicLinkUrl,
  })

  return NextResponse.json({
    success: true,
    grantId: grant.id,
    magicLinkUrl,
    emailSent: emailResult.success,
  })
}
