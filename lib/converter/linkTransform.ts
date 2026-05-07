import * as cheerio from 'cheerio'
import type { LinkItem } from '@/lib/types'
import { collapseMarkdownBlankLines, normalizeWhitespace } from '@/lib/utils/text'
import { decodeRepeated, isSafeUrl, normalizeUrl } from '@/lib/utils/url'

const redirectParams = ['url', 'target', 'redirect', 'redirect_url', 'real_url', 'scene_url']

export function decodeWechatLink(rawUrl: string, sourceUrl?: string): string {
  const normalized = normalizeUrl(rawUrl, sourceUrl)
  let current = normalized

  for (let i = 0; i < 3; i += 1) {
    try {
      const parsed = new URL(current)
      const found = redirectParams
        .map((name) => parsed.searchParams.get(name))
        .find((value): value is string => Boolean(value))
      if (!found) break
      const next = normalizeUrl(decodeRepeated(found), sourceUrl)
      if (!next || next === current) break
      current = next
    } catch {
      break
    }
  }

  return current
}

export function collectLinksFromHtml(html: string, sourceUrl?: string): LinkItem[] {
  const $ = cheerio.load(`<main>${html}</main>`)
  const seen = new Set<string>()
  const links: LinkItem[] = []

  $('a[href]').each((_, element) => {
    const originalUrl = $(element).attr('href') || ''
    const url = decodeWechatLink(originalUrl, sourceUrl)
    if (!url || !isSafeUrl(url) || seen.has(url)) return
    seen.add(url)
    links.push({
      text: normalizeWhitespace($(element).text()),
      url,
      originalUrl: originalUrl === url ? undefined : originalUrl
    })
  })

  return links
}

export function appendPlainUrlAutolinks(markdown: string): string {
  const markdownLinks: string[] = []
  const protectedText = markdown.replace(/\[[^\]]*]\(([^)]+)\)/g, (match) => {
    markdownLinks.push(match)
    return `@@MDLINK${markdownLinks.length - 1}@@`
  })

  const converted = protectedText.replace(/(^|[\s(>])((?:https?:\/\/|\/\/)[^\s<>)]+)(?=$|[\s).,;!?])/g, (_match, prefix, url) => {
    const cleanUrl = normalizeUrl(url)
    return `${prefix}<${cleanUrl}>`
  })

  return collapseMarkdownBlankLines(converted.replace(/@@MDLINK(\d+)@@/g, (_match, index) => markdownLinks[Number(index)]))
}
