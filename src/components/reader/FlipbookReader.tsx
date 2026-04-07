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
import { RatingModal } from './RatingModal'
import { EndOfBookCta } from './end-of-book-cta'

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
  bookId?: string
  bookSlug?: string
  showBackButton?: boolean
  isAuthenticated?: boolean
}

export function FlipbookReader({ title, pages, defaultFlipEnabled, bookId, bookSlug, showBackButton = true, isAuthenticated }: Props) {
  const [flipEnabled, setFlipEnabled] = useState(defaultFlipEnabled)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [zoom, setZoom] = useState(1)
  const [tocOpen, setTocOpen] = useState(false)
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ctaOpen, setCtaOpen] = useState(false)
  const endOfBookShownRef = useRef(false)
  const flipControlRef = useRef<FlipControl | null>(null)

  const { savePosition } = useReadingPosition(bookSlug)

  const hasHtmlPages = useMemo(() => pages.some((p) => p.type === 'html'), [pages])
  const headings = useMemo(() => extractHeadings(pages), [pages])

  // Save position on page change
  useEffect(() => {
    if (currentPage > 0) {
      savePosition(currentPage)
    }
  }, [currentPage, savePosition])

  // Show end-of-book modal when reaching the last page
  useEffect(() => {
    if (currentPage === pages.length - 1 && pages.length > 1 && !endOfBookShownRef.current) {
      endOfBookShownRef.current = true
      const timer = setTimeout(() => {
        if (isAuthenticated && bookId) {
          setRatingOpen(true)
        } else {
          setCtaOpen(true)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [bookId, currentPage, pages.length, isAuthenticated])

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
    <div className="bg-background flex h-dvh flex-col">
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

      <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-hidden sm:items-center">
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

        <PageNavigator
          currentPage={currentPage}
          totalPages={pages.length}
          onNext={goNext}
          onPrev={goPrev}
          thumbnailsOpen={thumbnailsOpen}
          onToggleThumbnails={() => setThumbnailsOpen(!thumbnailsOpen)}
        />
      </div>

      {thumbnailsOpen && (
        <PageThumbnails
          pages={pages}
          currentPage={currentPage}
          onNavigate={goToPage}
        />
      )}

      {bookId && isAuthenticated && (
        <RatingModal
          bookId={bookId}
          open={ratingOpen}
          onOpenChange={setRatingOpen}
        />
      )}

      {!isAuthenticated && (
        <EndOfBookCta
          open={ctaOpen}
          onOpenChange={setCtaOpen}
        />
      )}
    </div>
  )
}
