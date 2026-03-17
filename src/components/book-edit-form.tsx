'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Save, Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

type Book = {
  id: string
  title: string
  slug: string
  description: string | null
  flip_effect_enabled: boolean
}

type SlugCheck = {
  available: boolean
  slug: string
  suggestions: string[]
  error?: string
}

export function BookEditForm({ book }: { book: Book }) {
  const [title, setTitle] = useState(book.title)
  const [slug, setSlug] = useState(book.slug)
  const [description, setDescription] = useState(book.description || '')
  const [flipEnabled, setFlipEnabled] = useState(book.flip_effect_enabled)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slugCheck, setSlugCheck] = useState<SlugCheck | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)
  const router = useRouter()

  const hasChanges =
    title !== book.title ||
    slug !== book.slug ||
    description !== (book.description || '') ||
    flipEnabled !== book.flip_effect_enabled

  const slugIsValid = slug === book.slug || (slugCheck?.available === true)

  const checkSlug = useCallback(
    async (value: string) => {
      if (value === book.slug) {
        setSlugCheck(null)
        setIsCheckingSlug(false)
        return
      }

      if (!value.trim()) {
        setSlugCheck({ available: false, slug: '', suggestions: [], error: 'Slug cannot be empty' })
        setIsCheckingSlug(false)
        return
      }

      setIsCheckingSlug(true)
      try {
        const res = await fetch(
          `/api/books/check-slug?slug=${encodeURIComponent(value)}&bookId=${book.id}`,
        )
        const data: SlugCheck = await res.json()
        setSlugCheck(data)
        // If the API sanitized the slug, update the input
        if (data.slug && data.slug !== value) {
          setSlug(data.slug)
        }
      } catch {
        setSlugCheck(null)
      } finally {
        setIsCheckingSlug(false)
      }
    },
    [book.id, book.slug],
  )

  // Debounced slug check
  useEffect(() => {
    if (slug === book.slug) {
      setSlugCheck(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsCheckingSlug(true)
    debounceRef.current = setTimeout(() => checkSlug(slug), 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [slug, book.slug, checkSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges || !slugIsValid) return

    setIsLoading(true)
    setSaved(false)
    setSaveError(null)

    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          flip_effect_enabled: flipEnabled,
        }),
      })

      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      } else {
        const data = await res.json()
        setSaveError(data.error || 'Failed to save')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="edit-slug">Slug</Label>
        <div className="relative">
          <Input
            id="edit-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="pr-8 font-mono text-xs"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isCheckingSlug && (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            )}
            {!isCheckingSlug && slug !== book.slug && slugCheck?.available && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {!isCheckingSlug && slug !== book.slug && slugCheck && !slugCheck.available && (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Reader URL: /read/{slug || '...'}
        </p>

        {slugCheck && !slugCheck.available && !slugCheck.error && slugCheck.suggestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-red-500">This slug is already taken. Try:</p>
            <div className="flex flex-wrap gap-1.5">
              {slugCheck.suggestions.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer font-mono text-xs hover:bg-accent"
                  onClick={() => setSlug(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {slugCheck?.error && (
          <p className="text-xs text-red-500">{slugCheck.error}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your book"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="edit-flip"
          checked={flipEnabled}
          onCheckedChange={(checked) => setFlipEnabled(checked === true)}
        />
        <Label htmlFor="edit-flip" className="text-sm font-normal">
          Enable 3D page flip effect
        </Label>
      </div>

      {saveError && <p className="text-xs text-red-500">{saveError}</p>}

      <Button type="submit" disabled={isLoading || !hasChanges || !slugIsValid} size="sm">
        <Save className="mr-2 h-4 w-4" />
        {saved ? 'Saved!' : isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
