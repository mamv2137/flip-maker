'use client'

import { useEffect, useRef, useCallback, type MutableRefObject } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { forwardRef } from 'react'
import type { BookPage, FlipControl } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  onPageChange: (page: number) => void
  controlRef: MutableRefObject<FlipControl | null>
}

// react-pageflip requires forwardRef children
const Page = forwardRef<HTMLDivElement, { page: BookPage }>(
  function Page({ page }, ref) {
    return (
      <div
        ref={ref}
        style={{
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          height: '100%',
          width: '100%',
        }}
      >
        {page.type === 'html' ? (
          <div
            className="prose prose-sm max-w-none p-8 sm:p-10"
            style={{ color: '#1a1a1a' }}
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
      style={{ maxHeight: 'calc(100vh - 7rem)' }}
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
        maxShadowOpacity={0.3}
        showCover={false}
        mobileScrollSupport={false}
        drawShadow={true}
        flippingTime={800}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        clickEventForward={false}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={false}
        disableFlipByClick={false}
        onFlip={handleFlip}
        className="flipbook-container"
        style={{
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
          maxHeight: 'calc(100vh - 8rem)',
        }}
      >
        {pages.map((page, i) => (
          <Page key={i} page={page} />
        ))}
      </HTMLFlipBook>
    </div>
  )
}
