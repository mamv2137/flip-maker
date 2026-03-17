'use client'

import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const MIN_WIDTH = 800
const MIN_HEIGHT = 1200
const TARGET_RATIO = 2 / 3 // Portrait 2:3
const RATIO_TOLERANCE = 0.15 // Allow ~15% deviation

type Props = {
  bookId: string
  currentCover: string | null
}

function validateDimensions(
  width: number,
  height: number,
): string | null {
  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    return `Minimum size is ${MIN_WIDTH} × ${MIN_HEIGHT} px. Your image is ${width} × ${height} px.`
  }

  if (height <= width) {
    return 'Cover must be portrait orientation (taller than wide).'
  }

  const ratio = width / height
  if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
    const expectedHeight = Math.round(width / TARGET_RATIO)
    return `Aspect ratio should be close to 2:3 (portrait). For ${width}px wide, height should be ~${expectedHeight}px. Your image is ${width} × ${height} px.`
  }

  return null
}

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export function CoverUpload({ bookId, currentCover }: Props) {
  const [preview, setPreview] = useState<string | null>(currentCover)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be under 5 MB.')
      return
    }

    // Validate dimensions
    try {
      const { width, height } = await loadImageDimensions(file)
      const dimensionError = validateDimensions(width, height)
      if (dimensionError) {
        setError(dimensionError)
        return
      }
    } catch {
      setError('Could not read image dimensions.')
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.set('cover', file)

      const res = await fetch(`/api/books/${bookId}/cover`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentCover)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="border-border relative flex aspect-[2/3] w-full max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-foreground/20"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Book cover"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <ImagePlus className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground text-xs">
              {isUploading ? 'Uploading...' : 'Upload cover'}
            </p>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        Min {MIN_WIDTH} × {MIN_HEIGHT} px, portrait 2:3 ratio
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
