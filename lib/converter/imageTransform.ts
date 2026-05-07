import * as cheerio from 'cheerio'
import type { ImageItem } from '@/lib/types'
import { normalizeUrl } from '@/lib/utils/url'

export interface PreparedImage {
  originalUrl: string
  normalizedUrl: string
  alt?: string
}

export function prepareImages(html: string, sourceUrl?: string): { html: string; images: PreparedImage[] } {
  const $ = cheerio.load(`<main>${html}</main>`)
  const seen = new Set<string>()
  const images: PreparedImage[] = []

  $('img').each((_, element) => {
    const img = $(element)
    const raw = img.attr('src') || img.attr('data-src') || ''
    if (!raw) return
    const normalizedUrl = normalizeUrl(raw, sourceUrl)
    img.attr('src', normalizedUrl)
    img.removeAttr('data-src')
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl)
      images.push({
        originalUrl: normalizedUrl,
        normalizedUrl,
        alt: img.attr('alt') || undefined
      })
    }
  })

  return { html: $('main').html() || '', images }
}

export function applyImageResultsToHtml(html: string, imageItems: ImageItem[]): string {
  const $ = cheerio.load(`<main>${html}</main>`)
  const lookup = new Map(imageItems.map((item) => [item.originalUrl, item]))

  $('img[src]').each((_, element) => {
    const img = $(element)
    const src = img.attr('src') || ''
    const result = lookup.get(src)
    if (result?.success && result.localPath) {
      img.attr('src', result.localPath)
    }
  })

  return $('main').html() || ''
}
