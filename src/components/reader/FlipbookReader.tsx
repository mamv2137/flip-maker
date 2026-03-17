'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
import { FlatReader } from './FlatReader'
import { ReaderToolbar } from './ReaderToolbar'
import { PageNavigator } from './PageNavigator'

const PageFlipReader = dynamic(() => import('./PageFlipReader'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-muted-foreground">Loading reader...</p>
    </div>
  ),
})

export type BookPage = {
  type: 'html' | 'image'
  content: string
  pageNumber: number
}

export type FlipControl = {
  next: () => void
  prev: () => void
  goTo: (page: number) => void
}

type Props = {
  title: string
  pages: BookPage[]
  defaultFlipEnabled: boolean
}

export function FlipbookReader({ title, pages, defaultFlipEnabled }: Props) {
  const [flipEnabled, setFlipEnabled] = useState(defaultFlipEnabled)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const flipControlRef = useRef<FlipControl | null>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const goNext = useCallback(() => {
    if (flipEnabled && flipControlRef.current) {
      flipControlRef.current.next()
    } else {
      setCurrentPage((p) => Math.min(p + 1, pages.length - 1))
    }
  }, [flipEnabled, pages.length])

  const goPrev = useCallback(() => {
    if (flipEnabled && flipControlRef.current) {
      flipControlRef.current.prev()
    } else {
      setCurrentPage((p) => Math.max(p - 1, 0))
    }
  }, [flipEnabled])

  return (
    <div className="bg-background flex h-screen flex-col">
      <ReaderToolbar
        title={title}
        flipEnabled={flipEnabled}
        isFullscreen={isFullscreen}
        onToggleFlip={() => setFlipEnabled(!flipEnabled)}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {flipEnabled ? (
          <PageFlipReader
            pages={pages}
            onPageChange={setCurrentPage}
            controlRef={flipControlRef}
          />
        ) : (
          <FlatReader
            pages={pages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <PageNavigator
        currentPage={currentPage}
        totalPages={pages.length}
        onNext={goNext}
        onPrev={goPrev}
      />
    </div>
  )
}
