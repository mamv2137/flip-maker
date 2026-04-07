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
import {
  ChevronLeft,
  FileText,
  File,
  BookOpen,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookActions } from '@/components/book-actions'
import { ShareBookForm } from '@/components/share-book-form'
import { BookEditForm } from '@/components/book-edit-form'
import { CoverUpload } from '@/components/cover-upload'
import { Separator } from '@/components/ui/separator'
import { getPlanLimits, type Plan } from '@/lib/plans'

type Props = {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: book }, { data: { user } }] = await Promise.all([
    supabase.from('books').select('*, categories(name, emoji)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!book) {
    notFound()
  }

  const category = book.categories as { name: string; emoji: string } | null

  // Get creator's plan for feature gating
  let userPlan: Plan = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    userPlan = (profile?.plan || 'free') as Plan
  }
  const planLimits = getPlanLimits(userPlan)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Books
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
            <Badge variant={book.status === 'ready' ? 'default' : 'secondary'}>
              {book.status}
            </Badge>
            {book.is_published && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Published
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {book.status === 'ready' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/read/${book.slug}?preview=true`} target="_blank">
                  <Eye className="mr-1.5 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <BookActions book={book} variant="inline" />
          </div>
        </div>
        {book.description && (
          <p className="text-muted-foreground mt-1">{book.description}</p>
        )}
      </div>

      {/* Two-column layout: Preview (sticky) | Edit (scrollable) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
        {/* LEFT: Cover + Quick Info — sticky on desktop */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          {/* Cover */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cover</CardTitle>
            </CardHeader>
            <CardContent>
              <CoverUpload
                bookId={book.id}
                currentCover={book.cover_image_url ? resolveFileUrl(book.cover_image_url) : null}
              />
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="pt-6">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    {book.content_type === 'pdf' ? (
                      <File className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    {book.content_type === 'pdf' ? 'PDF' : 'Markdown'}
                  </dd>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Pages</dt>
                  <dd className="font-medium">{book.page_count}</dd>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="font-medium">
                    {book.drive_file_id ? 'Google Drive' : 'Uploaded'}
                  </dd>
                </div>
                {category && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">
                        {category.emoji} {category.name}
                      </dd>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Slug</dt>
                  <dd className="font-mono text-xs">{book.slug}</dd>
                </div>
                {book.is_published && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Reader URL</dt>
                      <dd>
                        <Link
                          href={`/read/${book.slug}`}
                          target="_blank"
                          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          /read/{book.slug}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Edit Details + Share & Access */}
        <div className="flex min-w-0 flex-col gap-6">
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

          {/* Share & Access */}
          <Card>
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
                  customDomain={book.custom_domain}
                  hasCustomDomainFeature={planLimits.hasCustomDomain}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <BookOpen className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Publish this book to enable sharing and access controls.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
