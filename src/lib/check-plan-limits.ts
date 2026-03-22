import { createClient } from '@/supabase/server'
import { getPlanLimits, type Plan } from './plans'

type PlanCheck = {
  allowed: boolean
  reason?: string
  plan: Plan
  viewsUsed: number
  viewsLimit: number
  booksUsed: number
  booksLimit: number
}

/**
 * Check if the creator can create a new book based on their plan.
 */
export async function checkCanCreateBook(userId: string): Promise<PlanCheck> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = (profile?.plan || 'free') as Plan
  const limits = getPlanLimits(plan)

  // Count existing books
  const { count } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', userId)

  const booksUsed = count || 0

  if (booksUsed >= limits.maxBooks) {
    return {
      allowed: false,
      reason: `You've reached the ${limits.maxBooks} book limit on the ${plan} plan. Upgrade to create more.`,
      plan,
      viewsUsed: 0,
      viewsLimit: limits.maxViewsPerMonth,
      booksUsed,
      booksLimit: limits.maxBooks,
    }
  }

  return {
    allowed: true,
    plan,
    viewsUsed: 0,
    viewsLimit: limits.maxViewsPerMonth,
    booksUsed,
    booksLimit: limits.maxBooks,
  }
}

/**
 * Check if a book can be viewed based on the creator's view limits.
 * Returns whether to show the book or a "limit reached" page.
 */
export async function checkCanViewBook(creatorId: string): Promise<{
  allowed: boolean
  reason?: string
  showWatermark: boolean
}> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', creatorId)
    .single()

  const plan = (profile?.plan || 'free') as Plan
  const limits = getPlanLimits(plan)
  const month = new Date().toISOString().slice(0, 7)

  // Get current monthly views
  const { data: viewsData } = await supabase.rpc('get_creator_monthly_views', {
    p_creator_id: creatorId,
    p_month: month,
  })

  const viewsUsed = viewsData || 0

  if (viewsUsed >= limits.maxViewsPerMonth) {
    return {
      allowed: false,
      reason: 'This flipbook has reached its monthly view limit. The creator needs to upgrade their plan.',
      showWatermark: limits.hasWatermark,
    }
  }

  return {
    allowed: true,
    showWatermark: limits.hasWatermark,
  }
}
