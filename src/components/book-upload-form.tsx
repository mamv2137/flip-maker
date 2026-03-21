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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/tailwind'
import { Upload, FileText, X, FileImage, AlertCircle, Link2, Check, Loader2, ShieldCheck, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCategories } from '@/hooks/use-categories'
import { UploadProgress } from '@/components/upload-progress'

const ACCEPTED_TYPES = ['.md', '.markdown', '.pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function BookUploadForm() {
  const [inputMode, setInputMode] = useState<'upload' | 'drive'>('upload')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [driveFileId, setDriveFileId] = useState<string | null>(null)
  const [driveValidating, setDriveValidating] = useState(false)
  const [driveValid, setDriveValid] = useState<boolean | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [createdBookId, setCreatedBookId] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [categoryId, setCategoryId] = useState<string>('')
  const [useFirstPageAsCover, setUseFirstPageAsCover] = useState(true)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const driveDebounceRef = useRef<NodeJS.Timeout>(null)
  const router = useRouter()
  const { data: categories } = useCategories()

  const isPdf = file?.name.toLowerCase().endsWith('.pdf')

  const handleCoverSelect = (f: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(f.type)) {
      setError('Cover must be a JPG, PNG, or WebP image')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Cover must be under 5 MB')
      return
    }
    setError(null)
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  // Clear other mode's state when switching tabs
  const handleTabChange = (value: string) => {
    setInputMode(value as 'upload' | 'drive')
    setError(null)
    setCoverFile(null)
    setCoverPreview(null)
    if (value === 'drive') {
      setFile(null)
      setPdfPreview(null)
    } else {
      setDriveUrl('')
      setDriveFileId(null)
      setDriveValid(null)
      setDriveError(null)
    }
  }

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

  // Debounced Drive URL validation
  useEffect(() => {
    if (!driveUrl.trim()) {
      setDriveValid(null)
      setDriveError(null)
      setDriveFileId(null)
      return
    }

    if (driveDebounceRef.current) clearTimeout(driveDebounceRef.current)
    setDriveValidating(true)
    setDriveValid(null)
    setDriveError(null)

    driveDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/drive/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: driveUrl }),
        })
        const data = await res.json()
        setDriveValid(data.valid)
        setDriveFileId(data.fileId || null)
        setDriveError(data.valid ? null : data.error)
      } catch {
        setDriveError('Failed to validate URL')
        setDriveValid(false)
      } finally {
        setDriveValidating(false)
      }
    }, 600)

    return () => {
      if (driveDebounceRef.current) clearTimeout(driveDebounceRef.current)
    }
  }, [driveUrl])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect],
  )

  const canSubmit =
    title.trim() &&
    !isLoading &&
    ((inputMode === 'upload' && file) || (inputMode === 'drive' && driveValid))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('title', title.trim())
      if (description.trim()) formData.set('description', description.trim())
      if (categoryId) formData.set('category_id', categoryId)

      if (inputMode === 'drive' && driveUrl) {
        formData.set('drive_url', driveUrl)
      } else if (file) {
        formData.set('file', file)
        if (isPdf) {
          formData.set('useFirstPageAsCover', useFirstPageAsCover ? 'true' : 'false')
        }
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

      // Upload cover image
      if (inputMode === 'upload' && isPdf && useFirstPageAsCover && pdfPreview) {
        // Auto-extract first page as cover
        const coverBlob = await fetch(pdfPreview).then((r) => r.blob())
        const coverForm = new FormData()
        coverForm.set('cover', new File([coverBlob], 'cover.webp', { type: 'image/webp' }))
        await fetch(`/api/books/${book.id}/cover`, {
          method: 'POST',
          body: coverForm,
        })
      } else if (coverFile) {
        // Manual cover upload (Drive mode or upload without first-page cover)
        const coverForm = new FormData()
        coverForm.set('cover', coverFile)
        await fetch(`/api/books/${book.id}/cover`, {
          method: 'POST',
          body: coverForm,
        })
      }

      setCreatedBookId(book.id)
      setUploadComplete(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <>
    <UploadProgress
      isActive={isLoading || uploadComplete}
      isComplete={uploadComplete}
      bookId={createdBookId}
    />
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source selection tabs */}
      <Tabs value={inputMode} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="drive" className="gap-1.5">
            <Link2 className="h-4 w-4" />
            Google Drive URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
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
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file-selected"
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="drop-zone"
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="text-muted-foreground mb-3 h-10 w-10" />
                    <p className="text-sm font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Markdown (.md) or PDF (.pdf) — max 50 MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
        </TabsContent>

        <TabsContent value="drive" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-2">
                <Label htmlFor="drive-url">Google Drive PDF Link</Label>
                <div className="relative">
                  <Input
                    id="drive-url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {driveValidating && (
                      <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                    )}
                    {!driveValidating && driveValid === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!driveValidating && driveValid === false && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">
                  Paste a public Google Drive link. The file must be shared as &quot;Anyone with the link&quot;.
                </p>
                {driveError && (
                  <p className="text-xs text-red-500">{driveError}</p>
                )}
                {driveValid && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    File verified and accessible. The PDF will be read directly from Google Drive.
                  </p>
                )}
              </div>

              {/* Security disclaimer */}
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    Your content is protected
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
                    Your PDF is served through our secure reader only. Readers can view it but cannot download, copy, or share the original file. Your content stays yours.
                  </p>
                </div>
              </div>

              {/* Cover upload for Drive books */}
              <AnimatePresence>
                {driveValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <Label>Cover Image (optional)</Label>
                      {coverPreview ? (
                        <div className="flex items-start gap-4">
                          <div className="bg-muted aspect-[2/3] w-[100px] overflow-hidden rounded-md border">
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium">{coverFile?.name}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCoverFile(null)
                                setCoverPreview(null)
                              }}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          <ImagePlus className="text-muted-foreground h-8 w-8" />
                          <p className="text-muted-foreground text-xs">
                            Click to upload a cover image (JPG, PNG, WebP)
                          </p>
                        </div>
                      )}
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleCoverSelect(f)
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PDF cover option — only for file uploads */}
      <AnimatePresence>
        {inputMode === 'upload' && isPdf && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="grid gap-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? 'Creating...' : 'Create Book'}
        </Button>
      </div>
    </form>
    </>
  )
}
