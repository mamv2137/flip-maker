
import { createClient } from '@/supabase/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { verifyMagicLinkToken } from '@/lib/magic-link'
import { MarkdownReader } from './MarkdownReader'
import { PdfReaderWrapper } from './PdfReaderWrapper'
import { AccessGate } from './AccessGate'
import { BookNotFound } from './BookNotFound'
import type { Metadata } from 'next'
import type { BookPage } from '@/components/reader/FlipbookReader'
import { resolveFileUrl, resolvePdfUrl } from '@/lib/storage'
import { checkCanViewBook } from '@/lib/check-plan-limits'
import { ViewCounter } from '@/components/reader/view-counter'
import { Watermark } from '@/components/reader/watermark'
import { getPlanLimits, type Plan } from '@/lib/plans'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string; preview?: string; domain?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase.rpc('get_book_access_info', { book_slug: slug })
  const book = data?.[0]

  if (!book) return { title: 'Not Found' }

  return {
    title: book.title,
    description: `Read ${book.title}`,
  }
}

export default async function ReaderPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { token, preview, domain } = await searchParams
  const supabase = await createClient()

  let hasValidToken = false

  // Verify magic link token if provided
  if (token) {
    const payload = await verifyMagicLinkToken(token)
    if (payload) {
      hasValidToken = true
      await supabase
        .from('access_grants')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', payload.grantId)
    }
  }

  // Resolve the book slug — custom domains get rewritten by middleware
  const resolvedSlug = domain
    ? await (async () => {
        const { data } = await supabase.rpc('get_book_by_domain', { lookup_domain: domain })
        return data?.[0]?.slug as string | undefined
      })()
    : slug

  if (!resolvedSlug) {
    return <BookNotFound />
  }

  // Get book info via RPC (bypasses RLS — works for any user including unauthenticated)
  const { data: bookData } = await supabase.rpc('get_book_access_info', { book_slug: resolvedSlug })
  const book = bookData?.[0]

  // Book truly doesn't exist
  if (!book) {
    return <BookNotFound />
  }

  // Check auth
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub as string | undefined
  const isCreator = !!userId && userId === book.creator_id
  const isLoggedIn = !!userId

  // Book not ready
  if (book.status !== 'ready') {
    if (isCreator) {
      return <BookNotFound />
    }
    return <BookNotFound />
  }

  // Book not published — only creator can preview
  if (!book.is_published && !isCreator) {
    return (
      <AccessGate
        bookId={book.id}
        bookTitle={book.title}
        bookSlug={slug}
        visibility="private"
        isLoggedIn={isLoggedIn}
      />
    )
  }

  // Preview mode — creator can see unpublished
  if (!book.is_published && isCreator && preview !== 'true') {
    return <BookNotFound />
  }

  // Access control for non-creators
  if (!isCreator && !hasValidToken) {
    // Password-protected
    if (book.visibility === 'password') {
      let passwordValid = false

      if (book.password_hash) {
        const cookieStore = await cookies()
        const pwCookie = cookieStore.get(`book-pw-${book.id}`)
        if (pwCookie?.value) {
          const hash = createHash('sha256').update(pwCookie.value).digest('hex')
          passwordValid = hash === book.password_hash
        }
      }

      if (!passwordValid) {
        return (
          <AccessGate
            bookId={book.id}
            bookTitle={book.title}
            bookSlug={slug}
            visibility="password"
            isLoggedIn={isLoggedIn}
          />
        )
      }
    }

    // Private — check access grants
    if (book.visibility === 'private') {
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
        return (
          <AccessGate
            bookId={book.id}
            bookTitle={book.title}
            bookSlug={slug}
            visibility="private"
            isLoggedIn={isLoggedIn}
          />
        )
      }
    }
  }

  // === Check view limits + creator plan ===
  const viewCheck = await checkCanViewBook(book.creator_id)
  console.log('[reader] viewCheck:', { showWatermark: viewCheck.showWatermark, allowed: viewCheck.allowed, creatorId: book.creator_id })

  // Get creator's plan to determine banner type
  let creatorPlan: Plan = 'free'
  if (isCreator) {
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', book.creator_id)
      .single()
    creatorPlan = (creatorProfile?.plan || 'free') as Plan
  }

  // Determine which banner to show:
  // - Not logged in → signup banner
  // - Creator on free plan → upgrade banner
  // - Otherwise → no banner
  const showSignupBanner = !isLoggedIn
  const showUpgradeBanner = isCreator && creatorPlan === 'free'

  if (!viewCheck.allowed && !isCreator) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">View limit reached</h1>
        <p className="text-muted-foreground max-w-md text-sm">{viewCheck.reason}</p>
      </div>
    )
  }

  const coverPage: BookPage | null = book.cover_image_url
    ? { type: 'image', content: resolveFileUrl(book.cover_image_url), pageNumber: 0 }
    : null

  const pdfUrl = resolvePdfUrl(book)
  if (book.content_type === 'pdf' && pdfUrl) {
    return (
      <>
        <ViewCounter bookId={book.id} />
        {viewCheck.showWatermark && <Watermark />}
        <PdfReaderWrapper
          title={book.title}
          bookId={book.id}
          pdfUrl={pdfUrl}
          flipEnabled={book.flip_effect_enabled}
          coverPage={coverPage}
          skipFirstPage={book.pdf_first_page_is_cover && !!coverPage}
          bookSlug={slug}
          showBackButton={isCreator}
          showSignupBanner={showSignupBanner}
          showUpgradeBanner={showUpgradeBanner}
          showWatermark={viewCheck.showWatermark}
        />
      </>
    )
  }

  // Markdown book
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
    <>
      <ViewCounter bookId={book.id} />
      {viewCheck.showWatermark && <Watermark />}
      <MarkdownReader
        title={book.title}
        pages={pages}
        flipEnabled={book.flip_effect_enabled}
        bookId={book.id}
        bookSlug={slug}
        showBackButton={isCreator}
        showSignupBanner={showSignupBanner}
        showUpgradeBanner={showUpgradeBanner}
      />
    </>
  )
}
