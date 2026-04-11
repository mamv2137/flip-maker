import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './globals.css'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { Toaster } from '@/components/ui/sonner'

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || (
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
)

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'Bukify — Interactive Flipbooks from PDFs',
    template: '%s | Bukify',
  },
  description: 'Create interactive flipbooks from PDFs in seconds. Google Drive integration, 3D page-flip effect, password protection, and analytics. Free forever.',
  openGraph: {
    type: 'website',
    siteName: 'Bukify',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Bukify — Interactive Flipbooks' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
})

type RootLayoutProps = {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers()
  const lang = headersList.get('x-locale') || 'es'

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Bukify',
                  url: 'https://bukify.io',
                  logo: 'https://bukify.io/opengraph-image.png',
                  description: 'Platform that transforms PDFs into interactive flipbooks with 3D page-turn effects for creators and businesses in Latin America.',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'qiubitlabs@gmail.com',
                    contactType: 'customer support',
                  },
                },
                {
                  '@type': 'WebSite',
                  name: 'Bukify',
                  url: 'https://bukify.io',
                },
                {
                  '@type': 'WebPage',
                  name: 'Privacy Policy',
                  url: 'https://bukify.io/privacy',
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Bukify',
                  url: 'https://bukify.io',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  offers: [
                    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
                    { '@type': 'Offer', price: '7', priceCurrency: 'USD', name: 'Creator' },
                    { '@type': 'Offer', price: '15', priceCurrency: 'USD', name: 'Pro Seller' },
                  ],
                  featureList: 'Google Drive integration, 3D page-flip effect, password protection, email access control, analytics, custom domains',
                },
              ],
            }),
          }}
        />
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster richColors position="bottom-right" />
            <Analytics />
            <ReactQueryDevtools initialIsOpen={false} />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
