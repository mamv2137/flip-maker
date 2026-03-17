'use client'

import { useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BookPage } from './FlipbookReader'

type Props = {
  pages: BookPage[]
  currentPage: number
  onPageChange: (page: number) => void
  fontSize: number
  zoom: number
}

export function FlatReader({ pages, currentPage, onPageChange, fontSize, zoom }: Props) {
  const page = pages[currentPage]

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) onPageChange(currentPage + 1)
  }, [currentPage, pages.length, onPageChange])

  const goPrev = useCallback(() => {
    if (currentPage > 0) onPageChange(currentPage - 1)
  }, [currentPage, onPageChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          goNext()
          break
        case 'ArrowLeft':
          goPrev()
          break
        case 'Home':
          onPageChange(0)
          break
        case 'End':
          onPageChange(pages.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onPageChange, pages.length])

  if (!page) return null

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Previous button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 z-10 h-12 w-12 rounded-full opacity-60 hover:opacity-100"
        onClick={goPrev}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Page content */}
      <div
        className="bg-card mx-16 h-full max-h-[calc(100vh-8rem)] w-full max-w-3xl overflow-auto rounded-lg border shadow-lg"
        style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: 'top center' }}
      >
        {page.type === 'html' ? (
          <div
            className="prose dark:prose-invert max-w-none p-8 md:p-12"
            style={{ fontSize: `${fontSize}%` }}
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

      {/* Next button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 z-10 h-12 w-12 rounded-full opacity-60 hover:opacity-100"
        onClick={goNext}
        disabled={currentPage === pages.length - 1}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}
