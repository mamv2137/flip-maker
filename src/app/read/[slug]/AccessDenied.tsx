'use client'

import { motion } from 'motion/react'
import { Lock, LogIn, Mail, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

type Props = {
  bookTitle: string
  bookSlug: string
  isLoggedIn: boolean
}

export function AccessDenied({ bookTitle, bookSlug, isLoggedIn }: Props) {
  const [showEmailCheck, setShowEmailCheck] = useState(false)
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<'granted' | 'denied' | null>(null)

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setChecking(true)
    setResult(null)

    try {
      const res = await fetch(`/api/books/check-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), slug: bookSlug }),
      })
      const data = await res.json()
      setResult(data.hasAccess ? 'granted' : 'denied')
    } catch {
      setResult('denied')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="flex max-w-md flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Lock icon */}
        <motion.div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Lock className="h-10 w-10 text-amber-500" />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          This book is private
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-3 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="font-medium text-foreground">{bookTitle}</span> is only
          available to invited readers. If you have access, sign in or verify your email below.
        </motion.p>

        {/* Actions */}
        <motion.div
          className="mt-8 flex w-full flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {!isLoggedIn && (
            <Button asChild className="w-full">
              <Link href={`/auth/login?next=/read/${bookSlug}`}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in to access
              </Link>
            </Button>
          )}

          {!showEmailCheck ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowEmailCheck(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Verify access with email
            </Button>
          ) : (
            <motion.form
              className="w-full space-y-3 rounded-lg border p-4 text-left"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              onSubmit={handleCheckEmail}
            >
              <Label htmlFor="access-email" className="text-sm">
                Enter the email you were invited with
              </Label>
              <div className="flex gap-2">
                <Input
                  id="access-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setResult(null) }}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={checking}>
                  {checking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </Button>
              </div>
              {result === 'granted' && (
                <motion.div
                  className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Check className="h-4 w-4" />
                  Access confirmed! Sign in with this email to read.
                </motion.div>
              )}
              {result === 'denied' && (
                <motion.p
                  className="text-sm text-red-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No access found for this email. Contact the book creator for an invitation.
                </motion.p>
              )}
            </motion.form>
          )}
        </motion.div>

        {/* CTA to create own flipbook */}
        <motion.div
          className="mt-10 w-full rounded-xl border bg-muted/30 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-medium">Create your own flipbook</p>
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            Turn your Google Drive PDFs into premium interactive flipbooks.
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
