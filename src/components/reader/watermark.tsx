'use client'

import { BookOpen } from 'lucide-react'

export function Watermark() {
  return (
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
  )
}
