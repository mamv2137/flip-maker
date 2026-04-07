'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  viewsUsed: number
  viewsLimit: number
  booksUsed: number
  booksLimit: number
  plan: string
}

export function DashboardUsageNudge({ viewsUsed, viewsLimit, booksUsed, booksLimit, plan }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const viewPercent = Math.round((viewsUsed / viewsLimit) * 100)
  const booksAtLimit = booksLimit !== Infinity && booksUsed >= booksLimit
  const viewsNearLimit = viewPercent >= 80

  if (!viewsNearLimit && !booksAtLimit) return null

  const message = booksAtLimit
    ? `You've used all ${booksLimit} books on the ${plan} plan. Upgrade to create more.`
    : `You've used ${viewPercent}% of your monthly views (${viewsUsed.toLocaleString()} / ${viewsLimit.toLocaleString()}). Your readers may lose access soon.`

  return (
    <div className="relative mb-6 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
      <p className="flex-1 text-sm text-amber-700 dark:text-amber-400">
        {message}
      </p>
      <Button variant="outline" size="sm" asChild className="shrink-0 border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400">
        <Link href="/#pricing">
          Upgrade
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-amber-500/60 transition-colors hover:text-amber-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
