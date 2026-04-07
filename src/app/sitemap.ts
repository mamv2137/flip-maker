import { createClient } from '@/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bukify.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Published books (public only)
  const { data: books } = await supabase
    .from('books')
    .select('slug, updated_at')
    .eq('is_published', true)
    .eq('visibility', 'public')
    .eq('status', 'ready')

  const bookPages: MetadataRoute.Sitemap = (books ?? []).map((book) => ({
    url: `${BASE_URL}/read/${book.slug}`,
    lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...bookPages]
}
