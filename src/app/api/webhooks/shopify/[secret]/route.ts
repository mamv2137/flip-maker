import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

type Context = {
  params: Promise<{ secret: string }>
}

/**
 * Shopify "Order paid" webhook handler.
 * URL: POST /api/webhooks/shopify/{webhook_secret}
 *
 * Shopify sends order data including customer email.
 * We create an access_grant for that email on the book linked to this webhook secret.
 */
export async function POST(request: Request, context: Context) {
  const { secret } = await context.params

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secret)) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find the book by webhook secret
  const { data: bookData } = await supabase.rpc('get_book_by_webhook_secret', {
    secret_uuid: secret,
  })
  const book = bookData?.[0]

  if (!book) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  // Extract customer email from Shopify payload
  // Shopify sends: { email, customer: { email }, ... }
  const email =
    (body.email as string) ||
    ((body.customer as Record<string, unknown>)?.email as string) ||
    null

  if (!email) {
    // Log the event but don't fail — some webhooks may not have email
    await supabase.from('webhook_events').insert({
      provider: 'shopify',
      event_type: 'order_paid',
      payload: body,
      status: 'failed',
      error_message: 'No customer email in payload',
    })
    return NextResponse.json({ error: 'No customer email found' }, { status: 400 })
  }

  // Log the webhook event
  const { data: webhookEvent } = await supabase
    .from('webhook_events')
    .insert({
      provider: 'shopify',
      event_type: 'order_paid',
      payload: body,
      status: 'processed',
    })
    .select('id')
    .single()

  // Create access grant (upsert to avoid duplicates)
  await supabase
    .from('access_grants')
    .upsert(
      {
        book_id: book.id,
        buyer_email: email.toLowerCase().trim(),
        granted_by: 'shopify',
        webhook_event_id: webhookEvent?.id,
      },
      { onConflict: 'book_id,buyer_email' }
    )

  return NextResponse.json({ success: true, email })
}
