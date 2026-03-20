import { createClient } from '@/supabase/server'
import { DashboardNavbar } from '@/components/dashboard-navbar'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims?.email as string) || ''

  let displayName: string | null = null
  let avatarUrl: string | null = null
  if (data?.claims?.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', data.claims.sub as string)
      .single()
    displayName = profile?.display_name ?? null
    avatarUrl = profile?.avatar_url ?? null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar userEmail={email} displayName={displayName} avatarUrl={avatarUrl} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
