'use client'

import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Layers,
  Maximize,
  Minimize,
  ArrowLeft,
  List,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { FontSizeControl } from './FontSizeControl'
import { ZoomControls } from './ZoomControls'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type Props = {
  title: string
  flipEnabled: boolean
  isFullscreen: boolean
  onToggleFlip: () => void
  onToggleFullscreen: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  hasHtmlPages: boolean
  tocOpen: boolean
  onToggleToc: () => void
  hasHeadings: boolean
  showBackButton?: boolean
}

export function ReaderToolbar({
  title,
  flipEnabled,
  isFullscreen,
  onToggleFlip,
  onToggleFullscreen,
  fontSize,
  onFontSizeChange,
  zoom,
  onZoomChange,
  hasHtmlPages,
  tocOpen,
  onToggleToc,
  hasHeadings,
  showBackButton = true,
}: Props) {
  return (
    <div className="border-b">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {hasHeadings && (
            <Button
              variant={tocOpen ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={onToggleToc}
              title="Table of Contents"
            >
              <List className="h-4 w-4" />
            </Button>
          )}

          <h1 className="max-w-[200px] truncate text-sm font-medium sm:max-w-md">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Desktop controls */}
          <div className="hidden items-center gap-1 md:flex">
            {hasHtmlPages && (
              <FontSizeControl fontSize={fontSize} onFontSizeChange={onFontSizeChange} />
            )}
            <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
          </div>

          {/* Mobile dropdown for font size + zoom */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {hasHtmlPages && (
                  <>
                    <DropdownMenuLabel className="text-xs">Font Size</DropdownMenuLabel>
                    <div className="flex justify-center px-2 py-1">
                      <FontSizeControl fontSize={fontSize} onFontSizeChange={onFontSizeChange} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel className="text-xs">Zoom</DropdownMenuLabel>
                <div className="flex justify-center px-2 py-1">
                  <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
