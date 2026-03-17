'use client'

import { useCallback, useState } from 'react'
import { FlipbookReader } from '@/components/reader/FlipbookReader'
import { PdfPageRenderer } from '@/components/reader/PdfPageRenderer'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  bookId: string
  pdfUrl: string
  flipEnabled: boolean
  coverPage: BookPage | null
  skipFirstPage: boolean
}

export function PdfReaderWrapper({ title, bookId, pdfUrl, flipEnabled, coverPage, skipFirstPage }: Props) {
  const [pages, setPages] = useState<BookPage[] | null>(null)

  const handlePagesLoaded = useCallback((loadedPages: BookPage[]) => {
    const contentPages = skipFirstPage ? loadedPages.slice(1) : loadedPages
    const allPages = coverPage ? [coverPage, ...contentPages] : contentPages
    setPages(allPages)

    // Update page count in the database if it hasn't been set
    fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_count: loadedPages.length }),
    }).catch(() => {
      // Silently fail — page count update is not critical
    })
  }, [coverPage, skipFirstPage, bookId])

  if (!pages) {
    return (
      <div className="bg-background flex h-screen flex-col">
        <div className="border-b">
          <div className="flex h-12 items-center px-4">
            <h1 className="text-sm font-medium">{title}</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <PdfPageRenderer pdfUrl={pdfUrl} onPagesLoaded={handlePagesLoaded} />
        </div>
      </div>
    )
  }

  return (
    <FlipbookReader
      title={title}
      pages={pages}
      defaultFlipEnabled={flipEnabled}
    />
  )
}
