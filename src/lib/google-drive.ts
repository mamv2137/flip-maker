/**
 * Parse a Google Drive file ID from various URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/edit
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function parseDriveFileId(url: string): string | null {
  if (!url) return null

  // /file/d/ID/ or /document/d/ID/ or /presentation/d/ID/ etc.
  const pathMatch = url.match(/\/(?:file|document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/)
  if (pathMatch) return pathMatch[1]

  // ?id=ID or &id=ID
  const paramMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (paramMatch) return paramMatch[1]

  return null
}

/**
 * Construct the proxy URL for reading a Drive PDF.
 * Uses our server-side proxy to avoid CORS issues.
 */
export function getDriveProxyUrl(fileId: string): string {
  return `/api/drive/proxy/${fileId}`
}

/**
 * Construct the direct Google Drive download URL (for server-side use).
 */
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Validate a Drive file is publicly accessible (server-side only).
 */
export async function validateDriveFile(
  fileId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const url = getDriveDownloadUrl(fileId)
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })

    if (res.ok || res.status === 302) {
      const contentType = res.headers.get('content-type') || ''
      // Google may return an HTML page for non-public files
      if (contentType.includes('text/html')) {
        return { valid: false, error: 'File is not public. Please set sharing to "Anyone with the link".' }
      }
      return { valid: true }
    }

    if (res.status === 404) {
      return { valid: false, error: 'File not found. Check the URL and try again.' }
    }

    return { valid: false, error: 'Unable to access file. Make sure it is shared publicly.' }
  } catch {
    return { valid: false, error: 'Could not connect to Google Drive. Please try again.' }
  }
}
