import { Webhooks } from '@polar-sh/nextjs'
import { createClient } from '@/supabase/server'
import type { Plan } from '@/lib/plans'
import { polarProducts } from '@/lib/polar-products'
import {
  isUpgrade,
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  sendSubscriptionCreatedEmail,
  sendSubscriptionUpgradedEmail,
} from '@/lib/email/billing'

type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

// Minimal shape we read from `payload.data` — avoids depending on the transitive
// `@polar-sh/sdk` type entrypoint (not declared in our package.json).
type SubscriptionLike = {
  id: string
  status: string
  customerId: string
  productId: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: Date | null
  customer?: {
    email?: string | null
    externalId?: string | null
  } | null
}

const POLAR_PLAN_MAP: Record<string, Plan> = Object.fromEntries(
  Object.entries(polarProducts).map(([plan, id]) => [id, plan as Plan]),
)

function getPlanFromProductId(productId: string): Plan {
  return POLAR_PLAN_MAP[productId] || 'free'
}

type SupabaseLike = Awaited<ReturnType<typeof createClient>>

async function findUserId(
  supabase: SupabaseLike,
  sub: SubscriptionLike,
): Promise<string | null> {
  // 1) externalId — set by us at checkout (most reliable, no DB roundtrip needed for new flows).
  const externalId = sub.customer?.externalId
  if (externalId) return externalId

  // 2) polar_customer_id — for returning customers. Uses SECURITY DEFINER to bypass RLS.
  const { data: byCustomerId } = await supabase.rpc(
    'get_user_by_polar_customer_id',
    {
      p_customer_id: sub.customerId,
    },
  )
  if (byCustomerId?.[0]?.id) return byCustomerId[0].id

  // 3) email — last-resort fallback, case-insensitive.
  const email = sub.customer?.email
  if (email) {
    const { data: byEmail } = await supabase.rpc('get_user_by_email', {
      user_email: email,
    })
    if (byEmail?.[0]?.id) return byEmail[0].id
  }

  return null
}

async function getCurrentPlan(
  supabase: SupabaseLike,
  userId: string,
): Promise<Plan> {
  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()
  return (data?.plan as Plan) ?? 'free'
}

async function logEvent(
  supabase: SupabaseLike,
  eventType: string,
  payload: unknown,
): Promise<string | null> {
  const { data } = await supabase
    .from('webhook_events')
    .insert({
      provider: 'polar',
      event_type: eventType,
      payload: payload as object,
      status: 'pending',
    })
    .select('id')
    .single()
  return data?.id ?? null
}

