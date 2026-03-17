'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

const MIN_SIZE = 75
const MAX_SIZE = 150
const STEP = 25

type Props = {
  fontSize: number
  onFontSizeChange: (size: number) => void
}

export function FontSizeControl({ fontSize, onFontSizeChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onFontSizeChange(Math.max(MIN_SIZE, fontSize - STEP))}
        disabled={fontSize <= MIN_SIZE}
        title="Decrease font size"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-muted-foreground min-w-[3ch] text-center text-xs">
        {fontSize}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onFontSizeChange(Math.min(MAX_SIZE, fontSize + STEP))}
        disabled={fontSize >= MAX_SIZE}
        title="Increase font size"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
