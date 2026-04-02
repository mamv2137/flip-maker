'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, HardDrive } from 'lucide-react'
import { motion } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import type { Dictionary } from '@/i18n/get-dictionary'

type Props = {
  isAuthenticated: boolean
  t: Dictionary['landing']['hero']
}

export function HeroSection({ isAuthenticated, t }: Props) {
  return (
    <section className="relative overflow-hidden pb-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
        }}
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-4xl px-4 pb-8 pt-24 text-center sm:px-6 sm:pt-32">
        <motion.div
          className="mb-8 inline-flex"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
            <AnimatedShinyText shimmerWidth={70}>{t.badge}</AnimatedShinyText>
            <ArrowRight className="h-3 w-3 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
          {t.headline.split(' ').map((word, index) => (
            <motion.span
              key={index}
              className="mr-3 inline-block"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1, ease: 'easeInOut' }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, delay: 0.7, ease: 'easeInOut' }}
          >
            {t.headlineAccent}
          </motion.span>
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          {t.subtitle}
        </motion.p>

        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          {isAuthenticated ? (
            <Button size="lg" asChild className="bg-emerald-500 px-8 text-white hover:bg-emerald-600">
              <Link href="/dashboard">
                {t.ctaAuth}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <HoverBorderGradient
              as={Link}
              href="/auth/sign-up"
              containerClassName="rounded-full"
              className="flex items-center gap-2 bg-black px-8 py-3 text-base font-semibold text-white dark:bg-black"
              duration={1.2}
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </HoverBorderGradient>
          )}
        </motion.div>

        <motion.p
          className="mt-4 text-xs text-neutral-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {t.footnote}
        </motion.p>
      </div>

      <motion.div
        className="relative mx-auto max-w-5xl px-4 sm:px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.4, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-t-xl border border-white/10 bg-neutral-900/50 shadow-2xl shadow-emerald-500/5">
          <BorderBeam duration={8} size={300} colorFrom="#10b981" colorTo="#34d399" />
          <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-neutral-600">bukify.io/dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-3 p-6">
            <div className="col-span-1 space-y-3">
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="h-3 w-16 rounded bg-white/5" />
              <div className="h-3 w-24 rounded bg-white/5" />
              <div className="h-3 w-14 rounded bg-white/5" />
            </div>
            <div className="col-span-3 space-y-4">
              {['emerald', 'violet', 'amber'].map((color) => (
                <div key={color} className="flex gap-3">
                  <div className={`h-20 w-20 rounded-lg bg-${color}-500/10`} />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-48 rounded bg-white/10" />
                    <div className="h-3 w-64 rounded bg-white/5" />
                    <div className="h-3 w-32 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </motion.div>
    </section>
  )
}
