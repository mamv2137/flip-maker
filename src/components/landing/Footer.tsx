import { BookOpen } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span>Flipbooks</span>
        </div>
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Flipbooks
        </p>
      </div>
    </footer>
  )
}
