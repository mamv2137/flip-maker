'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { BookOpen, Zap, Shield, ArrowRight } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndOfBookCta({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <BookOpen className="h-6 w-6 text-emerald-500" />
          </div>
          <DialogTitle className="text-xl">Create your own flipbook</DialogTitle>
          <DialogDescription>
            Turn any PDF into an interactive reading experience like this one. Free forever.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <Zap className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Ready in seconds from Google Drive</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>3D page-flip effect that impresses</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Password protection and private access</span>
          </div>
        </div>

        <RainbowButton asChild size="lg" className="mt-2 h-auto w-full min-h-11 rounded-full py-3 text-base font-semibold">
          <Link href="/auth/sign-up?ref=end-of-book">
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </RainbowButton>

        <p className="text-center text-xs text-muted-foreground">
          No credit card required
        </p>
      </DialogContent>
    </Dialog>
  )
}
