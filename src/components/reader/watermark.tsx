'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

export function Watermark() {
  return (
    <>
      {/* Center stamp — purely visual, no interaction, no touch blocking */}
      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center select-none">
        <div className="opacity-[0.12]">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-20 w-20 text-neutral-500 sm:h-32 sm:w-32" strokeWidth={1} />
            <span className="text-base font-bold tracking-widest text-neutral-500 uppercase sm:text-xl">
              Bukify
            </span>
          </div>
        </div>
      </div>

      {/* Bottom badge with shimmer — only this is clickeable */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <Link
          href="/"
          target="_blank"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-2 backdrop-blur-sm transition-all hover:bg-black/90 hover:border-white/20"
        >
          <BookOpen className="h-4 w-4 text-emerald-400" />
          <AnimatedShinyText shimmerWidth={80} className="text-xs font-medium">
            Powered by Bukify
          </AnimatedShinyText>
        </Link>
      </div>
    </>
  )
}
