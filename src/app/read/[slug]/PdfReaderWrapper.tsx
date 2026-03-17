'use client'

import { useCallback, useState } from 'react'
import { FlipbookReader } from '@/components/reader/FlipbookReader'
import { PdfPageRenderer } from '@/components/reader/PdfPageRenderer'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  pdfUrl: string
  flipEnabled: boolean
}

export function PdfReaderWrapper({ title, pdfUrl, flipEnabled }: Props) {
  const [pages, setPages] = useState<BookPage[] | null>(null)

  const handlePagesLoaded = useCallback((loadedPages: BookPage[]) => {
    setPages(loadedPages)
  }, [])

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
