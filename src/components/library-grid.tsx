'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { BookOpen, Library } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarRating } from '@/components/star-rating'
import { resolveFileUrl } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type BookWithMeta = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  page_count: number
  content_type: string
  authorName: string
  authorAvatar: string | null
  categoryName: string | null
  categoryEmoji: string | null
  rating: { average: number; count: number }
  userRating: number
}

function getInitials(name: string): string {
  return name
    .split(/\s/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
}

export function LibraryGrid({ books }: { books: BookWithMeta[] }) {
  const router = useRouter()
  const [ratingLoading, setRatingLoading] = useState<string | null>(null)

  const handleRate = async (bookId: string, rating: number) => {
    setRatingLoading(bookId)
    try {
      await fetch(`/api/books/${bookId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      router.refresh()
    } finally {
      setRatingLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground mt-1">Books shared with you</p>
      </motion.div>

      {books.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Library className="text-muted-foreground h-8 w-8" />
              </div>
              <p className="text-muted-foreground text-lg">
                No books in your library yet.
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Books shared with you will appear here.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            >
              <Link href={`/read/${book.slug}`}>
                <Card className="group overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md">
                  {/* Cover */}
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
                      {book.categoryEmoji && book.categoryName && (
                        <span className="text-muted-foreground flex-shrink-0 text-xs">
                          {book.categoryEmoji} {book.categoryName}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {book.authorAvatar && (
                          <AvatarImage src={book.authorAvatar} alt={book.authorName} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(book.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-xs">{book.authorName}</span>
                    </div>

                    {/* Rating */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.preventDefault()}
                    >
                      <StarRating
                        rating={book.userRating || book.rating.average}
                        interactive
                        onRate={(r) => handleRate(book.id, r)}
                      />
                      <span className="text-muted-foreground text-xs">
                        {book.rating.count > 0
                          ? `${book.rating.average} (${book.rating.count})`
                          : 'Not rated'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
