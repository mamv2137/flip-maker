'use client'

import { motion, AnimatePresence } from 'motion/react'
import {
  Lock,
  Mail,
  KeyRound,
  LogIn,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

type Props = {
  bookId: string
  bookTitle: string
  bookSlug: string
  visibility: 'private' | 'password'
  isLoggedIn: boolean
}

export function AccessGate({ bookId, bookTitle, bookSlug, visibility, isLoggedIn }: Props) {
  const [mode, setMode] = useState<'initial' | 'password' | 'email'>(
    visibility === 'password' ? 'password' : 'initial'
  )
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<'granted' | 'denied' | null>(null)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/books/${bookId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (data.valid) {
        // Set cookie for server to verify, then reload
        document.cookie = `book-pw-${bookId}=${password}; path=/read/${bookSlug}; max-age=86400; SameSite=Lax`
        window.location.reload()
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setEmailResult(null)

    try {
      const res = await fetch('/api/books/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), slug: bookSlug }),
      })
      const data = await res.json()
      setEmailResult(data.hasAccess ? 'granted' : 'denied')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="flex w-full max-w-md flex-col items-center text-center"
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
          {visibility === 'password' ? 'This book is protected' : 'This book is private'}
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-3 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="font-medium text-foreground">{bookTitle}</span>
          {visibility === 'password'
            ? ' requires a password to read. Enter the password provided by the creator.'
            : ' is only available to invited readers.'}
        </motion.p>

        {/* Access forms */}
        <motion.div
          className="mt-8 w-full space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Password form */}
          <AnimatePresence mode="wait">
            {mode === 'password' && (
              <motion.form
                key="password-form"
                className="w-full space-y-3 rounded-lg border p-4 text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePasswordSubmit}
              >
                <Label htmlFor="book-password" className="flex items-center gap-2 text-sm">
                  <KeyRound className="h-4 w-4" />
                  Enter password
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="book-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Book password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null) }}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enter'}
                  </Button>
                </div>
                {error && (
                  <motion.p
                    className="text-sm text-red-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
              </motion.form>
            )}

            {/* Email verification form */}
            {mode === 'email' && (
              <motion.form
                key="email-form"
                className="w-full space-y-3 rounded-lg border p-4 text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleEmailSubmit}
              >
                <Label htmlFor="access-email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  Verify your email
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="access-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailResult(null); setError(null) }}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                  </Button>
                </div>
                {emailResult === 'granted' && (
                  <motion.div
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Access confirmed! Sign in with this email to start reading.</span>
                  </motion.div>
                )}
                {emailResult === 'denied' && (
                  <motion.p
                    className="text-sm text-red-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No access found for this email. Contact the book creator for an invitation.
                  </motion.p>
                )}
                {error && (
                  <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Mode switcher buttons */}
          {visibility === 'private' && mode === 'initial' && (
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => setMode('email')}>
                <Mail className="mr-2 h-4 w-4" />
                Verify access with email
              </Button>
            </div>
          )}

          {visibility === 'password' && mode === 'password' && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setMode('email')}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Or verify with email instead
            </Button>
          )}

          {mode === 'email' && visibility === 'password' && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setMode('password')}
            >
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
              Or enter password instead
            </Button>
          )}

          {/* Sign in button */}
          {!isLoggedIn && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">or</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/auth/login?next=/read/${bookSlug}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to your account
                </Link>
              </Button>
            </>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10 w-full rounded-xl border bg-muted/30 p-5"
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
