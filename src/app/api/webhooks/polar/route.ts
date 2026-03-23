import { Webhooks } from '@polar-sh/nextjs'
import { createClient } from '@/supabase/server'
import type { Plan } from '@/lib/plans'

const POLAR_PLAN_MAP: Record<string, Plan> = {
  '8c2cbb56-9503-45ad-bf15-e1ee72c50ebe': 'creator',
  '56c2f1d8-6c7d-4ee2-a09a-e24c0612615c': 'pro_seller',
  // agency: TBD
}

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
    status: 'processed',
    processed_at: new Date().toISOString(),
  })

  // Try to find user by polar_customer_id first
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('polar_customer_id', customerId)
    .single()

  if (existingProfile) {
    await supabase
      .from('profiles')
      .update({
        plan,
        polar_subscription_id: subscriptionId,
        subscription_status: status,
        current_period_end: currentPeriodEnd || null,
      })
      .eq('id', existingProfile.id)
    return
  }

  // If not found by customer_id, try by email
  if (customerEmail) {
    const { data: userByEmail } = await supabase.rpc('get_user_by_email', {
      user_email: customerEmail,
    })

    if (userByEmail?.[0]?.id) {
      await supabase
        .from('profiles')
        .update({
          plan,
          polar_customer_id: customerId,
          polar_subscription_id: subscriptionId,
          subscription_status: status,
          current_period_end: currentPeriodEnd || null,
        })
        .eq('id', userByEmail[0].id)
    }
  }
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
