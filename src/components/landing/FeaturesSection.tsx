'use client'

import { HardDrive, BookOpen, Share2, Lock, Smartphone, ShieldCheck } from 'lucide-react'
import { InView } from '@/components/ui/in-view'
import { motion } from 'motion/react'

const features = [
  {
    icon: HardDrive,
    title: 'Straight from Google Drive',
    description:
      'Paste a Drive link and your flipbook is ready. No uploads, no storage limits. Your PDF stays in your Drive.',
    className: 'md:col-span-2 md:row-span-2',
    iconColor: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    icon: BookOpen,
    title: 'Realistic 3D Page Flip',
    description: 'Smooth, physics-based page turning that feels like a real book.',
    className: 'md:col-span-1',
    iconColor: 'text-blue-400 bg-blue-400/10',
  },
  {
    icon: Share2,
    title: 'Share with a Link',
    description: 'Every book gets a unique URL. Share via email, socials, or embed anywhere.',
    className: 'md:col-span-1',
    iconColor: 'text-violet-400 bg-violet-400/10',
  },
  {
    icon: Lock,
    title: 'Public or Private',
    description: 'Control who sees your content. Invite readers with magic links.',
    className: 'md:col-span-1',
    iconColor: 'text-amber-400 bg-amber-400/10',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Responsive with touch gestures. Looks great on any device.',
    className: 'md:col-span-1',
    iconColor: 'text-rose-400 bg-rose-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'Content Protection',
    description: 'Readers view through our secure reader. No downloads, no copies. Your content stays yours.',
    className: 'md:col-span-2',
    iconColor: 'text-cyan-400 bg-cyan-400/10',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
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
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Drive, Supercharged
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Turn any Google Drive PDF into a premium interactive flipbook. No uploads, no friction.
          </p>
        </InView>

        <div className="mt-16 grid gap-4 md:grid-cols-4 md:auto-rows-[180px]">
          {features.map((feature, index) => (
            <InView
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              className={feature.className}
            >
              <motion.div
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-neutral-900/50 p-6 transition-colors hover:border-white/10 hover:bg-neutral-900/80"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.iconColor}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.description}</p>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                </div>
              </motion.div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
