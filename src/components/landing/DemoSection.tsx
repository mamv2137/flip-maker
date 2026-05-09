'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Play, ShieldCheck, Sparkles } from 'lucide-react'
import type { BookPage } from '@/components/reader/FlipbookReader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InView } from '@/components/ui/in-view'
import { PdfPageRenderer } from '@/components/reader/PdfPageRenderer'
import { getDriveProxyUrl, parseDriveFileId } from '@/lib/google-drive'
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

type Mode = 'sample' | 'input' | 'rendering' | 'custom'

export function DemoSection({ t }: Props) {
  const [mode, setMode] = useState<Mode>('sample')
  const [url, setUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [customPages, setCustomPages] = useState<BookPage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fileId = parseDriveFileId(url.trim())
    if (!fileId) {
      setError(t.errorInvalidUrl)
      return
    }
    setPdfUrl(getDriveProxyUrl(fileId))
    setMode('rendering')
  }

  const handlePagesLoaded = useCallback((pages: BookPage[]) => {
    setCustomPages(pages)
    setMode('custom')
  }, [])

  const handleRenderError = useCallback(
    (msg: string) => {
      // pdfjs surfaces a few distinct strings; map the common ones to friendly copy.
      const lower = msg.toLowerCase()
      if (lower.includes('413') || lower.includes('too large')) {
        setError(t.errorTooLarge)
      } else if (
        lower.includes('404') ||
        lower.includes('403') ||
        lower.includes('missing pdf') ||
        lower.includes('invalid pdf')
      ) {
        setError(t.errorNotPublic)
      } else {
        setError(t.errorGeneric)
      }
      setPdfUrl(null)
      setMode('input')
    },
    [t],
  )

  const resetCustom = () => {
    setUrl('')
    setPdfUrl(null)
    setCustomPages(null)
    setError(null)
  }

  const backToSample = () => {
    resetCustom()
    setMode('sample')
  }

  const openInput = () => {
    resetCustom()
    setMode('input')
  }

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
          className="mt-12"
        >
          {/* Toggle row */}
          <div className="mx-auto mb-6 flex max-w-[600px] items-center justify-end">
            {mode === 'sample' ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openInput}
                className="text-neutral-300 hover:bg-white/5 hover:text-white"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                {t.tryYours}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={backToSample}
                className="text-neutral-300 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                {t.backToDemo}
              </Button>
            )}
          </div>

          <div className="flex justify-center">
            <div
              className="w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-emerald-500/5"
              style={{ maxWidth: 600, height: 500 }}
            >
              <AnimatePresence mode="wait">
                {mode === 'sample' && (
                  <motion.div
                    key="sample"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full bg-white"
                  >
                    <PageFlipReader
                      pages={samplePages}
                      onPageChange={() => {}}
                      controlRef={{ current: null }}
                    />
                  </motion.div>
                )}

                {mode === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col justify-center bg-neutral-950 p-8 sm:p-10"
                  >
                    <div className="mx-auto w-full max-w-md">
                      <h3 className="text-lg font-semibold text-white">{t.tryTitle}</h3>
                      <p className="mt-2 text-sm text-neutral-400">{t.tryDescription}</p>

                      <form onSubmit={handleLoad} className="mt-5 space-y-3">
                        <Input
                          type="url"
                          inputMode="url"
                          autoFocus
                          placeholder={t.placeholder}
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value)
                            if (error) setError(null)
                          }}
                          className="border-white/10 bg-white/5 text-white placeholder:text-neutral-500"
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!url.trim()}
                        >
                          <Play className="mr-1.5 h-4 w-4" />
                          {t.loadButton}
                        </Button>
                      </form>

                      {error && (
                        <p className="mt-3 text-xs text-red-400" role="alert">
                          {error}
                        </p>
                      )}

                      <div className="mt-5 flex items-start gap-2 rounded-md border border-emerald-900/40 bg-emerald-950/30 p-2.5">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <p className="text-[11px] leading-relaxed text-emerald-300/80">
                          {t.tryPrivacy}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'rendering' && pdfUrl && (
                  <motion.div
                    key="rendering"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full bg-neutral-950"
                  >
                    <PdfPageRenderer
                      pdfUrl={pdfUrl}
                      onPagesLoaded={handlePagesLoaded}
                      onError={handleRenderError}
                    />
                  </motion.div>
                )}

                {mode === 'custom' && customPages && (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full bg-white"
                  >
                    <PageFlipReader
                      pages={customPages}
                      onPageChange={() => {}}
                      controlRef={{ current: null }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
