'use client'

import { Star } from 'lucide-react'
import { cn } from '@/utils/tailwind'

type StarRatingProps = {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  interactive?: boolean
  onRate?: (rating: number) => void
}

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating)
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(i + 1)}
            className={cn(
              'transition-colors',
              interactive && 'cursor-pointer hover:text-amber-400',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-300 dark:text-neutral-600',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
