'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

export function MadeWithBadge() {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <Link
        href="/auth/sign-up?ref=reader"
        target="_blank"
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-black/90"
      >
        <BookOpen className="h-4 w-4 text-emerald-400" />
        <AnimatedShinyText shimmerWidth={80} className="text-xs font-medium">
          Made with Bukify
        </AnimatedShinyText>
      </Link>
    </div>
  )
}
