import { nanoid } from 'nanoid'

/**
 * Generate a URL-safe slug from a title.
 * Appends a short random ID to ensure uniqueness.
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
    .slice(0, 50) // Limit length

  const id = nanoid(8)
  return base ? `${base}-${id}` : id
}
