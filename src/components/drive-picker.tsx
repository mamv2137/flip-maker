'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Folder,
  Search,
  Loader2,
  HardDrive,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'

type DriveFile = {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime?: string
  thumbnailLink?: string
}

type BreadcrumbItem = {
  id: string
  name: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileSelect: (fileId: string, fileName: string) => void
}

function formatSize(bytes: string | undefined): string {
  if (!bytes) return ''
  const num = parseInt(bytes, 10)
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`
  return `${(num / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isFolder(file: DriveFile): boolean {
  return file.mimeType === 'application/vnd.google-apps.folder'
}

function isPdf(file: DriveFile): boolean {
  return file.mimeType === 'application/pdf'
}



function PickerBody({
  onFileSelect,
  onClose,
}: {
  onFileSelect: (fileId: string, fileName: string) => void
  onClose: () => void
}) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive' },
  ])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id

  const fetchFiles = useCallback(
    async (folderId: string, query: string, pageToken?: string) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ folderId })
        if (query) params.set('q', query)
        if (pageToken) params.set('pageToken', pageToken)

        const res = await fetch(`/api/drive/files?${params}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load files')
          setFiles([])
          return
        }

        if (pageToken) {
          setFiles((prev) => [...prev, ...(data.files || [])])
        } else {
          setFiles(data.files || [])
        }
        setNextPageToken(data.nextPageToken || null)
      } catch {
        setError('Failed to connect to Google Drive')
        setFiles([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchFiles(currentFolderId, searchQuery)
  }, [currentFolderId, fetchFiles]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles(currentFolderId, searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  const navigateToFolder = (folderId: string, folderName: string) => {
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }])
    setSearchQuery('')
  }

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1))
    setSearchQuery('')
  }

  const handleSelect = (file: DriveFile) => {
    if (isFolder(file)) {
      navigateToFolder(file.id, file.name)
    } else if (isPdf(file)) {
      onFileSelect(file.id, file.name)
      onClose()
    }
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (isFolder(a) && !isFolder(b)) return -1
    if (!isFolder(a) && isFolder(b)) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative px-1">
        <Search className="text-muted-foreground absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 overflow-x-auto px-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id} className="flex shrink-0 items-center gap-1">
            {i > 0 && <ChevronRight className="text-muted-foreground h-3 w-3" />}
            <button
              type="button"
              onClick={() => navigateToBreadcrumb(i)}
              className={`rounded px-1.5 py-0.5 transition-colors hover:bg-muted ${
                i === breadcrumbs.length - 1
                  ? 'font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="min-h-[280px] max-h-[50vh] flex-1 overflow-y-auto rounded-lg border">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
            {error.includes('re-login') || error.includes('expired') || error.includes('not connected') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  window.location.href = '/auth/login'
                }}
              >
                Re-login with Google
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFiles(currentFolderId, searchQuery)}
              >
                Retry
              </Button>
            )}
          </div>
        ) : loading && files.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <FileText className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'No files match your search' : 'No PDF files in this folder'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {sortedFiles.map((file, index) => (
                <motion.button
                  key={file.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted active:bg-muted/80"
                  onClick={() => handleSelect(file)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {isFolder(file) ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {isFolder(file)
                        ? 'Folder'
                        : [formatSize(file.size), formatDate(file.modifiedTime)]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                  </div>

                  {isPdf(file) && (
                    <span className="text-primary shrink-0 text-xs font-medium">Select</span>
                  )}
                  {isFolder(file) && (
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>

            {nextPageToken && (
              <div className="flex justify-center py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchFiles(currentFolderId, searchQuery, nextPageToken)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Only PDF files can be selected. Navigate folders to find your file.
      </p>
    </div>
  )
}

export function DrivePicker({ open, onOpenChange, onFileSelect }: Props) {
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const title = (
    <span className="flex items-center gap-2">
      <HardDrive className="h-5 w-5" />
      Select a PDF from Google Drive
    </span>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] flex-col backdrop-blur-sm sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <PickerBody
            onFileSelect={onFileSelect}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <PickerBody
            onFileSelect={onFileSelect}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
