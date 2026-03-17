'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Trash2, Globe, GlobeLock, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

type Book = {
  id: string
  slug: string
  status: string
  is_published: boolean
}

export function BookActions({ book }: { book: Book }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const readerUrl = `/read/${book.slug}`

  const togglePublish = async () => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !book.is_published }),
      })
      if (res.ok) router.refresh()
    } finally {
      setIsPublishing(false)
    }
  }

  const deleteBook = async () => {
    if (!confirm('Are you sure you want to delete this book? This cannot be undone.')) {
      return
    }
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/dashboard')
    } finally {
      setIsDeleting(false)
    }
  }

  const copyLink = async () => {
    const fullUrl = `${window.location.origin}${readerUrl}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {book.status === 'ready' && (
        <Button
          variant="outline"
          onClick={togglePublish}
          disabled={isPublishing}
        >
          {book.is_published ? (
            <>
              <GlobeLock className="mr-2 h-4 w-4" />
              {isPublishing ? 'Unpublishing...' : 'Unpublish'}
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </>
          )}
        </Button>
      )}

      {book.is_published && book.status === 'ready' && (
        <>
          <Button variant="outline" onClick={copyLink}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href={readerUrl} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Reader
            </Link>
          </Button>
        </>
      )}

      <Button
        variant="destructive"
        onClick={deleteBook}
        disabled={isDeleting}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )
}
