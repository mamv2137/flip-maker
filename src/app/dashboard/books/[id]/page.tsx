
import { createClient } from '@/supabase/server'
import { resolveFileUrl } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BookActions } from '@/components/book-actions'
import { ShareBookForm } from '@/components/share-book-form'
import { BookEditForm } from '@/components/book-edit-form'
import { CoverUpload } from '@/components/cover-upload'

type Props = {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (!book) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Books
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
          <Badge variant={book.status === 'ready' ? 'default' : 'secondary'}>
            {book.status}
          </Badge>
          {book.is_published && (
            <Badge variant="outline">Published</Badge>
          )}
        </div>
        {book.description && (
          <p className="text-muted-foreground mt-1">{book.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Cover */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover</CardTitle>
            <CardDescription>
              Upload a cover image for your book
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoverUpload
              bookId={book.id}
              currentCover={book.cover_image_url ? resolveFileUrl(book.cover_image_url) : null}
            />
          </CardContent>
        </Card>

        {/* Edit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Details</CardTitle>
            <CardDescription>
              Update your book&apos;s title, description, and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookEditForm book={book} />
          </CardContent>
        </Card>

        {/* Share */}
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Share & Access</CardTitle>
            <CardDescription>
              {book.is_published
                ? 'Control who can access your book and share it with readers.'
                : 'Publish your book first to share it.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {book.is_published && book.status === 'ready' ? (
              <ShareBookForm
                bookId={book.id}
                bookSlug={book.slug}
                visibility={book.visibility ?? 'public'}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                Publish this book to enable sharing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info row */}
      <Card>
        <CardContent className="py-4">
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium">{book.content_type}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Pages</dt>
              <dd className="font-medium">{book.page_count}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono text-xs">{book.slug}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <BookActions book={book} />
    </div>
  )
}
