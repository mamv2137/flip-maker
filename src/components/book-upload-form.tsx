'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/utils/tailwind'
import { Upload, FileText, X, FileImage } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const ACCEPTED_TYPES = ['.md', '.markdown', '.pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function BookUploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [useFirstPageAsCover, setUseFirstPageAsCover] = useState(true)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isPdf = file?.name.toLowerCase().endsWith('.pdf')

  const validateFile = useCallback((f: File): string | null => {
    const name = f.name.toLowerCase()
    const isValid = ACCEPTED_TYPES.some((ext) => name.endsWith(ext))
    if (!isValid) return 'Only .md and .pdf files are supported'
    if (f.size > MAX_FILE_SIZE) return 'File must be under 50 MB'
    return null
  }, [])

  const handleFileSelect = useCallback(
    (f: File) => {
      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      setFile(f)
      setPdfPreview(null)
      setUseFirstPageAsCover(true)

      // Auto-fill title from filename if empty
      if (!title) {
        const name = f.name.replace(/\.(md|markdown|pdf)$/i, '')
        setTitle(name.replace(/[-_]/g, ' '))
      }
    },
    [title, validateFile],
  )

  // Generate preview of first PDF page
  useEffect(() => {
    if (!file || !isPdf) {
      setPdfPreview(null)
      return
    }

    let cancelled = false

    async function generatePreview() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const arrayBuffer = await file!.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1 })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const context = canvas.getContext('2d')!
        await page.render({ canvasContext: context, viewport }).promise

        if (!cancelled) {
          setPdfPreview(canvas.toDataURL('image/webp', 0.8))
        }
      } catch {
        // Silently fail — preview is optional
      }
    }

    generatePreview()
    return () => { cancelled = true }
  }, [file, isPdf])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('title', title.trim())
      if (description.trim()) formData.set('description', description.trim())
      formData.set('file', file)
      if (isPdf) {
        formData.set('useFirstPageAsCover', useFirstPageAsCover ? 'true' : 'false')
      }

      const res = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create book')
      }

      const book = await res.json()

      // If using first page as cover, upload the preview as cover image
      if (isPdf && useFirstPageAsCover && pdfPreview) {
        const coverBlob = await fetch(pdfPreview).then((r) => r.blob())
        const coverForm = new FormData()
        coverForm.set('cover', new File([coverBlob], 'cover.webp', { type: 'image/webp' }))
        await fetch(`/api/books/${book.id}/cover`, {
          method: 'POST',
          body: coverForm,
        })
      }

      router.push(`/dashboard/books/${book.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File drop zone */}
      <Card
        className={cn(
          'cursor-pointer border-2 border-dashed transition-colors',
          isDragOver && 'border-primary bg-primary/5',
          file && 'border-solid',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-10">
          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="text-muted-foreground h-8 w-8" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-muted-foreground text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  setPdfPreview(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="text-muted-foreground mb-3 h-10 w-10" />
              <p className="text-sm font-medium">
                Drop your file here or click to browse
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Markdown (.md) or PDF (.pdf) — max 50 MB
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFileSelect(f)
        }}
      />

      {/* PDF cover option */}
      {isPdf && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Cover Image
            </CardTitle>
            <CardDescription>
              Choose how to set the cover for your flipbook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="use-first-page"
                checked={useFirstPageAsCover}
                onCheckedChange={(checked) =>
                  setUseFirstPageAsCover(checked === true)
                }
              />
              <div className="grid gap-1">
                <Label htmlFor="use-first-page" className="font-normal">
                  Use first page of PDF as cover
                </Label>
                <p className="text-muted-foreground text-xs">
                  The first page will be extracted and set as the book cover. You can change it later.
                </p>
              </div>
            </div>

            {pdfPreview && useFirstPageAsCover && (
              <div className="flex items-start gap-4">
                <div className="bg-muted aspect-[2/3] w-[120px] overflow-hidden rounded-md border">
                  <img
                    src={pdfPreview}
                    alt="First page preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Preview of the first page
                </p>
              </div>
            )}

            {!useFirstPageAsCover && (
              <p className="text-muted-foreground text-xs">
                You can upload a custom cover image from the book detail page after creation.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Book details */}
      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
          <CardDescription>
            Give your flipbook a title and optional description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My Awesome Book"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="A brief description of your book"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !file || !title.trim()}>
          {isLoading ? 'Creating...' : 'Create Book'}
        </Button>
      </div>
    </form>
  )
}
