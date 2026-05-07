import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'

const keepAttributes = new Set(['href', 'src', 'alt', 'title', 'colspan', 'rowspan'])

export function cleanHtml(html: string): string {
  const $ = cheerio.load(`<main>${html}</main>`)

  $('script,style,iframe,noscript,svg').remove()
  $('[hidden], [aria-hidden="true"]').remove()
  $('[style]').each((_, element) => {
    const style = ($(element).attr('style') || '').toLowerCase()
    if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0/.test(style)) {
      $(element).remove()
    }
  })

  $('img').each((_, element) => {
    const img = $(element)
    const lazy = img.attr('data-src') || img.attr('data-original') || img.attr('data-lazy-src')
    if (lazy && !img.attr('src')) img.attr('src', lazy)
  })

  $('*').each((_, element) => {
    const attribs = { ...((element as Element).attribs || {}) }
    Object.keys(attribs).forEach((name) => {
      if (!keepAttributes.has(name)) $(element).removeAttr(name)
    })
  })

  $('p').each((_, element) => {
    const node = $(element)
    if (!node.text().trim() && node.find('img,a').length === 0) node.remove()
  })

  return $('main')
    .html()!
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
