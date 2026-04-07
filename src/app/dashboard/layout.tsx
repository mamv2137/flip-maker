import { createClient } from '@/supabase/server'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { DashboardUsageNudge } from '@/components/dashboard-usage-nudge'
import { getPlanLimits, type Plan } from '@/lib/plans'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims?.email as string) || ''
  const userId = data?.claims?.sub as string | undefined

  let displayName: string | null = null
  let avatarUrl: string | null = null
  let plan: Plan = 'free'
  let viewsUsed = 0
  let booksUsed = 0

  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, plan')
      .eq('id', userId)
      .single()
    displayName = profile?.display_name ?? null
    avatarUrl = profile?.avatar_url ?? null
    plan = (profile?.plan || 'free') as Plan

    // Fetch usage data for nudge
    const month = new Date().toISOString().slice(0, 7)
    const [{ data: viewsData }, { count: bookCount }] = await Promise.all([
      supabase.rpc('get_creator_monthly_views', { p_creator_id: userId, p_month: month }),
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
    ])
    viewsUsed = viewsData || 0
    booksUsed = bookCount || 0
  }

  const limits = getPlanLimits(plan)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar userEmail={email} displayName={displayName} avatarUrl={avatarUrl} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <DashboardUsageNudge
          viewsUsed={viewsUsed}
          viewsLimit={limits.maxViewsPerMonth}
          booksUsed={booksUsed}
          booksLimit={limits.maxBooks}
          plan={plan}
        />
        {children}
      </main>
    </div>
  )
}
