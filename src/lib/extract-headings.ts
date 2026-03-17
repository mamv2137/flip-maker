export type Heading = {
  level: number
  text: string
  pageIndex: number
}

/**
 * Extract h1-h3 headings from an array of HTML page strings.
 */
export function extractHeadings(
  pages: { type: string; content: string }[],
): Heading[] {
  const headings: Heading[] = []
  const regex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    if (page.type !== 'html') continue

    let match
    while ((match = regex.exec(page.content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      if (text) {
        headings.push({
          level: parseInt(match[1], 10),
          text,
          pageIndex: i,
        })
      }
    }
    // Reset regex lastIndex for next page
    regex.lastIndex = 0
  }

  return headings
}
