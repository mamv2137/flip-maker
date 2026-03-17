
import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import { verifyMagicLinkToken } from '@/lib/magic-link'
import { MarkdownReader } from './MarkdownReader'
import { PdfReaderWrapper } from './PdfReaderWrapper'
import type { Metadata } from 'next'
import type { BookPage } from '@/components/reader/FlipbookReader'

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

  // Verify magic link token if provided
  if (token) {
    const payload = await verifyMagicLinkToken(token)
    if (payload) {
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

  // Build cover page if cover image exists
  const coverPage: BookPage | null = book.cover_image_url
    ? { type: 'image', content: book.cover_image_url, pageNumber: 0 }
    : null

  if (book.content_type === 'pdf' && book.pdf_r2_key) {
    return (
      <PdfReaderWrapper
        title={book.title}
        bookId={book.id}
        pdfUrl={book.pdf_r2_key}
        flipEnabled={book.flip_effect_enabled}
        coverPage={coverPage}
        skipFirstPage={book.pdf_first_page_is_cover && !!coverPage}
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
    />
  )
}
