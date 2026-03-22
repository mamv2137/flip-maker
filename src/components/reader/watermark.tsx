'use client'

import Link from 'next/link'

export function Watermark() {
  return (
    <div className="pointer-events-auto fixed bottom-3 right-3 z-50">
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-medium text-white/70 backdrop-blur-sm transition-colors hover:bg-black/90 hover:text-white"
      >
        Powered by Flipbooks
      </Link>
    </div>
  )
}
