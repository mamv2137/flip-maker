import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('book_ratings')
    .select('rating')
    .eq('book_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const count = data.length
  const average = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0

  return NextResponse.json({ average: Math.round(average * 10) / 10, count })
}

export async function POST(request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const rating = body.rating

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('book_ratings')
    .upsert(
      { book_id: id, user_id: user.id, rating },
      { onConflict: 'book_id,user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
