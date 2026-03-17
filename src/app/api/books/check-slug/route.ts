import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const bookId = searchParams.get('bookId') // Exclude current book from check

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const cleanSlug = slugify(slug)

  if (!cleanSlug) {
    return NextResponse.json({
      available: false,
      slug: cleanSlug,
      suggestions: [],
      error: 'Slug cannot be empty after sanitization',
    })
  }

  // Check if slug exists (excluding current book if editing)
  let query = supabase
    .from('books')
    .select('slug')
    .eq('slug', cleanSlug)

  if (bookId) {
    query = query.neq('id', bookId)
  }

  const { data } = await query

  if (!data || data.length === 0) {
    return NextResponse.json({
      available: true,
      slug: cleanSlug,
      suggestions: [],
    })
  }

  // Slug taken — generate suggestions
  const suggestions: string[] = []
  const suffixes = ['-2', '-new', `-${Date.now().toString(36).slice(-4)}`]

  for (const suffix of suffixes) {
    const candidate = `${cleanSlug}${suffix}`.slice(0, 64)
    const { data: existing } = await supabase
      .from('books')
      .select('slug')
      .eq('slug', candidate)

    if (!existing || existing.length === 0) {
      suggestions.push(candidate)
    }
  }

  return NextResponse.json({
    available: false,
    slug: cleanSlug,
    suggestions,
  })
}
