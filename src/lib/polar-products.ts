const isDev = process.env.NODE_ENV !== 'production'

// Sandbox product IDs (for development/testing)
const SANDBOX_PRODUCTS = {
  creator: '8f296505-6f50-4b3a-a9b3-0b67b0609901',
  pro_seller: 'cb1d39c2-895e-4d28-b28c-bd605072d936',
  // agency: TBD
} as const

// Production product IDs
const PRODUCTION_PRODUCTS = {
  creator: '8c2cbb56-9503-45ad-bf15-e1ee72c50ebe',
  pro_seller: '56c2f1d8-6c7d-4ee2-a09a-e24c0612615c',
  // agency: TBD
} as const

export const polarProducts = isDev ? SANDBOX_PRODUCTS : PRODUCTION_PRODUCTS

export type PolarPlanKey = keyof typeof SANDBOX_PRODUCTS
