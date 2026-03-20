import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#process' },
    { label: 'Demo', href: '#demo' },
  ],
  Resources: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Sign Up', href: '/auth/sign-up' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <span>Flipbooks</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Transform your content into premium interactive flipbooks.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/5 pt-6">
          <p className="text-center text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} Flipbooks. All rights reserved.
          </p>
        </div>
      </div>

      {/* Large watermark text like Linkify */}
      <div className="overflow-hidden border-t border-white/5 py-8">
        <p className="text-center text-6xl font-bold tracking-widest text-white/[0.03] sm:text-8xl">
          FLIPBOOKS
        </p>
      </div>
    </footer>
  )
}
