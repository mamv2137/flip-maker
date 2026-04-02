'use client'

import dynamic from 'next/dynamic'
import type { BookPage } from '@/components/reader/FlipbookReader'
import { InView } from '@/components/ui/in-view'
import type { Dictionary } from '@/i18n/get-dictionary'

const PageFlipReader = dynamic(() => import('@/components/reader/PageFlipReader'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-neutral-900">
      <p className="text-sm text-neutral-500">Loading demo...</p>
    </div>
  ),
})

const samplePages: BookPage[] = [
  {
    type: 'html',
    content: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem">
<h1 style="font-size:2rem;margin-bottom:0.5rem">Bukify</h1>
<p style="color:#666;font-size:1.1rem">Tus PDFs, como nunca los viste</p>
<p style="margin-top:2rem;color:#999;font-size:0.85rem">Pasa la página para explorar &rarr;</p>
</div>`,
    pageNumber: 1,
  },
  {
    type: 'html',
    content: `<h2>Lectura premium</h2><p>Cada libro cuenta con animaciones 3D de paso de página.</p><ul><li>Physics-based animation</li><li>Touch & swipe support</li><li>Keyboard navigation</li><li>Fullscreen mode</li></ul>`,
    pageNumber: 2,
  },
  {
    type: 'html',
    content: `<h2>Hecho para creadores</h2><p>Conecta Google Drive y tu contenido se transforma en un lector premium automáticamente.</p><p style="margin-top:1rem">Controla el acceso con visibilidad pública/privada e invitaciones por link.</p>`,
    pageNumber: 3,
  },
  {
    type: 'html',
    content: `<h2>Comparte donde quieras</h2><p>Embebe tu libro en cualquier sitio web. Perfecto para:</p><ul><li>Plataformas de cursos (Hotmart)</li><li>Sitios personales</li><li>Campañas de email</li></ul>`,
    pageNumber: 4,
  },
  {
    type: 'html',
    content: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem">
<h2 style="font-size:1.5rem">Listo para probar?</h2>
<p style="margin-top:1rem;color:#666">Crea tu cuenta gratis y publica tu primer ebook en minutos.</p>
</div>`,
    pageNumber: 5,
  },
]

type Props = {
  t: Dictionary['landing']['demo']
}

export function DemoSection({ t }: Props) {
  return (
    <section id="demo" className="border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-400">
            {t.badge}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">{t.subtitle}</p>
        </InView>
        <InView
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 flex justify-center"
        >
          <div
            className="w-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl shadow-emerald-500/5"
            style={{ maxWidth: 600, height: 500 }}
          >
            <PageFlipReader pages={samplePages} onPageChange={() => {}} controlRef={{ current: null }} />
          </div>
        </InView>
      </div>
    </section>
  )
}
