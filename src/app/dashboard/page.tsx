
import { createClient } from '@/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
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
          <p className="text-muted-foreground">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4 text-lg">
              No books yet. Create your first flipbook.
            </p>
            <Button asChild>
              <Link href="/dashboard/books/new">
                <Plus className="mr-2 h-4 w-4" />
                New Book
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/dashboard/books/${book.id}`}>
              <Card className="hover:border-foreground/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <Badge
                      variant={
                        book.status === 'ready' ? 'default' : 'secondary'
                      }
                    >
                      {book.status}
                    </Badge>
                  </div>
                  <CardDescription>{book.content_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>
                      {book.page_count} {book.page_count === 1 ? 'page' : 'pages'}
                    </span>
                    <span>
                      {book.is_published ? 'Published' : 'Draft'}
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
