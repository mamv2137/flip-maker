'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/star-rating'

type Props = {
  bookId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RatingModal({ bookId, open, onOpenChange }: Props) {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingRating, setExistingRating] = useState<number | null>(null)

  // Check if user already rated this book
  useEffect(() => {
    if (!open) return
    fetch(`/api/books/${bookId}/rating`)
      .then((res) => res.json())
      .then((data) => {
        if (data.userRating) {
          setExistingRating(data.userRating)
          setRating(data.userRating)
        }
      })
      .catch(() => {})
  }, [bookId, open])

  const handleSubmit = useCallback(async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/books/${bookId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => onOpenChange(false), 1500)
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false)
    }
  }, [bookId, rating, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <DialogTitle>
            {submitted ? 'Thanks!' : existingRating ? 'Update your rating' : 'How was this book?'}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? 'Your rating has been saved.'
              : 'Tap a star to rate this book.'}
          </DialogDescription>
        </DialogHeader>

        {!submitted && (
          <div className="flex flex-col items-center gap-4 py-2">
            <StarRating
              rating={rating}
              size="md"
              interactive
              onRate={setRating}
            />
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Sending...' : existingRating ? 'Update' : 'Rate'}
            </Button>
          </div>
        )}

        {submitted && (
          <div className="flex justify-center py-4">
            <StarRating rating={rating} size="md" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
