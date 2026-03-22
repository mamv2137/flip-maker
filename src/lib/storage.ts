/**
 * Storage abstraction using Seafile REST API.
 * Swap SEAFILE_* env vars for S3/R2 later without changing call sites.
 */

const SEAFILE_URL = process.env.SEAFILE_URL!
const SEAFILE_TOKEN = process.env.SEAFILE_TOKEN!
const SEAFILE_REPO_ID = process.env.SEAFILE_REPO_ID!

function headers() {
  return { Authorization: `Token ${SEAFILE_TOKEN}` }
}

/**
 * Get an upload link for a directory in the repo.
 * Seafile requires fetching an upload URL first, then POSTing the file to it.
 */
async function getUploadLink(dirPath: string): Promise<string> {
  const res = await fetch(
    `${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/upload-link/?p=${encodeURIComponent(dirPath)}`,
    { headers: headers() },
  )
  if (!res.ok) {
    throw new Error(`Failed to get upload link: ${res.status} ${await res.text()}`)
  }
  // Returns a quoted URL string
  const url = await res.text()
  return url.replace(/"/g, '')
}

/**
 * Ensure a directory exists in the repo (create if missing).
 * Creates parent directories recursively since Seafile doesn't do it automatically.
 */
async function ensureDir(dirPath: string): Promise<void> {
  const parts = dirPath.split('/').filter(Boolean)
  let current = ''
  for (const part of parts) {
    current += '/' + part
    const res = await fetch(
      `${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/dir/?p=${encodeURIComponent(current)}`,
      {
        method: 'POST',
        headers: {
          ...headers(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'operation=mkdir',
      },
    )
    // 201 = created, 409 = already exists — both are fine
    if (!res.ok && res.status !== 409) {
      throw new Error(`Failed to create dir ${current}: ${res.status}`)
    }
  }
}

/**
 * Upload a file to Seafile.
 * @param dirPath - Directory path in repo, e.g. "/pdfs/book-id"
 * @param fileName - File name, e.g. "document.pdf"
 * @param data - File content as Buffer or ArrayBuffer
 * @returns The full path of the uploaded file in the repo
 */
export async function uploadFile(
  dirPath: string,
  fileName: string,
  data: ArrayBuffer,
): Promise<string> {
  await ensureDir(dirPath)
  const uploadUrl = await getUploadLink(dirPath)

  const formData = new FormData()
  formData.append('file', new Blob([data]), fileName)
  formData.append('parent_dir', dirPath)

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: headers(),
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.status} ${await res.text()}`)
  }

  return `${dirPath}/${fileName}`
}

/**
 * Get a temporary download URL for a file.
 * Seafile returns a time-limited direct download link.
 */
export async function getDownloadUrl(filePath: string): Promise<string> {
  const res = await fetch(
    `${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/file/?p=${encodeURIComponent(filePath)}`,
    { headers: headers() },
  )
  if (!res.ok) {
    throw new Error(`Failed to get download URL: ${res.status} ${await res.text()}`)
  }
  const url = await res.text()
  return url.replace(/"/g, '')
}

/**
 * Resolve a storage path to a URL the browser can fetch.
 * - Old local paths ("/uploads/...") are served from public/ as-is.
 * - Seafile paths ("/pdfs/...", "/covers/...") go through /api/storage/ proxy.
 */
export function resolveFileUrl(storagePath: string): string {
  if (storagePath.startsWith('/uploads/')) {
    // Legacy local file — served from public/
    return storagePath
  }
  // Seafile path — proxy through API
  return `/api/storage${storagePath}`
}

/**
 * Resolve the PDF URL for a book — supports both Seafile and Google Drive.
 */
export function resolvePdfUrl(book: {
  pdf_r2_key?: string | null
  drive_file_id?: string | null
  creator_id?: string | null
}): string | null {
  if (book.drive_file_id) {
    const params = book.creator_id ? `?creator=${book.creator_id}` : ''
    return `/api/drive/proxy/${book.drive_file_id}${params}`
  }
  if (book.pdf_r2_key) {
    return resolveFileUrl(book.pdf_r2_key)
  }
  return null
}

/**
 * Delete a file from Seafile.
 */
export async function deleteFile(filePath: string): Promise<void> {
  const res = await fetch(
    `${SEAFILE_URL}/api2/repos/${SEAFILE_REPO_ID}/file/?p=${encodeURIComponent(filePath)}`,
    {
      method: 'DELETE',
      headers: headers(),
    },
  )
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete file: ${res.status}`)
  }
}
