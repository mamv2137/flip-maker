'use client'

import { useEffect, useRef, useCallback, useState, type MutableRefObject } from 'react'
import { PageFlip } from 'page-flip'
import type { BookPage, FlipControl } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  onPageChange: (page: number) => void
  controlRef: MutableRefObject<FlipControl | null>
}

export default function PageFlipReader({
  pages,
  onPageChange,
  controlRef,
}: Props) {
  const bookRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const handleFlip = useCallback(
    (e: { data: number }) => {
      onPageChange(e.data)
    },
    [onPageChange],
  )

  // Expose controls to parent
  useEffect(() => {
    controlRef.current = {
      next: () => pageFlipRef.current?.turnToNextPage(),
      prev: () => pageFlipRef.current?.turnToPrevPage(),
      goTo: (page: number) => pageFlipRef.current?.turnToPage(page),
    }
    return () => {
      controlRef.current = null
    }
  }, [controlRef])

  useEffect(() => {
    if (!mounted || !bookRef.current || pageFlipRef.current) return

    const pageElements = bookRef.current.querySelectorAll('.flip-page')
    if (pageElements.length === 0) return

    const pageFlip = new PageFlip(bookRef.current, {
      width: 500,
      height: 700,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 800,
      minHeight: 400,
      maxHeight: 1100,
      maxShadowOpacity: 0.3,
      showCover: false,
      mobileScrollSupport: false,
      drawShadow: true,
      flippingTime: 800,
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      clickEventForward: false,
      useMouseEvents: true,
      swipeDistance: 30,
      showPageCorners: false,
      disableFlipByClick: false,
    })

    pageFlip.loadFromHTML(pageElements as NodeListOf<HTMLElement>)
    pageFlip.on('flip', handleFlip)
    pageFlipRef.current = pageFlip

    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy()
        pageFlipRef.current = null
      }
    }
  }, [mounted, pages, handleFlip])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pageFlipRef.current) return
      switch (e.key) {
        case 'ArrowRight':
          pageFlipRef.current.turnToNextPage()
          break
        case 'ArrowLeft':
          pageFlipRef.current.turnToPrevPage()
          break
        case 'Home':
          pageFlipRef.current.turnToPage(0)
          break
        case 'End':
          pageFlipRef.current.turnToPage(pages.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pages.length])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-8 py-4">
      <div
        ref={bookRef}
        className="overflow-hidden rounded-sm"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: 'calc(100vh - 8rem)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
        }}
      >
        {pages.map((page, i) => (
          <div
            key={i}
            className="flip-page"
            data-density="soft"
            style={{
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
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
          </div>
        ))}
      </div>
    </div>
  )
}
