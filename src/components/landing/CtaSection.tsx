'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { InView } from '@/components/ui/in-view'
import { motion } from 'motion/react'

type Props = {
  isAuthenticated: boolean
}

export function CtaSection({ isAuthenticated }: Props) {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <InView
        variants={{
          hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Your PDFs deserve a better reader
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400">
          Connect Google Drive, pick your PDF, and share a beautiful interactive
          flipbook — free, in seconds. No uploads, no complexity.
        </p>
        <div className="mt-10">
          {isAuthenticated ? (
            <Button size="lg" asChild className="bg-white px-8 text-black hover:bg-neutral-200">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild className="bg-white px-8 text-black hover:bg-neutral-200">
              <Link href="/auth/sign-up">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <p className="mt-4 text-sm text-neutral-600">
          Free forever. No credit card. No file uploads.
        </p>
      </InView>
    </section>
  )
}
