'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatReader } from './FlatReader'
import { ReaderToolbar } from './ReaderToolbar'
import { PageNavigator } from './PageNavigator'
import { ReadingProgressBar } from './ReadingProgressBar'
import { TableOfContents } from './TableOfContents'
import { PageThumbnails } from './PageThumbnails'
import { useReadingPosition } from '@/hooks/useReadingPosition'
import { extractHeadings } from '@/lib/extract-headings'

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
  bookSlug?: string
  showBackButton?: boolean
}

export function FlipbookReader({ title, pages, defaultFlipEnabled, bookSlug, showBackButton = true }: Props) {
  const [flipEnabled, setFlipEnabled] = useState(defaultFlipEnabled)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [zoom, setZoom] = useState(1)
  const [tocOpen, setTocOpen] = useState(false)
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false)
  const flipControlRef = useRef<FlipControl | null>(null)

  const { savedPage, savePosition, clearPosition } = useReadingPosition(bookSlug)
  const [resumeDismissed, setResumeDismissed] = useState(false)

  const showResumePrompt =
    !resumeDismissed &&
    savedPage !== null &&
    savedPage > 0 &&
    savedPage < pages.length

  const hasHtmlPages = useMemo(() => pages.some((p) => p.type === 'html'), [pages])
  const headings = useMemo(() => extractHeadings(pages), [pages])

  // Save position on page change
  useEffect(() => {
    if (currentPage > 0) {
      savePosition(currentPage)
    }
  }, [currentPage, savePosition])

  const handleResume = useCallback(() => {
    if (savedPage !== null) {
      setCurrentPage(savedPage)
      if (flipEnabled && flipControlRef.current) {
        flipControlRef.current.goTo(savedPage)
      }
    }
    setResumeDismissed(true)
  }, [savedPage, flipEnabled])

  const handleDismissResume = useCallback(() => {
    setResumeDismissed(true)
    clearPosition()
  }, [clearPosition])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, pages.length - 1))
      setCurrentPage(clamped)
      if (flipEnabled && flipControlRef.current) {
        flipControlRef.current.goTo(clamped)
      }
    },
    [flipEnabled, pages.length],
  )

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
      <ReadingProgressBar currentPage={currentPage} totalPages={pages.length} />

      <ReaderToolbar
        title={title}
        flipEnabled={flipEnabled}
        isFullscreen={isFullscreen}
        onToggleFlip={() => setFlipEnabled(!flipEnabled)}
        onToggleFullscreen={toggleFullscreen}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        zoom={zoom}
        onZoomChange={setZoom}
        hasHtmlPages={hasHtmlPages}
        tocOpen={tocOpen}
        onToggleToc={() => setTocOpen(!tocOpen)}
        hasHeadings={headings.length > 0}
        showBackButton={showBackButton}
      />

      <div className="relative flex flex-1 items-start justify-center overflow-hidden sm:items-center">
        {tocOpen && (
          <TableOfContents
            headings={headings}
            currentPage={currentPage}
            onNavigate={goToPage}
            onClose={() => setTocOpen(false)}
          />
        )}

        {/* Resume prompt removed — auto-resumes silently via saved position */}

        {flipEnabled ? (
          <PageFlipReader
            pages={pages}
            onPageChange={setCurrentPage}
            controlRef={flipControlRef}
            fontSize={fontSize}
            zoom={zoom}
          />
        ) : (
          <FlatReader
            pages={pages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            fontSize={fontSize}
            zoom={zoom}
          />
        )}
      </div>

      {thumbnailsOpen && (
        <PageThumbnails
          pages={pages}
          currentPage={currentPage}
          onNavigate={goToPage}
        />
      )}

      <PageNavigator
        currentPage={currentPage}
        totalPages={pages.length}
        onNext={goNext}
        onPrev={goPrev}
        thumbnailsOpen={thumbnailsOpen}
        onToggleThumbnails={() => setThumbnailsOpen(!thumbnailsOpen)}
      />
    </div>
  )
}
