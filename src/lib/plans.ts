export type Plan = 'free' | 'creator' | 'pro_seller' | 'agency'

export type PlanLimits = {
  maxBooks: number
  maxViewsPerMonth: number
  hasWatermark: boolean
  hasPasswordProtection: boolean
  hasAnalytics: boolean
  hasCustomDomain: boolean
  hasR2Backup: boolean
  hasIntegrations: boolean
  hasWhiteLabelAPI: boolean
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxBooks: 3,
    maxViewsPerMonth: 200,
    hasWatermark: true,
    hasPasswordProtection: false,
    hasAnalytics: false,
    hasCustomDomain: false,
    hasR2Backup: false,
    hasIntegrations: false,
    hasWhiteLabelAPI: false,
  },
  creator: {
    maxBooks: Infinity,
    maxViewsPerMonth: 2_000,
    hasWatermark: false,
    hasPasswordProtection: true,
    hasAnalytics: true,
    hasCustomDomain: false,
    hasR2Backup: false,
    hasIntegrations: false,
    hasWhiteLabelAPI: false,
  },
  pro_seller: {
    maxBooks: Infinity,
    maxViewsPerMonth: 10_000,
    hasWatermark: false,
    hasPasswordProtection: true,
    hasAnalytics: true,
    hasCustomDomain: true,
    hasR2Backup: true,
    hasIntegrations: true,
    hasWhiteLabelAPI: false,
  },
  agency: {
    maxBooks: Infinity,
    maxViewsPerMonth: 50_000,
    hasWatermark: false,
    hasPasswordProtection: true,
    hasAnalytics: true,
    hasCustomDomain: true,
    hasR2Backup: true,
    hasIntegrations: true,
    hasWhiteLabelAPI: true,
  },
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export const OVERAGE_COST_PER_VIEW = 0.005 // $0.005 per extra view

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  creator: { monthly: 7, yearly: 70 },
  pro_seller: { monthly: 15, yearly: 150 },
  agency: { monthly: 39, yearly: 390 },
} as const
