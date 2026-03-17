'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY_PREFIX = 'flipbooks-reading-position-'

function getStoredPage(bookSlug: string | undefined): number | null {
  if (!bookSlug) return null
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + bookSlug)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed.page === 'number' && parsed.page > 0) {
        return parsed.page
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function useReadingPosition(bookSlug: string | undefined) {
  // Read from localStorage synchronously on first render (client only)
  const savedPage = useSyncExternalStore(
    () => () => {},
    () => getStoredPage(bookSlug),
    () => null,
  )

  const [cleared, setCleared] = useState(false)

  const savePosition = useCallback(
    (page: number) => {
      if (!bookSlug) return
      try {
        localStorage.setItem(
          STORAGE_KEY_PREFIX + bookSlug,
          JSON.stringify({ page, timestamp: Date.now() }),
        )
      } catch {
        // ignore
      }
    },
    [bookSlug],
  )

  const clearPosition = useCallback(() => {
    if (!bookSlug) return
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + bookSlug)
    } catch {
      // ignore
    }
    setCleared(true)
  }, [bookSlug])

  return {
    savedPage: cleared ? null : savedPage,
    savePosition,
    clearPosition,
  }
}
