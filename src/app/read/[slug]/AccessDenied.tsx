import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
  bookTitle: string
}

export function AccessDenied({ bookTitle }: Props) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Lock className="text-muted-foreground h-12 w-12" />
      <h1 className="text-xl font-semibold">This book is private</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        <span className="font-medium">{bookTitle}</span> is only available to
        invited readers. If you received a magic link, please use that link to
        access the book.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
