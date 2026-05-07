import { decode } from 'html-entities'

const unsafeProtocols = new Set(['javascript:', 'data:', 'vbscript:', 'file:'])

export function decodeRepeated(value: string, maxDepth = 3): string {
  let current = decode(value)
  for (let i = 0; i < maxDepth; i += 1) {
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decode(decoded)
    } catch {
      break
    }
  }
  return current
}

export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(normalizeUrl(value, undefined))
    return !unsafeProtocols.has(url.protocol.toLowerCase())
  } catch {
    return !/^\s*(javascript|data|vbscript|file):/i.test(value)
  }
}

export function normalizeUrl(value: string, baseUrl?: string): string {
  const decoded = decodeRepeated(value.trim())
  if (!decoded) return ''
  if (decoded.startsWith('//')) return `https:${decoded}`
  try {
    return new URL(decoded, baseUrl || undefined).toString()
  } catch {
    return decoded
  }
}
