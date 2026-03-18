'use client'

import { useEffect, useRef, useCallback, type MutableRefObject } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { forwardRef } from 'react'
import type { BookPage, FlipControl } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  onPageChange: (page: number) => void
  controlRef: MutableRefObject<FlipControl | null>
  fontSize?: number
  zoom?: number
}

// react-pageflip requires forwardRef children
const Page = forwardRef<HTMLDivElement, { page: BookPage; fontSize?: number }>(
  function Page({ page, fontSize }, ref) {
    return (
      <div
        ref={ref}
        className="flipbook-page"
        style={{
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          height: '100%',
          width: '100%',
          colorScheme: 'light',
        }}
      >
        {page.type === 'html' ? (
          <div
            className="prose prose-sm max-w-none p-8 sm:p-10"
            style={{
              color: '#1a1a1a',
              fontSize: fontSize ? `${fontSize}%` : undefined,
              '--tw-prose-body': '#374151',
              '--tw-prose-headings': '#111827',
              '--tw-prose-links': '#111827',
              '--tw-prose-bold': '#111827',
              '--tw-prose-counters': '#6b7280',
              '--tw-prose-bullets': '#6b7280',
              '--tw-prose-quotes': '#374151',
              '--tw-prose-code': '#111827',
              '--tw-prose-th-borders': '#d1d5db',
              '--tw-prose-td-borders': '#e5e7eb',
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <img
            src={page.content}
            alt={`Page ${page.pageNumber}`}
            className="h-full w-full object-contain"
          />
        )}
      </div>
    )
  },
)

export default function PageFlipReader({
  pages,
  onPageChange,
  controlRef,
  fontSize = 100,
  zoom = 1,
}: Props) {
  const flipBookRef = useRef<HTMLFlipBook>(null)

  const handleFlip = useCallback(
    (e: { data: number }) => {
      onPageChange(e.data)
    },
    [onPageChange],
  )

  // Expose controls to parent
  useEffect(() => {
    controlRef.current = {
      next: () => flipBookRef.current?.pageFlip()?.flipNext(),
      prev: () => flipBookRef.current?.pageFlip()?.flipPrev(),
      goTo: (page: number) => flipBookRef.current?.pageFlip()?.turnToPage(page),
    }
    return () => {
      controlRef.current = null
    }
  }, [controlRef])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pf = flipBookRef.current?.pageFlip()
      if (!pf) return
      switch (e.key) {
        case 'ArrowRight':
          pf.flipNext()
          break
        case 'ArrowLeft':
          pf.flipPrev()
          break
        case 'Home':
          pf.turnToPage(0)
          break
        case 'End':
          pf.turnToPage(pages.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pages.length])

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden px-4 py-2"
      style={{
        maxHeight: 'calc(100vh - 7rem)',
        transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <HTMLFlipBook
        ref={flipBookRef}
        width={450}
        height={600}
        size="stretch"
        minWidth={250}
        maxWidth={600}
        minHeight={350}
        maxHeight={800}
        maxShadowOpacity={0.2}
        showCover={true}
        mobileScrollSupport={false}
        drawShadow={true}
        flippingTime={600}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        clickEventForward={false}
        useMouseEvents={true}
        swipeDistance={20}
        showPageCorners={true}
        disableFlipByClick={false}
        onFlip={handleFlip}
        className="flipbook-container"
        style={{
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
          maxHeight: 'calc(100vh - 8rem)',
        }}
      >
        {pages.map((page, i) => (
          <Page key={i} page={page} fontSize={fontSize} />
        ))}
      </HTMLFlipBook>
    </div>
  )
}
