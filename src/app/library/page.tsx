import { createClient } from '@/supabase/server'
import { LibraryGrid } from '@/components/library-grid'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  // Fetch books the user has access to, with author profile and category
  const { data: grants } = await supabase
    .from('access_grants')
    .select(`
      *,
      books (
        id, title, slug, cover_image_url, page_count, content_type,
        categories ( name, emoji ),
        profiles:creator_id ( display_name, avatar_url )
      )
    `)
    .eq('buyer_id', userId)

  // Fetch average ratings for those books
  const books = (grants?.map((g) => g.books).filter(Boolean) ?? []) as Array<{
    id: string
    title: string
    slug: string
    cover_image_url: string | null
    page_count: number
    content_type: string
    categories: { name: string; emoji: string } | null
    profiles: { display_name: string | null; avatar_url: string | null } | null
  }>

  const bookIds = books.map((b) => b.id)
  let ratingsMap: Record<string, { average: number; count: number }> = {}

  if (bookIds.length > 0) {
    const { data: ratings } = await supabase
      .from('book_ratings')
      .select('book_id, rating')
      .in('book_id', bookIds)

    if (ratings) {
      const grouped: Record<string, number[]> = {}
      for (const r of ratings) {
        if (!grouped[r.book_id]) grouped[r.book_id] = []
        grouped[r.book_id].push(r.rating)
      }
      for (const [bookId, vals] of Object.entries(grouped)) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length
        ratingsMap[bookId] = {
          average: Math.round(avg * 10) / 10,
          count: vals.length,
        }
      }
    }
  }

  // Get current user's ratings
  let userRatings: Record<string, number> = {}
  if (userId && bookIds.length > 0) {
    const { data: myRatings } = await supabase
      .from('book_ratings')
      .select('book_id, rating')
      .eq('user_id', userId)
      .in('book_id', bookIds)

    if (myRatings) {
      for (const r of myRatings) {
        userRatings[r.book_id] = r.rating
      }
    }
  }

  const booksWithMeta = books.map((book) => ({
    ...book,
    authorName: book.profiles?.display_name || 'Unknown',
    authorAvatar: book.profiles?.avatar_url || null,
    categoryName: book.categories?.name || null,
    categoryEmoji: book.categories?.emoji || null,
    rating: ratingsMap[book.id] || { average: 0, count: 0 },
    userRating: userRatings[book.id] || 0,
  }))

  return <LibraryGrid books={booksWithMeta} />
}
