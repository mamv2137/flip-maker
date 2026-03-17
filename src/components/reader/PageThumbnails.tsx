'use client'

import { useRef, useEffect } from 'react'
import type { BookPage } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  currentPage: number
  onNavigate: (page: number) => void
}

export function PageThumbnails({ pages, currentPage, onNavigate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentPage])

  // Show current page ±5
  const start = Math.max(0, currentPage - 5)
  const end = Math.min(pages.length, currentPage + 6)
  const visiblePages = pages.slice(start, end)

  return (
    <div className="border-t">
      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto px-4 py-2">
        {visiblePages.map((page, i) => {
          const pageIndex = start + i
          const isActive = pageIndex === currentPage
          return (
            <button
              key={pageIndex}
              ref={isActive ? activeRef : undefined}
              onClick={() => onNavigate(pageIndex)}
              className={`relative flex-shrink-0 overflow-hidden rounded border transition-all ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'border-border hover:border-foreground/30'
              }`}
              style={{ width: 60, height: 80 }}
              title={`Page ${pageIndex + 1}`}
            >
              {page.type === 'image' ? (
                <img
                  src={page.content}
                  alt={`Page ${pageIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="origin-top-left overflow-hidden"
                  style={{
                    width: 400,
                    height: 533,
                    transform: 'scale(0.15)',
                    transformOrigin: 'top left',
                  }}
                >
                  <div
                    className="prose prose-sm max-w-none p-4"
                    style={{ color: '#1a1a1a', fontSize: '12px' }}
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </div>
              )}
              <div className="bg-background/80 absolute bottom-0 left-0 right-0 text-center text-[9px]">
                {pageIndex + 1}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
