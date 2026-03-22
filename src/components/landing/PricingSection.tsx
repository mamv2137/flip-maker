'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/in-view'
import { Button } from '@/components/ui/button'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Dictionary } from '@/i18n/get-dictionary'

type Props = {
  t: Dictionary['landing']['pricing']
}

const prices = {
  free: { monthly: 0, yearly: 0 },
  creator: { monthly: 7, yearly: 70 },
  pro_seller: { monthly: 15, yearly: 150 },
  agency: { monthly: 39, yearly: 390 },
}

const planKeys = ['free', 'creator', 'pro_seller' /* , 'agency' */] as const

export function PricingSection({ t }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-400">
            {t.badge}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            {t.subtitle}
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                billing === 'monthly'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                billing === 'yearly'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.yearly}
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                {t.yearlyDiscount}
              </span>
            </button>
          </div>
        </InView>

        {/* Cards */}
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {planKeys.map((key, index) => {
            const plan = t.plans[key]
            const price = prices[key]
            const isPopular = key === 'pro_seller'
            const isFree = key === 'free'
            const amount = billing === 'monthly' ? price.monthly : price.yearly
            const period = billing === 'monthly' ? t.perMonth : t.perYear

            return (
              <InView
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
              >
                <motion.div
                  className={`relative flex h-full flex-col rounded-xl border p-6 transition-colors ${
                    isPopular
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-white/5 bg-neutral-900/50 hover:border-white/10'
                  }`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                        <Sparkles className="h-3 w-3" />
                        {t.popular}
                      </span>
                    </div>
                  )}

                  {/* Plan info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="mt-1 text-sm text-neutral-400">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-white">
                      ${amount}
                    </span>
                    {!isFree && (
                      <span className="text-sm text-neutral-400">{period}</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Button
                      asChild
                      className={`w-full ${
                        isPopular
                          ? 'btn-cta'
                          : isFree
                            ? 'bg-white text-black hover:bg-neutral-200'
                            : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Link href="/auth/sign-up">
                        {isFree ? t.getStarted : t.upgrade}
                      </Link>
                    </Button>
                  </div>

                  {/* Features */}
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => {
                      const isComingSoon = feature.includes('próximamente') || feature.includes('coming soon')
                      return (
                        <li
                          key={feature}
                          className={`flex items-start gap-2 text-sm ${
                            isComingSoon ? 'text-neutral-600' : 'text-neutral-300'
                          }`}
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              isComingSoon ? 'text-neutral-700' : 'text-emerald-400'
                            }`}
                          />
                          {feature}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              </InView>
            )
          })}
        </div>

        {/* Overage note */}
        <InView
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-neutral-600">{t.overage}</p>
        </InView>
      </div>
    </section>
  )
}
