'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { BookOpen, FileText, File, Plus, Eye, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { resolveFileUrl } from '@/lib/storage'
import { useState } from 'react'
import { toast } from 'sonner'

type Book = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  content_type: string
  is_published: boolean
  page_count: number
}

export function DashboardBookGrid({ books }: { books: Book[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyLink = async (slug: string, bookId: string) => {
    const url = `${window.location.origin}/read/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(bookId)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your flipbooks
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">
            <Plus className="mr-2 h-4 w-4" />
            New Book
          </Link>
        </Button>
      </motion.div>

      {/* Compact list */}
      <div className="divide-y rounded-lg border">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
          >
            {/* Cover thumbnail */}
            <Link
              href={`/dashboard/books/${book.id}`}
              className="shrink-0"
            >
              {book.cover_image_url ? (
                <div className="h-16 w-12 overflow-hidden rounded-md border bg-muted">
                  <img
                    src={resolveFileUrl(book.cover_image_url)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded-md border bg-muted">
                  <BookOpen className="text-muted-foreground h-5 w-5" />
                </div>
              )}
            </Link>

            {/* Info */}
            <Link
              href={`/dashboard/books/${book.id}`}
              className="min-w-0 flex-1"
            >
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{book.title}</p>
                {book.is_published ? (
                  <Badge
                    variant="default"
                    className="shrink-0 bg-emerald-500 text-[10px] hover:bg-emerald-600"
                  >
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Draft
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  {book.content_type === 'pdf' ? (
                    <File className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  {book.content_type === 'pdf' ? 'PDF' : 'Markdown'}
                </span>
                <span>{book.page_count} {book.page_count === 1 ? 'page' : 'pages'}</span>
              </div>
            </Link>

            {/* Quick actions */}
            <div className="flex shrink-0 items-center gap-1">
              {book.is_published && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      copyLink(book.slug, book.id)
                    }}
                    title="Copy reader link"
                  >
                    {copied === book.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    title="Open reader"
                  >
                    <Link href={`/read/${book.slug}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
                title="Preview"
              >
                <Link href={`/read/${book.slug}?preview=true`} target="_blank">
                  <Eye className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
