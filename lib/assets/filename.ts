export function safeFilename(input: string, fallback = 'article'): string {
  const safe = input
    .trim()
    .replace(/[\\/:*?"<>|#%{}^~[\]`;=@&]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  return safe || fallback
}

export function extensionFromMime(mimeType: string): string {
  const clean = mimeType.split(';')[0].toLowerCase()
  if (clean === 'image/jpeg') return 'jpg'
  if (clean === 'image/png') return 'png'
  if (clean === 'image/gif') return 'gif'
  if (clean === 'image/webp') return 'webp'
  if (clean === 'image/svg+xml') return 'svg'
  return 'jpg'
}

export function extensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const ext = pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase()
    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext
    }
  } catch {
    // Ignore malformed URLs and use a stable fallback.
  }
  return 'jpg'
}

export function numberedImageName(index: number, ext: string): string {
  return `image-${String(index).padStart(3, '0')}.${ext}`
}
