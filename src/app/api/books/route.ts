import { createClient } from '@/supabase/server'
import { processMarkdown } from '@/lib/markdown/processor'
import { generateSlug } from '@/lib/utils/slug'
import { uploadFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const file = formData.get('file') as File | null

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  const fileName = file.name.toLowerCase()
  const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.markdown')
  const isPdf = fileName.endsWith('.pdf')

  if (!isMarkdown && !isPdf) {
    return NextResponse.json(
      { error: 'Only .md and .pdf files are supported' },
      { status: 400 },
    )
  }

  const slug = generateSlug(title)
  const contentType = isMarkdown ? 'markdown' : 'pdf'

  if (isMarkdown) {
    const rawContent = await file.text()

    // Process markdown into HTML pages
    const pages = await processMarkdown(rawContent)

    // Create book record
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        creator_id: user.id,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        content_type: contentType,
        markdown_content: rawContent,
        status: 'ready',
        page_count: pages.length,
        is_published: false,
      })
      .select()
      .single()

    if (bookError) {
      return NextResponse.json({ error: bookError.message }, { status: 500 })
    }

    // Insert page records
    const pageRecords = pages.map((html, i) => ({
      book_id: book.id,
      page_number: i + 1,
      content_html: html,
    }))

    const { error: pagesError } = await supabase
      .from('book_pages')
      .insert(pageRecords)

    if (pagesError) {
      // Clean up the book if pages fail
      await supabase.from('books').delete().eq('id', book.id)
      return NextResponse.json({ error: pagesError.message }, { status: 500 })
    }

    return NextResponse.json(book, { status: 201 })
  }

  // PDF: upload to Seafile
  const bookId = crypto.randomUUID()
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

  try {
    const buffer = await file.arrayBuffer()
    const storagePath = await uploadFile(`/pdfs/${bookId}`, safeFileName, buffer)

    const useFirstPageAsCover = formData.get('useFirstPageAsCover') === 'true'

    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        id: bookId,
        creator_id: user.id,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        content_type: contentType,
        pdf_r2_key: storagePath,
        pdf_first_page_is_cover: useFirstPageAsCover,
        status: 'ready',
        page_count: 0,
        is_published: false,
      })
      .select()
      .single()

    if (bookError) {
      return NextResponse.json({ error: bookError.message }, { status: 500 })
    }

    return NextResponse.json(book, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload PDF' },
      { status: 500 },
    )
  }
}
