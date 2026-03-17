declare module 'react-pageflip' {
  import { Component, ReactNode, CSSProperties } from 'react'

  interface HTMLFlipBookProps {
    width: number
    height: number
    size?: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    clickEventForward?: boolean
    useMouseEvents?: boolean
    swipeDistance?: number
    showPageCorners?: boolean
    disableFlipByClick?: boolean
    startPage?: number
    className?: string
    style?: CSSProperties
    children: ReactNode
    onFlip?: (e: { data: number }) => void
    onChangeOrientation?: (e: { data: string }) => void
    onChangeState?: (e: { data: string }) => void
    onInit?: (e: { data: unknown }) => void
    onUpdate?: (e: { data: unknown }) => void
  }

  export default class HTMLFlipBook extends Component<HTMLFlipBookProps> {
    pageFlip(): {
      flipNext(): void
      flipPrev(): void
      turnToPage(page: number): void
      getCurrentPageIndex(): number
      getPageCount(): number
    }
  }
}
