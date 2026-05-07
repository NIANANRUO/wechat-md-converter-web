import * as cheerio from 'cheerio'
import type { ArticleMetadata } from '@/lib/types'
import { normalizeUrl } from '@/lib/utils/url'
import { normalizeWhitespace } from '@/lib/utils/text'

function meta($: cheerio.CheerioAPI, selector: string): string {
  return normalizeWhitespace($(selector).attr('content'))
}

function text($: cheerio.CheerioAPI, selector: string): string {
  return normalizeWhitespace($(selector).first().text())
}

export function extractMetadata($: cheerio.CheerioAPI, sourceUrl = ''): ArticleMetadata {
  const bodyText = normalizeWhitespace($('body').text())
  const timeMatch = bodyText.match(/\b(20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}日?)(?:\s+\d{1,2}:\d{2})?\b/)

  const coverRaw =
    meta($, 'meta[property="og:image"]') ||
    meta($, 'meta[name="twitter:image"]') ||
    $('img').first().attr('src') ||
    $('img').first().attr('data-src') ||
    ''

  return {
    title:
      meta($, 'meta[property="og:title"]') ||
      meta($, 'meta[name="twitter:title"]') ||
      text($, '#activity-name') ||
      text($, 'h1') ||
      text($, 'title'),
    author: text($, '#js_author_name') || text($, '.rich_media_meta_text') || meta($, 'meta[name="author"]'),
    account: text($, '#js_name') || text($, '.profile_nickname') || meta($, 'meta[property="og:site_name"]'),
    publishTime: text($, '#publish_time') || text($, 'em#publish_time') || normalizeWhitespace(timeMatch?.[0]),
    sourceUrl,
    cover: coverRaw ? normalizeUrl(coverRaw, sourceUrl) : ''
  }
}