async function markEvent(
  supabase: SupabaseLike,
  eventId: string | null,
  status: 'processed' | 'failed',
  errorMessage?: string,
) {
  if (!eventId) return
  await supabase
    .from('webhook_events')
    .update({
      status,
      error_message: errorMessage ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq('id', eventId)
}

// Email failures must not fail webhook processing — Polar would retry the
// whole event and we'd risk plan double-writes plus duplicate emails.
async function safeEmail(label: string, send: () => Promise<unknown>) {
  try {
    await send()
  } catch (e) {
    console.error(`[polar-webhook] email send failed (${label}):`, e)
  }
}

async function applySubscription(
  sub: SubscriptionLike,
  eventType: string,
  options: { forceRevoke?: boolean } = {},
) {
  const supabase = await createClient()
  const eventId = await logEvent(supabase, eventType, {
    subscriptionId: sub.id,
    customerId: sub.customerId,
    customerEmail: sub.customer?.email,
    externalId: sub.customer?.externalId,
    productId: sub.productId,
    status: sub.status,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  })

  const status = sub.status as string
  const isActiveStatus = status === 'active' || status === 'trialing'
  const isPastDue = status === 'past_due'
  const isTerminalStatus =
    status === 'canceled' ||
    status === 'unpaid' ||
    status === 'incomplete_expired'

  // past_due: we don't change the plan (Polar handles the dunning window),
  // but we DO email the customer so they update their card before access
  // gets revoked. Without this, churn is silent.
  if (isPastDue && !options.forceRevoke) {
    const userId = await findUserId(supabase, sub)
    const currentPlan = userId
      ? await getCurrentPlan(supabase, userId)
      : getPlanFromProductId(sub.productId)
    const recipient = sub.customer?.email
    if (recipient) {
      await safeEmail('payment_failed', () =>
        sendPaymentFailedEmail({ to: recipient, plan: currentPlan }),
      )
    }
    await markEvent(supabase, eventId, 'processed', 'past_due (email sent)')
    return
  }

  // Polar's subscription.created may arrive with status=incomplete, before payment
  // settles. Don't grant the plan until we have a confirmed-active state.
  if (!options.forceRevoke && !isActiveStatus && !isTerminalStatus) {
    await markEvent(
      supabase,
      eventId,
      'processed',
      `skipped (status=${status})`,
    )
    return
  }

  const userId = await findUserId(supabase, sub)
  if (!userId) {
    const reason = `user not found (customerId=${sub.customerId}, email=${sub.customer?.email ?? 'n/a'}, externalId=${sub.customer?.externalId ?? 'n/a'})`
    console.error('[polar-webhook]', reason)
    await markEvent(supabase, eventId, 'failed', reason)
    return
  }

  const previousPlan = await getCurrentPlan(supabase, userId)

  let plan: Plan
  let dbStatus: SubscriptionStatus

  if (options.forceRevoke || isTerminalStatus) {
    plan = 'free'
    dbStatus = 'canceled'
  } else {
    plan = getPlanFromProductId(sub.productId)
    dbStatus = status === 'trialing' ? 'trialing' : 'active'
  }

  const { error: rpcError } = await supabase.rpc('update_user_plan', {
    p_user_id: userId,
    p_plan: plan,
    p_polar_customer_id: sub.customerId,
    p_polar_subscription_id: sub.id,
    p_subscription_status: dbStatus,
    p_current_period_end: sub.currentPeriodEnd?.toISOString() ?? null,
  })

  if (rpcError) {
    console.error('[polar-webhook] update_user_plan failed:', rpcError)
    await markEvent(supabase, eventId, 'failed', rpcError.message)
    return
  }

  await markEvent(supabase, eventId, 'processed')

  // Decide which lifecycle email to send. Order matters:
  //  - cancellation/revoke is terminal and overrides everything else
  //  - upgrade detection requires comparing previousPlan vs new plan
  //  - "created" email fires on the FIRST transition out of 'free'
  const recipient = sub.customer?.email
  if (!recipient) return

  if (options.forceRevoke || isTerminalStatus) {
    if (previousPlan !== 'free') {
      await safeEmail('subscription_canceled', () =>
        sendSubscriptionCanceledEmail({
          to: recipient,
          plan: previousPlan,
          periodEndIso: sub.currentPeriodEnd?.toISOString() ?? null,
        }),
      )
    }
    return
  }

  if (previousPlan === 'free' && plan !== 'free') {
    await safeEmail('subscription_created', () =>
      sendSubscriptionCreatedEmail({ to: recipient, plan }),
    )
    return
  }

  if (isUpgrade(previousPlan, plan)) {
    await safeEmail('subscription_upgraded', () =>
      sendSubscriptionUpgradedEmail({
        to: recipient,
        fromPlan: previousPlan,
        toPlan: plan,
      }),
    )
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async (payload) =>
    applySubscription(payload.data, 'subscription.created'),

  onSubscriptionActive: async (payload) =>
    applySubscription(payload.data, 'subscription.active'),

  onSubscriptionUpdated: async (payload) =>
    applySubscription(payload.data, 'subscription.updated'),

  // Cancel requested: keep plan/access until period end (Polar fires `revoked` then).
  onSubscriptionCanceled: async (payload) =>
    applySubscription(payload.data, 'subscription.canceled'),

  // Period ended or hard-revoked: downgrade to free.
  onSubscriptionRevoked: async (payload) =>
    applySubscription(payload.data, 'subscription.revoked', {
      forceRevoke: true,
    }),
})
