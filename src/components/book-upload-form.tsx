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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/tailwind'
import {
  FileText,
  X,
  AlertCircle,
  Check,
  Loader2,
  ShieldCheck,
  ImagePlus,
  HardDrive,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCategories } from '@/hooks/use-categories'
import { createClient } from '@/supabase/client'
import { UploadProgress } from '@/components/upload-progress'
import { DrivePicker } from '@/components/drive-picker'

export function BookUploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // Drive picker state (private file, read with user's token)
  const [pickedFileId, setPickedFileId] = useState<string | null>(null)
  const [pickedFileName, setPickedFileName] = useState<string | null>(null)
  // Drive URL state (public file, read with proxy)
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
  const [categoryId, setCategoryId] = useState<string>('')
  const [driveStatus, setDriveStatus] = useState<'checking' | 'connected' | 'not-connected'>('checking')
  const [pickerOpen, setPickerOpen] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const driveDebounceRef = useRef<NodeJS.Timeout>(null)
  const router = useRouter()
  const { data: categories } = useCategories()

  // Check if user has a valid Drive token
  useEffect(() => {
    async function checkDrive() {
      try {
        const res = await fetch('/api/drive/token')
        const data = await res.json()
        setDriveStatus(data.hasToken ? 'connected' : 'not-connected')
      } catch {
        setDriveStatus('not-connected')
      }
    }
    checkDrive()
  }, [])

  const handleConnectDrive = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/books/new`,
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleDriveFilePicked = useCallback(
    (fileId: string, fileName: string) => {
      setPickedFileId(fileId)
      setPickedFileName(fileName)
      setDriveUrl('')
      setDriveValid(null)
      setDriveFileId(null)
      setDriveError(null)
      if (!title) {
        setTitle(fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '))
      }
    },
    [title]
  )

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

  const canSubmit =
    title.trim() &&
    !isLoading &&
    (driveValid || pickedFileId)

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

      if (pickedFileId) {
        formData.set('drive_file_id', pickedFileId)
      } else if (driveUrl) {
        formData.set('drive_url', driveUrl)
      }

      const res = await fetch('/api/books', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create book')
      }

      const book = await res.json()

      // Upload cover if selected
      if (coverFile) {
        const coverForm = new FormData()
        coverForm.set('cover', coverFile)
        await fetch(`/api/books/${book.id}/cover`, { method: 'POST', body: coverForm })
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
      <DrivePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onFileSelect={handleDriveFilePicked}
      />
      <UploadProgress
        isActive={isLoading || uploadComplete}
        isComplete={uploadComplete}
        bookId={createdBookId}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Browse Drive (private files) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-5 w-5" />
              Import from Google Drive
            </CardTitle>
            <CardDescription>
              Select a PDF from your Drive or paste a public link. Your file stays in Drive — we read it securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Browse Drive / Connect Drive */}
            <AnimatePresence mode="wait">
              {pickedFileId && pickedFileName ? (
                <motion.div
                  key="picked"
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{pickedFileName}</p>
                    <p className="text-muted-foreground text-xs">Selected from Google Drive</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPickedFileId(null)
                      setPickedFileName(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="browse"
                  className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {driveStatus === 'checking' ? (
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  ) : driveStatus === 'connected' ? (
                    <>
                      <HardDrive className="text-muted-foreground h-10 w-10" />
                      <p className="text-sm font-medium">Select a PDF from your Drive</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPickerOpen(true)}
                      >
                        <HardDrive className="mr-1.5 h-4 w-4" />
                        Browse Drive
                      </Button>
                    </>
                  ) : (
                    <>
                      <HardDrive className="text-muted-foreground h-10 w-10" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Connect Google Drive</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Grant access to browse and select PDFs directly
                        </p>
                      </div>
                      <Button type="button" onClick={handleConnectDrive}>
                        <HardDrive className="mr-1.5 h-4 w-4" />
                        Connect Google Drive
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Section 2: Public link */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Or use a public link</CardTitle>
            <CardDescription>
              Paste a public Google Drive link. The file must be shared as &quot;Anyone with the link&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                id="drive-url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value)
                  if (pickedFileId) {
                    setPickedFileId(null)
                    setPickedFileName(null)
                  }
                }}
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
            {driveError && <p className="text-xs text-red-500">{driveError}</p>}
            {driveValid && (
              <p className="text-xs text-green-600 dark:text-green-400">
                PDF verified and accessible.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cover upload — shows when a file is selected */}
        <AnimatePresence>
          {(pickedFileId || driveValid) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cover Image</CardTitle>
                  <CardDescription>Optional — add a cover for your flipbook</CardDescription>
                </CardHeader>
                <CardContent>
                  {coverPreview ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-muted aspect-[2/3] w-[100px] overflow-hidden rounded-md border">
                        <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium">{coverFile?.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                        >
                          <X className="mr-1 h-3 w-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <ImagePlus className="text-muted-foreground h-8 w-8" />
                      <p className="text-muted-foreground text-xs">Click to upload (JPG, PNG, WebP)</p>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Your content is protected
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
              Your PDF is served through our secure reader only. Readers can view but cannot download or share the original file.
            </p>
          </div>
        </div>

        {/* Book details */}
        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
            <CardDescription>Give your flipbook a title and optional description</CardDescription>
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
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
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
