import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bukify — Convierte PDFs en flipbooks interactivos gratis',
  description: 'Crea flipbooks interactivos desde PDFs en segundos. Integración con Google Drive, efecto 3D de paso de página, protección con contraseña y analytics. Gratis para siempre.',
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/en' },
  },
  openGraph: {
    title: 'Bukify — Convierte PDFs en experiencias que venden',
    description: 'Pega un link de Google Drive y en segundos tienes un libro interactivo con efecto 3D listo para compartir.',
    url: 'https://bukify.io',
  },
  keywords: ['flipbook', 'PDF interactivo', 'crear flipbook gratis', 'flipbook maker', 'ebook interactivo', 'publicación digital'],
}

export default function Home() {
  return <LandingPage lang="es" />
}
