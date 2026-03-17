'use client'

import dynamic from 'next/dynamic'
import type { BookPage } from '@/components/reader/FlipbookReader'

const PageFlipReader = dynamic(() => import('@/components/reader/PageFlipReader'), {
  ssr: false,
  loading: () => (
    <div className="bg-muted flex h-[400px] w-full items-center justify-center rounded-lg">
      <p className="text-muted-foreground text-sm">Loading demo...</p>
    </div>
  ),
})

const samplePages: BookPage[] = [
  {
    type: 'html',
    content: `<h1 style="margin-top:2rem">Welcome to Flipbooks</h1>
<p>This is an interactive demo. Try flipping the pages by dragging or clicking the edges.</p>
<p style="margin-top:1.5rem; color:#666">You can also use your keyboard arrow keys.</p>`,
    pageNumber: 1,
  },
  {
    type: 'html',
    content: `<h2>Beautiful Reading Experience</h2>
<p>Every flipbook features smooth 3D page-turning animations that feel natural and engaging.</p>
<ul>
<li>Physics-based animation</li>
<li>Touch & swipe support</li>
<li>Keyboard navigation</li>
</ul>`,
    pageNumber: 2,
  },
  {
    type: 'html',
    content: `<h2>Built for Creators</h2>
<p>Upload PDFs or write in Markdown. Your content is automatically transformed into a premium reader experience.</p>
<p style="margin-top:1rem">Share with a single link — no downloads required.</p>`,
    pageNumber: 3,
  },
  {
    type: 'html',
    content: `<h2>Get Started Today</h2>
<p>Create your free account and publish your first flipbook in minutes.</p>
<p style="margin-top:2rem; text-align:center; font-size:1.5rem">&#x2192; Sign up free</p>`,
    pageNumber: 4,
  },
]

export function DemoSection() {
  return (
    <section id="demo" className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Try it yourself
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-center text-lg">
          Drag the page corners or use arrow keys to flip through.
        </p>
        <div className="mt-12 flex justify-center">
          <div
            className="w-full overflow-hidden rounded-xl border shadow-xl"
            style={{ maxWidth: 550, height: 450 }}
          >
            <PageFlipReader
              pages={samplePages}
              onPageChange={() => {}}
              controlRef={{ current: null }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
