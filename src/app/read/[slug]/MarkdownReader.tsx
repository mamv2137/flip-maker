import { FlipbookReader } from '@/components/reader/FlipbookReader'
import { SignupBanner } from '@/components/reader/signup-banner'
import { UpgradeBanner } from '@/components/reader/upgrade-banner'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  pages: BookPage[]
  flipEnabled: boolean
  bookId?: string
  bookSlug: string
  showBackButton?: boolean
  showSignupBanner?: boolean
  showUpgradeBanner?: boolean
  isAuthenticated?: boolean
}

export function MarkdownReader({ title, pages, flipEnabled, bookId, bookSlug, showBackButton, showSignupBanner, showUpgradeBanner, isAuthenticated }: Props) {
  return (
    <>
      {showUpgradeBanner && <UpgradeBanner />}
      {showSignupBanner && <SignupBanner />}
      <FlipbookReader
        title={title}
        pages={pages}
        defaultFlipEnabled={flipEnabled}
        bookId={bookId}
        bookSlug={bookSlug}
        showBackButton={showBackButton}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}
