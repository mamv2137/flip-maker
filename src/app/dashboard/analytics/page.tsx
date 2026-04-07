import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { getPlanLimits, type Plan } from '@/lib/plans'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, BookOpen, BarChart3, Gauge } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get user plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan || 'free') as Plan
  const limits = getPlanLimits(plan)

  // Gate: free users can't access analytics
  if (!limits.hasAnalytics) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <BarChart3 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Upgrade to the Creator plan to unlock analytics and track your books&apos; performance.
        </p>
        <Button asChild>
          <Link href="/dashboard">Upgrade plan</Link>
        </Button>
      </div>
    )
  }

  // Fetch all creator's books
  const { data: books } = await supabase
    .from('books')
    .select('id, title, slug, is_published, cover_image_url')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const bookIds = (books ?? []).map((b) => b.id)
  const publishedCount = (books ?? []).filter((b) => b.is_published).length

  // Current month views
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: currentMonthViews } = await supabase.rpc('get_creator_monthly_views', {
    p_creator_id: user.id,
    p_month: currentMonth,
  })
  const viewsThisMonth = currentMonthViews || 0

  // Last 12 months view data
  const monthLabels: string[] = []
  const monthKeys: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(d.toISOString().slice(0, 7))
    monthLabels.push(d.toLocaleDateString('en', { month: 'short' }))
  }

  // Fetch view counts for last 12 months across all books
  let monthlyData: Record<string, number> = {}
  if (bookIds.length > 0) {
    const { data: viewCounts } = await supabase
      .from('book_view_counts')
      .select('month, view_count, book_id')
      .in('book_id', bookIds)
      .in('month', monthKeys)

    for (const row of viewCounts ?? []) {
      monthlyData[row.month] = (monthlyData[row.month] || 0) + row.view_count
    }
  }

  const chartValues = monthKeys.map((k) => monthlyData[k] || 0)
  const maxChart = Math.max(...chartValues, 1)
  const totalViews = chartValues.reduce((sum, v) => sum + v, 0)

  // Previous month for comparison
  const prevMonth = monthKeys[monthKeys.length - 2]
  const prevMonthViews = monthlyData[prevMonth] || 0
  const viewsChange = prevMonthViews > 0
    ? Math.round(((viewsThisMonth - prevMonthViews) / prevMonthViews) * 100)
    : viewsThisMonth > 0 ? 100 : 0

  // Top books by total views
  let topBooks: { id: string; title: string; slug: string; totalViews: number }[] = []
  if (bookIds.length > 0) {
    const { data: bookViews } = await supabase
      .from('book_view_counts')
      .select('book_id, view_count')
      .in('book_id', bookIds)

    const bookViewTotals: Record<string, number> = {}
    for (const row of bookViews ?? []) {
      bookViewTotals[row.book_id] = (bookViewTotals[row.book_id] || 0) + row.view_count
    }

    topBooks = (books ?? [])
      .map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        totalViews: bookViewTotals[b.id] || 0,
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5)
  }

  // Plan usage percentage
  const usagePercent = Math.min(Math.round((viewsThisMonth / limits.maxViewsPerMonth) * 100), 100)

  const stats = [
    {
      title: 'Views this month',
      value: viewsThisMonth.toLocaleString(),
      subtitle: viewsChange !== 0
        ? `${viewsChange > 0 ? '+' : ''}${viewsChange}% vs last month`
        : 'No data last month',
      trend: viewsChange >= 0 ? 'up' : 'down',
      icon: Eye,
    },
    {
      title: 'Total views',
      value: totalViews.toLocaleString(),
      subtitle: 'Last 12 months',
      trend: 'up',
      icon: BarChart3,
    },
    {
      title: 'Books published',
      value: publishedCount.toString(),
      subtitle: `${(books ?? []).length} total`,
      trend: 'up',
      icon: BookOpen,
    },
    {
      title: 'Plan usage',
      value: `${usagePercent}%`,
      subtitle: `${viewsThisMonth.toLocaleString()} / ${limits.maxViewsPerMonth.toLocaleString()} views`,
      trend: usagePercent > 80 ? 'down' : 'up',
      icon: Gauge,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your books&apos; performance and reader engagement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <stat.icon className="text-primary h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Top books */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Views chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Views over time</CardTitle>
          </CardHeader>
          <CardContent>
            {totalViews === 0 ? (
              <div className="flex h-52 items-center justify-center">
                <p className="text-muted-foreground text-sm">No views yet. Share your books to get started.</p>
              </div>
            ) : (
              <div className="flex h-52 items-end gap-2">
                {chartValues.map((value, i) => (
                  <div key={monthKeys[i]} className="group flex flex-1 flex-col items-center gap-1">
                    <span className="text-muted-foreground mb-1 hidden text-[10px] font-medium group-hover:block">
                      {value}
                    </span>
                    <div
                      className="bg-primary/20 hover:bg-primary/40 w-full min-h-[2px] rounded-t transition-colors"
                      style={{ height: `${(value / maxChart) * 100}%` }}
                    />
                    <span className="text-muted-foreground text-[10px]">{monthLabels[i]}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top books */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top books</CardTitle>
          </CardHeader>
          <CardContent>
            {topBooks.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No books yet.</p>
            ) : (
              <div className="space-y-4">
                {topBooks.map((book, i) => (
                  <div key={book.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-5 text-sm font-medium">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/books/${book.id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {book.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {book.totalViews.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan usage bar */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Monthly view usage</CardTitle>
          <Badge variant={usagePercent > 80 ? 'destructive' : 'secondary'}>
            {plan}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="bg-muted h-3 overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{viewsThisMonth.toLocaleString()} views used</span>
              <span>{limits.maxViewsPerMonth.toLocaleString()} limit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
