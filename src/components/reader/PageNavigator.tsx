'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

type Props = {
  currentPage: number
  totalPages: number
  onNext: () => void
  onPrev: () => void
  thumbnailsOpen: boolean
  onToggleThumbnails: () => void
}

export function PageNavigator({
  currentPage,
  totalPages,
  onNext,
  onPrev,
  thumbnailsOpen,
  onToggleThumbnails,
}: Props) {
  return (
    <>
      {/* Side arrows overlaid on the book */}
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className="fixed left-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white disabled:opacity-0 sm:left-3 sm:p-2"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages - 1}
        className="fixed right-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white disabled:opacity-0 sm:right-3 sm:p-2"
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Bottom bar — compact, just page count + thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-3 bg-gradient-to-t from-black/40 to-transparent px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
          onClick={onToggleThumbnails}
          title="Page thumbnails"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs font-medium text-white/70">
          {currentPage + 1} / {totalPages}
        </span>
      </div>
    </>
  )
}
