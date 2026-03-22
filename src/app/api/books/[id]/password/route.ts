import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

type Context = { params: Promise<{ id: string }> }

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// PUT: Set or update book password (creator only)
export async function PUT(request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { password } = await request.json()

  if (!password || password.length < 4) {
    return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
  }

  const { error } = await supabase
    .from('books')
    .update({
      password_hash: hashPassword(password),
      visibility: 'password',
    })
    .eq('id', id)
    .eq('creator_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// POST: Verify password (public, for readers)
export async function POST(request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()

  const { password } = await request.json()

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const { data: book } = await supabase
    .from('books')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (!book?.password_hash) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const valid = book.password_hash === hashPassword(password)

  return NextResponse.json({ valid })
}
