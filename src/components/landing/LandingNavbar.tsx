import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import type { Dictionary } from '@/i18n/get-dictionary'
import type { Locale } from '@/i18n/config'

type Props = {
  isAuthenticated: boolean
  t: Dictionary['landing']['nav']
  lang: Locale
}

export function LandingNavbar({ isAuthenticated, t, lang }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <span>Bukify</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-neutral-400 md:flex" aria-label="Main navigation">
          <Link href="#features" className="rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2">
            {t.features}
          </Link>
          <Link href="#process" className="rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2">
            {t.howItWorks}
          </Link>
          <Link href="#demo" className="rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2">
            {t.demo}
          </Link>
          <Link href="#pricing" className="rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2">
            {t.pricing}
          </Link>
          {/* Language switcher */}
          <div className="flex items-center gap-1 text-xs">
            <Link
              href="/"
              className={`rounded px-1.5 py-0.5 transition-colors ${lang === 'es' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
            >
              ES
            </Link>
            <Link
              href="/en"
              className={`rounded px-1.5 py-0.5 transition-colors ${lang === 'en' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
            >
              EN
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Link href="/dashboard">{t.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-neutral-300 hover:bg-white/5 hover:text-white"
              >
                <Link href="/auth/login">{t.signIn}</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-white text-black hover:bg-neutral-200"
              >
                <Link href="/auth/sign-up">{t.getStarted}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
