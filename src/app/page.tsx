import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bukify - Tu Google Drive, tu flipbook interactivo',
  description: 'Conecta tu Google Drive, elige un PDF y comparte un flipbook interactivo premium — gratis, en segundos.',
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/en' },
  },
}

export default function Home() {
  return <LandingPage lang="es" />
}
