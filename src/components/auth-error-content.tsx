'use client'

import { motion } from 'motion/react'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import Link from 'next/link'
import { use } from 'react'

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('no token hash') || lower.includes('invalid confirmation'))
    return 'This confirmation link is invalid or has expired.'
  if (lower.includes('otp') || lower.includes('expired'))
    return 'This link has expired. Please request a new one.'
  if (lower.includes('access_denied'))
    return 'Access was denied. You may have cancelled the sign-in.'
  if (lower.includes('server_error'))
    return 'Something went wrong on our end. Please try again.'
  return raw
}

export function AuthErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = use(searchParams)
  const rawError = params?.error || 'An unexpected error occurred'
  const message = friendlyError(rawError)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card>
        <CardHeader className="text-center">
          <motion.div
            className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <CardDescription className="mt-2">{message}</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              If this keeps happening, try clearing your browser cookies or using a different browser.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
