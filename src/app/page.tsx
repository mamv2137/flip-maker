import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bukify — Convierte PDFs en experiencias que venden',
  description: 'Pega un link de Google Drive y en segundos tienes un libro interactivo con efecto 3D listo para compartir. Sin subidas, sin fricción.',
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/en' },
  },
}

export default function Home() {
  return <LandingPage lang="es" />
}
