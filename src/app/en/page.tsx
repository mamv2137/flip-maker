import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bukify — Turn PDFs into experiences that sell',
  description: 'Paste a Google Drive link and get a stunning interactive book with 3D page-turns in seconds. No uploads, no friction.',
  alternates: {
    canonical: '/en',
    languages: { es: '/', en: '/en' },
  },
}

export default function EnglishHome() {
  return <LandingPage lang="en" />
}
