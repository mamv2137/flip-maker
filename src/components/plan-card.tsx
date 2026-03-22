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
import { Zap, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPlanLimits, PLAN_PRICES, type Plan } from '@/lib/plans'

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

export function PlanCard({ plan }: { plan: string }) {
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

        {isFree && (
          <Button className="btn-cta w-full gap-2" asChild>
            <Link href="/#pricing">
              <Zap className="h-4 w-4" />
              Upgrade your plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
