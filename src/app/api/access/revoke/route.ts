import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/access/revoke — revoke an access grant
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { grantId } = await request.json()

  if (!grantId) {
    return NextResponse.json({ error: 'grantId is required' }, { status: 400 })
  }

  // Verify the grant belongs to a book owned by this creator
  const { data: grant } = await supabase
    .from('access_grants')
    .select('id, book_id, books!inner(creator_id)')
    .eq('id', grantId)
    .single()

  if (!grant || (grant as Record<string, unknown>).books === null) {
    return NextResponse.json({ error: 'Grant not found' }, { status: 404 })
  }

  const books = (grant as Record<string, unknown>).books as { creator_id: string }
  if (books.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('access_grants')
    .delete()
    .eq('id', grantId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
