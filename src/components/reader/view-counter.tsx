'use client'

import { useEffect } from 'react'

/**
 * Fires a single view count when the reader loads.
 * Does not re-fire on page turns or re-renders.
 */
export function ViewCounter({ bookId }: { bookId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    }).catch(() => {
      // Silent fail — view counting is not critical
    })
  }, [bookId])

  return null
}
