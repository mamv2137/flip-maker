import { ThemeSwitcher } from '@/components/theme-switcher'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'

type LibraryLayoutProps = {
  children: React.ReactNode
}

export default function LibraryLayout({ children }: LibraryLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/library" className="text-lg font-semibold">
            My Library
          </Link>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
