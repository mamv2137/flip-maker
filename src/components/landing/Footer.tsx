import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { Dictionary } from '@/i18n/get-dictionary'

type Props = {
  t: Dictionary['landing']['footer']
  brand: string
}

export function Footer({ t, brand }: Props) {
  const footerLinks = {
    [t.product]: [
      { label: t.product, href: '#features' },
      { label: t.resources, href: '#process' },
      { label: 'Demo', href: '#demo' },
    ],
    [t.resources]: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: t.signUp, href: '/auth/sign-up' },
    ],
    [t.legal]: [
      { label: t.privacy, href: '/privacy' },
      { label: t.terms, href: '/terms' },
    ],
  }

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <span>{brand}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">{t.description}</p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-neutral-600">
            {t.copyright.replace('{year}', new Date().getFullYear().toString())}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-neutral-500 transition-colors hover:text-white">
              {t.privacy}
            </Link>
            <Link href="/terms" className="text-sm text-neutral-500 transition-colors hover:text-white">
              {t.terms}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-white/5 py-8">
        <p className="text-center text-6xl font-bold tracking-widest text-white/[0.03] sm:text-8xl">
          {brand.toUpperCase()}
        </p>
      </div>
    </footer>
  )
}
