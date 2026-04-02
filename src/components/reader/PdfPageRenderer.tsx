'use client'

import { useEffect, useState } from 'react'
import type { BookPage } from './FlipbookReader'

type Props = {
  pdfUrl: string
  onPagesLoaded: (pages: BookPage[]) => void
  showWatermark?: boolean
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#888888'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Diagonal repeated pattern
  const text = 'BUKIFY'
  const fontSize = Math.max(width * 0.06, 28)
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.translate(width / 2, height / 2)
  ctx.rotate(-Math.PI / 6) // -30 degrees

  const spacingX = fontSize * 6
  const spacingY = fontSize * 4
  const cols = Math.ceil(width / spacingX) + 2
  const rows = Math.ceil(height / spacingY) + 2

  for (let r = -rows; r <= rows; r++) {
    for (let c = -cols; c <= cols; c++) {
      ctx.fillText(text, c * spacingX, r * spacingY)
    }
  }

  ctx.restore()
}

export function PdfPageRenderer({ pdfUrl, onPagesLoaded, showWatermark }: Props) {
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
          // Mobile: 2x + WebP for performance. Desktop: 3x + PNG for crisp text.
          const isMobile = window.innerWidth < 768
          const scale = isMobile ? 2 : 3
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height

          const context = canvas.getContext('2d')!
          await page.render({ canvasContext: context, viewport }).promise

          if (showWatermark) {
            drawWatermark(context, canvas.width, canvas.height)
          }

          const dataUrl = isMobile
            ? canvas.toDataURL('image/webp', 0.92)
            : canvas.toDataURL('image/png')
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
