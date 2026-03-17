'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/utils/tailwind'
import { Upload, FileText, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

const ACCEPTED_TYPES = ['.md', '.markdown', '.pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function BookUploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

      // Auto-fill title from filename if empty
      if (!title) {
        const name = f.name.replace(/\.(md|markdown|pdf)$/i, '')
        setTitle(name.replace(/[-_]/g, ' '))
      }
    },
    [title, validateFile],
  )

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

      const res = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create book')
      }

      const book = await res.json()
      router.push(`/dashboard/books/${book.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const isPdf = file?.name.toLowerCase().endsWith('.pdf')

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
                  {isPdf && ' — PDF processing available after upload'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
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
