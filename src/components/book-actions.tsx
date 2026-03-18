'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ExternalLink, Trash2, Globe, GlobeLock, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

type Book = {
  id: string
  slug: string
  title: string
  status: string
  is_published: boolean
}

type Props = {
  book: Book
  variant?: 'default' | 'inline'
}

export function BookActions({ book, variant = 'default' }: Props) {
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

  const isInline = variant === 'inline'
  const btnSize = isInline ? 'sm' as const : 'default' as const

  return (
    <div className="flex flex-wrap items-center gap-2">
      {book.status === 'ready' && (
        <Button
          variant="outline"
          size={btnSize}
          onClick={togglePublish}
          disabled={isPublishing}
        >
          {book.is_published ? (
            <>
              <GlobeLock className="mr-1.5 h-4 w-4" />
              <span className={isInline ? 'hidden sm:inline' : ''}>
                {isPublishing ? 'Unpublishing...' : 'Unpublish'}
              </span>
            </>
          ) : (
            <>
              <Globe className="mr-1.5 h-4 w-4" />
              <span className={isInline ? 'hidden sm:inline' : ''}>
                {isPublishing ? 'Publishing...' : 'Publish'}
              </span>
            </>
          )}
        </Button>
      )}

      {book.is_published && book.status === 'ready' && (
        <>
          <Button variant="outline" size={btnSize} onClick={copyLink}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                <span className={isInline ? 'hidden sm:inline' : ''}>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                <span className={isInline ? 'hidden sm:inline' : ''}>Copy Link</span>
              </>
            )}
          </Button>
          <Button asChild variant="outline" size={btnSize}>
            <Link href={readerUrl} target="_blank">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              <span className={isInline ? 'hidden sm:inline' : ''}>Open Reader</span>
            </Link>
          </Button>
        </>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size={btnSize} disabled={isDeleting}>
            <Trash2 className={isInline ? 'h-4 w-4' : 'mr-2 h-4 w-4'} />
            <span className={isInline ? 'hidden sm:inline sm:ml-1.5' : ''}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{book.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this book, all its pages, and any
              access grants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteBook}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
