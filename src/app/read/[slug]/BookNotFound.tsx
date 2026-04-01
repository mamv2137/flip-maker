'use client'

import { motion } from 'motion/react'
import { BookX, LogIn, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function BookNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="flex max-w-md flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <BookX className="h-10 w-10 text-muted-foreground" />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Book not found
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-3 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          This flipbook doesn&apos;t exist or hasn&apos;t been published yet.
          If you received a link, it may have been removed by the creator.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in to check access
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Go home
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-10 rounded-xl border bg-muted/30 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-medium">Create your own book on Bukify</p>
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            Turn your Google Drive PDFs into premium interactive reading experiences.
            Free, no uploads needed.
          </p>
          <Button size="sm" variant="link" className="mt-2 h-auto p-0 text-xs" asChild>
            <Link href="/auth/sign-up">
              Get started free
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
