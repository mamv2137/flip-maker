import { createClient } from '@/supabase/server'
import { DashboardNavbar } from '@/components/dashboard-navbar'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = (data?.claims?.email as string) || ''

  // Fetch display name from profile
  let displayName: string | null = null
  if (data?.claims?.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', data.claims.sub as string)
      .single()
    displayName = profile?.display_name ?? null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar userEmail={email} displayName={displayName} />
      <main className="mx-auto w-full max-w-6xl flex-1 overflow-x-hidden px-4 py-8">
        {children}
      </main>
    </div>
  )
}
