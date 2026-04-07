import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bukify — Free Interactive Flipbook Maker from PDFs',
  description: 'Create interactive flipbooks from PDFs in seconds. Google Drive integration, 3D page-flip effect, password protection, and analytics. Free forever, no uploads needed.',
  alternates: {
    canonical: '/en',
    languages: { es: '/', en: '/en' },
  },
  openGraph: {
    title: 'Bukify — Turn PDFs into experiences that sell',
    description: 'Paste a Google Drive link and get a stunning interactive book with 3D page-turns in seconds.',
    url: 'https://bukify.io/en',
  },
  keywords: ['flipbook maker', 'PDF flipbook', 'interactive PDF', 'free flipbook creator', 'digital publishing', 'ebook maker'],
}

export default function EnglishHome() {
  return <LandingPage lang="en" />
}
