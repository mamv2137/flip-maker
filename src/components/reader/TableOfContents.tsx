'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Heading } from '@/lib/extract-headings'

type Props = {
  headings: Heading[]
  currentPage: number
  onNavigate: (pageIndex: number) => void
  onClose: () => void
}

export function TableOfContents({ headings, currentPage, onNavigate, onClose }: Props) {
  if (headings.length === 0) {
    return (
      <div className="bg-background/95 absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r backdrop-blur-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Table of Contents</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">No headings found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background/95 absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r backdrop-blur-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Table of Contents</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {headings.map((heading, i) => (
          <button
            key={i}
            onClick={() => {
              onNavigate(heading.pageIndex)
              onClose()
            }}
            className={`hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              heading.pageIndex === currentPage
                ? 'bg-muted font-medium'
                : 'text-muted-foreground'
            }`}
            style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
