'use client'

import { useEffect, useState } from 'react'
import type { BookPage } from './FlipbookReader'

type Props = {
  pdfUrl: string
  onPagesLoaded: (pages: BookPage[]) => void
}

export function PdfPageRenderer({ pdfUrl, onPagesLoaded }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function renderPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        const totalPages = pdf.numPages
        const pages: BookPage[] = []

        for (let i = 1; i <= totalPages; i++) {
          if (cancelled) return

          const page = await pdf.getPage(i)
          const scale = 2
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height

          const context = canvas.getContext('2d')!
          await page.render({ canvasContext: context, viewport }).promise

          const dataUrl = canvas.toDataURL('image/webp', 0.85)
          pages.push({
            type: 'image',
            content: dataUrl,
            pageNumber: i,
          })

          setProgress(Math.round((i / totalPages) * 100))
        }

        if (!cancelled) {
          onPagesLoaded(pages)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF')
          setLoading(false)
        }
      }
    }

    renderPdf()

    return () => {
      cancelled = true
    }
  }, [pdfUrl, onPagesLoaded])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive text-sm">Failed to load PDF: {error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">Rendering PDF pages...</p>
        <div className="bg-muted h-2 w-48 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs">{progress}%</p>
      </div>
    )
  }

  return null
}
