import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import type { Plan } from '@/lib/plans'

// Map Polar product IDs to plan names — configure after creating products in Polar
const POLAR_PLAN_MAP: Record<string, Plan> = {
  // 'prod_xxx': 'creator',
  // 'prod_yyy': 'pro_seller',
  // 'prod_zzz': 'agency',
}

function getPlanFromProductId(productId: string): Plan {
  return POLAR_PLAN_MAP[productId] || 'free'
}

export async function POST(request: Request) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())
  const secret = process.env.POLAR_WEBHOOK_SECRET

  if (!secret) {
    console.error('[polar-webhook] POLAR_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let event: ReturnType<typeof validateEvent>
  try {
    event = validateEvent(body, headers, secret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    throw err
  }

  const supabase = await createClient()
  const eventType = event.type

  // Log the event
  await supabase.from('webhook_events').insert({
    provider: 'polar',
    event_type: eventType,
    payload: event.data as unknown as Record<string, unknown>,
    status: 'pending',
  })

  try {
    if (
      eventType === 'subscription.created' ||
      eventType === 'subscription.updated' ||
      eventType === 'subscription.active'
    ) {
      const sub = event.data as Record<string, unknown>
      const customerId = sub.customerId as string | undefined
      const productId = sub.productId as string | undefined

      if (customerId && productId) {
        const plan = getPlanFromProductId(productId)

        // Update by polar_customer_id
        await supabase
          .from('profiles')
          .update({
            plan,
            polar_customer_id: customerId,
            polar_subscription_id: sub.id as string,
            subscription_status: 'active',
            current_period_end: sub.currentPeriodEnd as string | null,
          })
          .eq('polar_customer_id', customerId)
      }
    }

    if (
      eventType === 'subscription.canceled' ||
      eventType === 'subscription.revoked'
    ) {
      const sub = event.data as Record<string, unknown>
      const customerId = sub.customerId as string | undefined

      if (customerId) {
        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            subscription_status: 'canceled',
          })
          .eq('polar_customer_id', customerId)
      }
    }

    // Mark as processed
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('provider', 'polar')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
  } catch (err) {
    console.error('[polar-webhook] Error:', err)
  }

  return NextResponse.json({ received: true })
}
