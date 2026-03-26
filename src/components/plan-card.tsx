'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Check, ArrowRight, Settings, AlertTriangle, Calendar, Clock, CircleDot } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getPlanLimits, PLAN_PRICES, type Plan } from '@/lib/plans'
import { polarProducts } from '@/lib/polar-products'

function CancelButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-destructive">
          Cancel subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancel your subscription?
          </DialogTitle>
          <DialogDescription>
            If you cancel, your plan will downgrade to Free at the end of your current billing period. You&apos;ll lose access to:
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-red-400">&#x2717;</span> Unlimited books (limited to 3)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">&#x2717;</span> Extended monthly views
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">&#x2717;</span> Password protection & private access
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">&#x2717;</span> Watermark-free reader
          </li>
        </ul>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Keep my plan
          </Button>
          <Button variant="destructive" asChild className="flex-1">
            <Link href="/api/portal">
              Cancel subscription
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const planLabels: Record<Plan, string> = {
  free: 'Free',
  creator: 'Creator',
  pro_seller: 'Pro Seller',
  agency: 'Agency',
}

const planColors: Record<Plan, string> = {
  free: 'bg-neutral-500',
  creator: 'bg-blue-500',
  pro_seller: 'bg-emerald-500',
  agency: 'bg-violet-500',
}

type PlanCardProps = {
  plan: string
  userEmail: string
  subscriptionStatus: string | null
  currentPeriodEnd: string | null
  createdAt: string | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-500' },
  trialing: { label: 'Trial', color: 'text-blue-500' },
  past_due: { label: 'Past due', color: 'text-amber-500' },
  canceled: { label: 'Canceled', color: 'text-red-500' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PlanCard({ plan, userEmail, subscriptionStatus, currentPeriodEnd, createdAt }: PlanCardProps) {
  const currentPlan = (plan || 'free') as Plan
  const limits = getPlanLimits(currentPlan)
  const price = PLAN_PRICES[currentPlan]
  const isFree = currentPlan === 'free'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Your Plan</CardTitle>
          <Badge className={`${planColors[currentPlan]} text-white`}>
            {planLabels[currentPlan]}
          </Badge>
        </div>
        <CardDescription>
          {isFree
            ? 'You are on the free plan with limited features.'
            : `You are on the ${planLabels[currentPlan]} plan ($${price.monthly}/mo).`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Books</span>
            <span className="font-medium">
              {limits.maxBooks === Infinity ? 'Unlimited' : limits.maxBooks}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Views/month</span>
            <span className="font-medium">{limits.maxViewsPerMonth.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className={`h-3.5 w-3.5 ${limits.hasWatermark ? 'text-red-400' : 'text-emerald-500'}`} />
            <span className="text-muted-foreground text-xs">
              {limits.hasWatermark ? 'Watermark on reader' : 'No watermark'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className={`h-3.5 w-3.5 ${limits.hasPasswordProtection ? 'text-emerald-500' : 'text-neutral-400'}`} />
            <span className="text-muted-foreground text-xs">
              Password protection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className={`h-3.5 w-3.5 ${limits.hasAnalytics ? 'text-emerald-500' : 'text-neutral-400'}`} />
            <span className="text-muted-foreground text-xs">
              Analytics
            </span>
          </div>
        </div>

        {/* Subscription details (paid plans only) */}
        {!isFree && subscriptionStatus && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CircleDot className="h-3.5 w-3.5" />
                  Status
                </span>
                <span className={`font-medium ${statusLabels[subscriptionStatus]?.color || 'text-muted-foreground'}`}>
                  {statusLabels[subscriptionStatus]?.label || subscriptionStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Started
                </span>
                <span className="font-medium">{formatDate(createdAt)}</span>
              </div>
              {currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {subscriptionStatus === 'canceled' ? 'Access until' : 'Renews on'}
                  </span>
                  <span className="font-medium">{formatDate(currentPeriodEnd)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {isFree ? (
          <Button className="btn-cta w-full gap-2" asChild>
            <Link href={`/api/checkout?products=${polarProducts.creator}&customerEmail=${encodeURIComponent(userEmail)}`}>
              <Zap className="h-4 w-4" />
              Upgrade your plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/api/portal">
                <Settings className="h-4 w-4" />
                Manage subscription
              </Link>
            </Button>
            <CancelButton />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
