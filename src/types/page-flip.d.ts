declare module 'page-flip' {
  interface PageFlipOptions {
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
  }

  class PageFlip {
    constructor(element: HTMLElement, options: PageFlipOptions)
    loadFromHTML(elements: NodeListOf<HTMLElement>): void
    loadFromImages(images: string[]): void
    turnToPage(page: number): void
    turnToNextPage(): void
    turnToPrevPage(): void
    getCurrentPageIndex(): number
    getPageCount(): number
    on(event: string, callback: (e: { data: number }) => void): void
    destroy(): void
  }
}
