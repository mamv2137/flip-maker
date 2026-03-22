import { FlipbookReader } from '@/components/reader/FlipbookReader'
import { SignupBanner } from '@/components/reader/signup-banner'
import { UpgradeBanner } from '@/components/reader/upgrade-banner'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  pages: BookPage[]
  flipEnabled: boolean
  bookSlug: string
  showBackButton?: boolean
  showSignupBanner?: boolean
  showUpgradeBanner?: boolean
}

export function MarkdownReader({ title, pages, flipEnabled, bookSlug, showBackButton, showSignupBanner, showUpgradeBanner }: Props) {
  return (
    <>
      {showUpgradeBanner && <UpgradeBanner />}
      {showSignupBanner && <SignupBanner />}
      <FlipbookReader
        title={title}
        pages={pages}
        defaultFlipEnabled={flipEnabled}
        bookSlug={bookSlug}
        showBackButton={showBackButton}
      />
    </>
  )
}
