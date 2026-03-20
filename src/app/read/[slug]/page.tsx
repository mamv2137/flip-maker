
import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import { verifyMagicLinkToken } from '@/lib/magic-link'
import { MarkdownReader } from './MarkdownReader'
import { PdfReaderWrapper } from './PdfReaderWrapper'
import { AccessDenied } from './AccessDenied'
import type { Metadata } from 'next'
import type { BookPage } from '@/components/reader/FlipbookReader'
import { resolveFileUrl, resolvePdfUrl } from '@/lib/storage'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!book) return { title: 'Not Found' }

  return {
    title: book.title,
    description: book.description || `Read ${book.title}`,
  }
}

export default async function ReaderPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { token } = await searchParams
  const supabase = await createClient()

  let hasValidToken = false

  // Verify magic link token if provided
  if (token) {
    const payload = await verifyMagicLinkToken(token)
    if (payload) {
      hasValidToken = true
      // Mark access grant as accessed
      await supabase
        .from('access_grants')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', payload.grantId)
    }
  }

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!book || book.status !== 'ready') {
    notFound()
  }

  // Check if the current user is the creator (used for back button + access control)
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub as string | undefined
  const isCreator = !!userId && userId === book.creator_id

  // Access control for private books
  if (book.visibility === 'private' && !hasValidToken && !isCreator) {
    let hasAccess = false

    if (userId) {
      const { data: grant } = await supabase
        .from('access_grants')
        .select('id')
        .eq('book_id', book.id)
        .eq('buyer_id', userId)
        .limit(1)
        .maybeSingle()

      hasAccess = !!grant
    }

    if (!hasAccess) {
      return <AccessDenied bookTitle={book.title} />
    }
  }

  // Build cover page if cover image exists
  const coverPage: BookPage | null = book.cover_image_url
    ? { type: 'image', content: resolveFileUrl(book.cover_image_url), pageNumber: 0 }
    : null

  const pdfUrl = resolvePdfUrl(book)
  if (book.content_type === 'pdf' && pdfUrl) {
    return (
      <PdfReaderWrapper
        title={book.title}
        bookId={book.id}
        pdfUrl={pdfUrl}
        flipEnabled={book.flip_effect_enabled}
        coverPage={coverPage}
        skipFirstPage={book.pdf_first_page_is_cover && !!coverPage}
        bookSlug={slug}
        showBackButton={isCreator}
      />
    )
  }

  // Markdown book — fetch pre-rendered pages
  const { data: bookPages } = await supabase
    .from('book_pages')
    .select('*')
    .eq('book_id', book.id)
    .order('page_number', { ascending: true })

  const contentPages: BookPage[] = (bookPages ?? []).map((p) => ({
    type: 'html' as const,
    content: p.content_html ?? '',
    pageNumber: p.page_number,
  }))

  const pages = coverPage ? [coverPage, ...contentPages] : contentPages

  if (pages.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">This book has no pages.</p>
      </div>
    )
  }

  return (
    <MarkdownReader
      title={book.title}
      pages={pages}
      flipEnabled={book.flip_effect_enabled}
      bookSlug={slug}
      showBackButton={isCreator}
    />
  )
}
