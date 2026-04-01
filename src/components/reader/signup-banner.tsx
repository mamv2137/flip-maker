'use client'

import { useState } from 'react'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

export function SignupBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        className="relative z-40 flex items-center justify-center gap-3 border-b bg-emerald-500 px-4 py-2 text-white"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Sparkles className="hidden h-4 w-4 shrink-0 sm:block" />
        <p className="text-xs font-medium sm:text-sm">
          Create your own interactive books on Bukify — free, from Google Drive
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-1 bg-white/20 px-3 text-xs text-white hover:bg-white/30"
          asChild
        >
          <Link href="/auth/sign-up">
            Get started
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 transition-colors hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
