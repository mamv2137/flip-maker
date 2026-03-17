import { FlipbookReader } from '@/components/reader/FlipbookReader'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  pages: BookPage[]
  flipEnabled: boolean
  bookSlug: string
}

export function MarkdownReader({ title, pages, flipEnabled, bookSlug }: Props) {
  return (
    <FlipbookReader
      title={title}
      pages={pages}
      defaultFlipEnabled={flipEnabled}
      bookSlug={bookSlug}
    />
  )
}
