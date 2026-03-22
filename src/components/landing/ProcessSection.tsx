'use client'

import { HardDrive, MousePointerClick, Globe } from 'lucide-react'
import { InView } from '@/components/ui/in-view'
import { motion } from 'motion/react'
import type { Dictionary } from '@/i18n/get-dictionary'

const stepIcons = [HardDrive, MousePointerClick, Globe]

type Props = {
  t: Dictionary['landing']['process']
}

export function ProcessSection({ t }: Props) {
  return (
    <section id="process" className="border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">{t.subtitle}</p>
        </InView>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {t.steps.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <InView
                key={step.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
              >
                <motion.div
                  className="group relative rounded-xl border border-white/5 bg-neutral-900/50 p-8 transition-colors hover:border-white/10"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                    <Icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400">{step.description}</p>
                </motion.div>
              </InView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
