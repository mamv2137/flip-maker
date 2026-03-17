import { createClient } from '@/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  const { data: grants } = await supabase
    .from('access_grants')
    .select('*, books(*)')
    .eq('buyer_id', userId)

  const books = grants?.map((g) => g.books).filter(Boolean) ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground">Books shared with you</p>
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-lg">
              No books in your library yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/read/${book.slug}`}>
              <Card className="hover:border-foreground/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {book.page_count} {book.page_count === 1 ? 'page' : 'pages'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
