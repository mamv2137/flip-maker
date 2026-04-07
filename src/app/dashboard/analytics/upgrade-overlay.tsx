'use client'

import { motion } from 'motion/react'
import { Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AnalyticsUpgradeOverlay() {
  return (
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
          <Lock className="h-7 w-7 text-emerald-500" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          Unlock Analytics
        </motion.h2>

        <motion.p
          className="text-muted-foreground mt-3 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          See how your books perform. Track views, discover your top content, and understand your readers — all in real time.
        </motion.p>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <Button asChild size="lg" className="px-8">
            <Link href="/#pricing">
              Upgrade to Creator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-muted-foreground mt-3 text-xs">
            Starting at $7/month
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
