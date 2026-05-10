'use client'

import {
  useCallback,
  useEffect,
  type CSSProperties,
  type MutableRefObject,
} from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { BookPage, FlipControl } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  onPageChange: (page: number) => void
  controlRef: MutableRefObject<FlipControl | null>
  fontSize?: number
  zoom?: number
}

const proseVars: CSSProperties = {
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
} as CSSProperties

export default function SlideReader({
  pages,
  onPageChange,
  controlRef,
  fontSize = 100,
  zoom = 1,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
    duration: 22,
    containScroll: 'trimSnaps',
  })

  const handleSelect = useCallback(() => {
    if (!emblaApi) return
    onPageChange(emblaApi.selectedScrollSnap())
  }, [emblaApi, onPageChange])

  useEffect(() => {
    if (!emblaApi) return
    handleSelect()
    emblaApi.on('select', handleSelect)
    return () => {
      emblaApi.off('select', handleSelect)
    }
  }, [emblaApi, handleSelect])

  useEffect(() => {
    controlRef.current = {
      next: () => emblaApi?.scrollNext(),
      prev: () => emblaApi?.scrollPrev(),
      goTo: (page: number) => emblaApi?.scrollTo(page),
    }
    return () => {
      controlRef.current = null
    }
  }, [emblaApi, controlRef])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!emblaApi) return
      switch (e.key) {
        case 'ArrowRight':
          emblaApi.scrollNext()
          break
        case 'ArrowLeft':
          emblaApi.scrollPrev()
          break
        case 'Home':
          emblaApi.scrollTo(0)
          break
        case 'End':
          emblaApi.scrollTo(pages.length - 1)
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [emblaApi, pages.length])

  return (
    <div
      className="flex h-full w-full items-stretch justify-center px-2 py-2 sm:px-6 sm:py-4"
      style={{
        transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <div
        ref={emblaRef}
        className="relative h-full w-full max-w-4xl overflow-hidden"
      >
        <div className="flex h-full">
          {pages.map((page, i) => (
            <div
              key={i}
              className="relative mr-4 flex h-full min-w-0 shrink-0 grow-0 basis-full items-center justify-center sm:mr-6"
            >
              <div
                className="relative flex h-full max-h-full w-full max-w-full items-center justify-center"
                style={{ colorScheme: 'light' }}
              >
                {page.type === 'html' ? (
                  <div
                    className="bg-card h-full w-full overflow-auto rounded-lg shadow-lg"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div
                      className="prose prose-sm max-w-none p-6 sm:p-10"
                      style={{
                        ...proseVars,
                        color: '#1a1a1a',
                        fontSize: `${fontSize}%`,
                      }}
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  </div>
                ) : (
                  <img
                    src={page.content}
                    alt={`Page ${page.pageNumber}`}
                    draggable={false}
                    className="h-full max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-[0_2px_8px_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.12)] select-none"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
