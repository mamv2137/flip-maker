import { createClient } from '@/supabase/server'
import { uploadFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

type Context = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', id)
    .eq('creator_id', user.id)
    .single()

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('cover') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Cover image is required' }, { status: 400 })
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, and WebP images are supported' },
      { status: 400 },
    )
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${id}.${ext}`
    const buffer = await file.arrayBuffer()
    const storagePath = await uploadFile('/covers', fileName, buffer)

    // Update book record
    const { data: updated, error } = await supabase
      .from('books')
      .update({ cover_image_url: storagePath })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload cover' },
      { status: 500 },
    )
  }
}
