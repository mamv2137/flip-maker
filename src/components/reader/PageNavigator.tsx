'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  currentPage: number
  totalPages: number
  onNext: () => void
  onPrev: () => void
}

export function PageNavigator({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}: Props) {
  return (
    <div className="border-t">
      <div className="flex h-12 items-center justify-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onPrev}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-muted-foreground min-w-[80px] text-center text-sm">
          {currentPage + 1} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
