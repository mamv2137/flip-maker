import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { AuthButton } from '@/components/auth-button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import Link from 'next/link'
import { Suspense } from 'react'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold">
              Flipbooks
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Books
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
