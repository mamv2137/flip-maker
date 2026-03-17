'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, Layers, Maximize, Minimize, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  title: string
  flipEnabled: boolean
  isFullscreen: boolean
  onToggleFlip: () => void
  onToggleFullscreen: () => void
}

export function ReaderToolbar({
  title,
  flipEnabled,
  isFullscreen,
  onToggleFlip,
  onToggleFullscreen,
}: Props) {
  return (
    <div className="border-b">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="max-w-[200px] truncate text-sm font-medium sm:max-w-md">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFlip}
            className="text-xs"
            title={flipEnabled ? 'Switch to flat mode' : 'Switch to 3D flip mode'}
          >
            {flipEnabled ? (
              <>
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Flat Mode</span>
              </>
            ) : (
              <>
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">3D Flip</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
