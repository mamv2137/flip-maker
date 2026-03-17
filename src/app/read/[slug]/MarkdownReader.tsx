import { FlipbookReader } from '@/components/reader/FlipbookReader'
import type { BookPage } from '@/components/reader/FlipbookReader'

type Props = {
  title: string
  pages: BookPage[]
  flipEnabled: boolean
}

export function MarkdownReader({ title, pages, flipEnabled }: Props) {
  return (
    <FlipbookReader
      title={title}
      pages={pages}
      defaultFlipEnabled={flipEnabled}
    />
  )
}
