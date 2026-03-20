'use client'

import dynamic from 'next/dynamic'
import type { BookPage } from '@/components/reader/FlipbookReader'
import { InView } from '@/components/ui/in-view'

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
<h1 style="font-size:2rem;margin-bottom:0.5rem">Flipbooks</h1>
<p style="color:#666;font-size:1.1rem">Interactive reading experiences</p>
<p style="margin-top:2rem;color:#999;font-size:0.85rem">Flip the page to explore &rarr;</p>
</div>`,
    pageNumber: 1,
  },
  {
    type: 'html',
    content: `<h2>Beautiful Reading</h2>
<p>Every flipbook features smooth 3D page-turning animations that feel natural and engaging.</p>
<ul>
<li>Physics-based animation</li>
<li>Touch & swipe support</li>
<li>Keyboard navigation</li>
<li>Fullscreen mode</li>
</ul>`,
    pageNumber: 2,
  },
  {
    type: 'html',
    content: `<h2>Built for Creators</h2>
<p>Upload PDFs or write in Markdown. Your content is automatically transformed into a premium reader.</p>
<p style="margin-top:1rem">Control who can access your books with public/private visibility and magic link invites.</p>`,
    pageNumber: 3,
  },
  {
    type: 'html',
    content: `<h2>Share Anywhere</h2>
<p>Embed your flipbook on any website with a single line of code. Perfect for:</p>
<ul>
<li>Course platforms (Hotmart)</li>
<li>Personal websites</li>
<li>Email campaigns</li>
</ul>`,
    pageNumber: 4,
  },
  {
    type: 'html',
    content: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem">
<h2 style="font-size:1.5rem">Ready to try?</h2>
<p style="margin-top:1rem;color:#666">Create your free account and publish your first flipbook in minutes.</p>
<p style="margin-top:2rem;font-size:1.2rem">&larr; Flip back or sign up above</p>
</div>`,
    pageNumber: 5,
  },
]

export function DemoSection() {
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
            Live Demo
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Try it yourself
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Drag the page corners or use arrow keys to flip through.
          </p>
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
            <PageFlipReader
              pages={samplePages}
              onPageChange={() => {}}
              controlRef={{ current: null }}
            />
          </div>
        </InView>
      </div>
    </section>
  )
}
