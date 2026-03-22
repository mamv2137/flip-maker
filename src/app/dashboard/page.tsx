import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { Onboarding } from '@/components/onboarding'
import { DashboardBookGrid } from '@/components/dashboard-book-grid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const hasBooks = books && books.length > 0

  return hasBooks ? (
    <DashboardBookGrid books={books} />
  ) : (
    <Onboarding displayName={profile?.display_name ?? null} />
  )
}
