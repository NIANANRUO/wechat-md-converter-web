import * as cheerio from 'cheerio'
import type { ParsedArticle } from '@/lib/types'
import { extractMetadata } from './extractMetadata'

export function parseWechatArticle(html: string, sourceUrl = ''): ParsedArticle {
  const $ = cheerio.load(html)
  const metadata = extractMetadata($, sourceUrl)
  const content =
    $('#js_content').first().html() ||
    $('.rich_media_content').first().html() ||
    $('article').first().html() ||
    $('body').first().html() ||
    ''

  return {
    metadata,
    contentHtml: content,
    rawHtml: html
  }
}
