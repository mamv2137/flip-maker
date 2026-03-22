import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flipbooks - Your Google Drive, your interactive flipbook',
  description: 'Connect your Google Drive, pick a PDF, and share a premium interactive flipbook — free, in seconds.',
  alternates: {
    canonical: '/en',
    languages: { es: '/', en: '/en' },
  },
}

export default function EnglishHome() {
  return <LandingPage lang="en" />
}
