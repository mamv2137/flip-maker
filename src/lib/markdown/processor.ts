import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

// Extend sanitize schema to allow classes from syntax highlighting
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className', 'style'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
    pre: [...(defaultSchema.attributes?.pre ?? []), 'className', 'style'],
  },
}

/**
 * Split raw markdown into page sections.
 * Priority: explicit `---` separators, then `# H1` headings.
 */
export function splitMarkdownIntoSections(raw: string): string[] {
  // First try splitting by horizontal rules (---)
  const byHr = raw.split(/\n---\n/)

  if (byHr.length > 1) {
    return byHr.map((s) => s.trim()).filter(Boolean)
  }

  // Fall back to splitting by H1 headings
  const lines = raw.split('\n')
  const sections: string[] = []
  let current: string[] = []

  for (const line of lines) {
    if (/^# /.test(line) && current.length > 0) {
      sections.push(current.join('\n').trim())
      current = []
    }
    current.push(line)
  }

  if (current.length > 0) {
    const text = current.join('\n').trim()
    if (text) sections.push(text)
  }

  // If no splits found, return the whole content as one page
  return sections.length > 0 ? sections : [raw.trim()]
}

/**
 * Process a single markdown section into HTML.
 */
async function processSection(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: true,
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}

/**
 * Process full markdown content into an array of HTML page strings.
 */
export async function processMarkdown(raw: string): Promise<string[]> {
  const sections = splitMarkdownIntoSections(raw)
  const pages: string[] = []

  for (const section of sections) {
    const html = await processSection(section)
    pages.push(html)
  }

  return pages
}
