
import { createClient } from '@/supabase/server'
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

  const readerUrl = `/read/${book.slug}`

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{book.content_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pages</dt>
                <dd className="font-medium">{book.page_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">3D Flip</dt>
                <dd className="font-medium">
                  {book.flip_effect_enabled ? 'On' : 'Off'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-mono text-xs">{book.slug}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Share</CardTitle>
            <CardDescription>
              {book.is_published
                ? 'Send a magic link to give someone instant access.'
                : 'Publish your book first to share it.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {book.is_published && book.status === 'ready' ? (
              <ShareBookForm bookId={book.id} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Publish this book to enable sharing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BookActions book={book} />
    </div>
  )
}
