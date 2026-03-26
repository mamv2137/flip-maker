import { Webhooks } from '@polar-sh/nextjs'
import { createClient } from '@/supabase/server'
import type { Plan } from '@/lib/plans'
import { polarProducts } from '@/lib/polar-products'

// Reverse map: product ID → plan name (works for both sandbox and production)
const POLAR_PLAN_MAP: Record<string, Plan> = Object.fromEntries(
  Object.entries(polarProducts).map(([plan, id]) => [id, plan as Plan])
)

function getPlanFromProductId(productId: string): Plan {
  return POLAR_PLAN_MAP[productId] || 'free'
}

async function updateUserPlan(
  customerId: string,
  customerEmail: string | undefined,
  plan: Plan,
  subscriptionId: string,
  status: 'active' | 'canceled',
  currentPeriodEnd?: string | null
) {
  const supabase = await createClient()

  // Log the event
  await supabase.from('webhook_events').insert({
    provider: 'polar',
    event_type: `subscription.${status}`,
    payload: { customerId, customerEmail, plan, subscriptionId },
    status: 'pending',
  })

  // Find user ID: try by polar_customer_id first, then by email
  let userId: string | null = null

  // Try by existing polar_customer_id (for returning customers)
  const { data: byCustomerId } = await supabase
    .from('profiles')
    .select('id')
    .eq('polar_customer_id', customerId)
    .single()

  if (byCustomerId) {
    userId = byCustomerId.id
  }

  // If not found, try by email (for first-time subscribers)
  if (!userId && customerEmail) {
    const { data: byEmail } = await supabase.rpc('get_user_by_email', {
      user_email: customerEmail,
    })
    if (byEmail?.[0]?.id) {
      userId = byEmail[0].id
    }
  }

  if (!userId) {
    console.error('[polar-webhook] Could not find user for:', { customerId, customerEmail })
    return
  }

  // Update using SECURITY DEFINER RPC (bypasses RLS)
  await supabase.rpc('update_user_plan', {
    p_user_id: userId,
    p_plan: plan,
    p_polar_customer_id: customerId,
    p_polar_subscription_id: subscriptionId,
    p_subscription_status: status,
    p_current_period_end: currentPeriodEnd || null,
  })

  // Mark webhook as processed
  await supabase
    .from('webhook_events')
    .update({ status: 'processed', processed_at: new Date().toISOString() })
    .eq('provider', 'polar')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async (payload) => {
    const sub = payload.data
    const plan = getPlanFromProductId(sub.productId)
    await updateUserPlan(
      sub.customerId,
      sub.customer?.email,
      plan,
      sub.id,
      'active',
      sub.currentPeriodEnd?.toISOString()
    )
  },

  onSubscriptionActive: async (payload) => {
    const sub = payload.data
    const plan = getPlanFromProductId(sub.productId)
    await updateUserPlan(
      sub.customerId,
      sub.customer?.email,
      plan,
      sub.id,
      'active',
      sub.currentPeriodEnd?.toISOString()
    )
  },

  onSubscriptionUpdated: async (payload) => {
    const sub = payload.data
    const plan = getPlanFromProductId(sub.productId)
    await updateUserPlan(
      sub.customerId,
      sub.customer?.email,
      plan,
      sub.id,
      'active',
      sub.currentPeriodEnd?.toISOString()
    )
  },

  onSubscriptionCanceled: async (payload) => {
    const sub = payload.data
    await updateUserPlan(
      sub.customerId,
      sub.customer?.email,
      'free',
      sub.id,
      'canceled'
    )
  },

  onSubscriptionRevoked: async (payload) => {
    const sub = payload.data
    await updateUserPlan(
      sub.customerId,
      sub.customer?.email,
      'free',
      sub.id,
      'canceled'
    )
  },
})
