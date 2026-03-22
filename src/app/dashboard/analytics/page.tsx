'use client'

import { motion } from 'motion/react'
import { NotifyButton } from '@/components/notify-button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Eye,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Bell,
} from 'lucide-react'

// Dummy data
const stats = [
  {
    title: 'Total Views',
    value: '12,847',
    change: '+23%',
    trend: 'up' as const,
    icon: Eye,
  },
  {
    title: 'Active Readers',
    value: '1,429',
    change: '+12%',
    trend: 'up' as const,
    icon: Users,
  },
  {
    title: 'Books Published',
    value: '8',
    change: '+2',
    trend: 'up' as const,
    icon: BookOpen,
  },
  {
    title: 'Avg. Read Time',
    value: '4m 32s',
    change: '-8%',
    trend: 'down' as const,
    icon: Clock,
  },
]

const chartBars = [35, 52, 41, 67, 45, 73, 58, 82, 63, 91, 77, 85]
const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']

const topBooks = [
  { title: 'Marketing Digital 2026', views: 4231, rating: 4.8 },
  { title: 'Recetas Saludables Vol.2', views: 3102, rating: 4.6 },
  { title: 'Portfolio - Design Studio', views: 2847, rating: 4.9 },
  { title: 'Guia de Inversiones', views: 1590, rating: 4.3 },
  { title: 'Comics Issue #12', views: 1077, rating: 4.7 },
]

const recentActivity = [
  { event: 'New reader accessed', book: 'Marketing Digital 2026', time: '2 min ago' },
  { event: 'Book rated 5 stars', book: 'Portfolio - Design Studio', time: '15 min ago' },
  { event: 'Reader finished', book: 'Recetas Saludables Vol.2', time: '1 hr ago' },
  { event: 'New reader accessed', book: 'Guia de Inversiones', time: '3 hr ago' },
  { event: 'Book shared via link', book: 'Marketing Digital 2026', time: '5 hr ago' },
]

export default function AnalyticsPage() {
  const maxBar = Math.max(...chartBars)

  return (
    <div className="relative min-h-[calc(100vh-10rem)]">
      {/* Analytics content (blurred) */}
      <div className="pointer-events-none max-h-[calc(100vh-10rem)] select-none overflow-hidden blur-[2px]" aria-hidden="true">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your flipbooks performance and reader engagement.
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
                  <div className="mt-3 flex items-center gap-1 text-xs">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        stat.trend === 'up'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + Top books */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Views chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-52 items-end gap-2">
                  {chartBars.map((value, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="bg-primary/20 hover:bg-primary/40 w-full rounded-t transition-colors"
                        style={{ height: `${(value / maxBar) * 100}%` }}
                      />
                      <span className="text-muted-foreground text-[10px]">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top books */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topBooks.map((book, i) => (
                    <div key={book.title} className="flex items-center gap-3">
                      <span className="text-muted-foreground w-5 text-sm font-medium">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{book.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {book.views.toLocaleString()} views
                        </p>
                      </div>
                      <div className="text-xs text-amber-500">{book.rating}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <Bell className="text-muted-foreground h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-muted-foreground">{activity.event}</span>{' '}
                      <span className="font-medium">{activity.book}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="mx-4 flex max-w-md flex-col items-center rounded-2xl border bg-background/95 p-8 text-center shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 150 }}
        >
          <motion.div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          >
            <Sparkles className="h-7 w-7 text-emerald-500" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            Analytics Coming Soon
          </motion.h2>

          <motion.p
            className="text-muted-foreground mt-3 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            We&apos;re building powerful insights to help you understand your readers.
            Track views, engagement, ratings, and more — all in one place.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <NotifyButton feature="analytics" />
            <p className="text-muted-foreground text-xs">
              You&apos;ll be the first to know.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
