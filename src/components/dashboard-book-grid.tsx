'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { BookOpen, FileText, File, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { resolveFileUrl } from '@/lib/storage'

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
  return (
    <div className="flex flex-col gap-8">
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

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
              ease: 'easeOut',
            }}
          >
            <Link href={`/dashboard/books/${book.id}`}>
              <Card className="group overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md">
                {book.cover_image_url ? (
                  <div className="bg-muted aspect-[3/2] w-full overflow-hidden">
                    <img
                      src={resolveFileUrl(book.cover_image_url)}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="bg-muted flex aspect-[3/2] w-full items-center justify-center">
                    <BookOpen className="text-muted-foreground h-10 w-10" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">{book.title}</CardTitle>
                    {book.is_published ? (
                      <Badge
                        variant="default"
                        className="flex-shrink-0 bg-emerald-500 text-[11px] hover:bg-emerald-600"
                      >
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex-shrink-0 text-[11px]">
                        Draft
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      {book.content_type === 'pdf' ? (
                        <File className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {book.content_type === 'pdf' ? 'PDF' : 'Markdown'}
                    </span>
                    <span>
                      {book.page_count} {book.page_count === 1 ? 'page' : 'pages'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
