import TurndownService from 'turndown'
import { appendPlainUrlAutolinks, decodeWechatLink } from './linkTransform'
import { collapseMarkdownBlankLines } from '@/lib/utils/text'
import { isSafeUrl } from '@/lib/utils/url'

export function htmlToMarkdown(html: string, sourceUrl?: string, keepHtml = false): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*'
  })

  turndown.addRule('safeLinks', {
    filter: 'a',
    replacement(content, node) {
      const element = node as HTMLElement
      const href = element.getAttribute('href') || ''
      const url = decodeWechatLink(href, sourceUrl)
      const label = content.trim()
      if (!url || !isSafeUrl(url)) return label || href
      if (!label) return `<${url}>`
      return `[${label.replace(/\n+/g, ' ')}](${url})`
    }
  })

  turndown.addRule('images', {
    filter: 'img',
    replacement(_content, node) {
      const element = node as HTMLElement
      const src = element.getAttribute('src') || element.getAttribute('data-src') || ''
      const alt = element.getAttribute('alt') || ''
      return src ? `![${alt}](${src})` : ''
    }
  })

  turndown.addRule('tables', {
    filter: 'table',
    replacement(_content, node) {
      if (keepHtml) return `\n\n${(node as HTMLElement).outerHTML}\n\n`
      const rows = Array.from((node as HTMLElement).querySelectorAll('tr')).map((row) =>
        Array.from(row.querySelectorAll('th,td')).map((cell) => cell.textContent?.trim().replace(/\s+/g, ' ') || '')
      )
      if (!rows.length) return ''
      const header = rows[0]
      const body = rows.slice(1)
      return [
        '',
        `| ${header.join(' | ')} |`,
        `| ${header.map(() => '---').join(' | ')} |`,
        ...body.map((row) => `| ${row.join(' | ')} |`),
        ''
      ].join('\n')
    }
  })

  let markdown = turndown.turndown(html)
  markdown = appendPlainUrlAutolinks(markdown)
  return collapseMarkdownBlankLines(markdown)
}
