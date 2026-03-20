
import { createClient } from '@/supabase/server'
import { resolveFileUrl } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, FileText, File } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your flipbooks
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">
            <Plus className="mr-2 h-4 w-4" />
            New Book
          </Link>
        </Button>
      </div>

      {!books || books.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <BookOpen className="text-muted-foreground h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">No books yet</h2>
            <p className="text-muted-foreground mb-6 mt-1 max-w-sm text-center text-sm">
              Upload a PDF or Markdown file to create your first interactive flipbook.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/books/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first book
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/dashboard/books/${book.id}`}>
              <Card className="group overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md">
                {book.cover_image_url ? (
                  <div className="bg-muted aspect-[3/2] w-full overflow-hidden">
                    <img
                      src={resolveFileUrl(book.cover_image_url)}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="bg-muted flex aspect-[3/2] w-full items-center justify-center">
                    <BookOpen className="text-muted-foreground h-10 w-10" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">{book.title}</CardTitle>
                    {book.is_published ? (
                      <Badge variant="default" className="flex-shrink-0 bg-emerald-500 text-[11px] hover:bg-emerald-600">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex-shrink-0 text-[11px]">
                        Draft
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      {book.content_type === 'pdf' ? (
                        <File className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {book.content_type === 'pdf' ? 'PDF' : 'Markdown'}
                    </span>
                    <span>
                      {book.page_count} {book.page_count === 1 ? 'page' : 'pages'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
