import type { ConvertOptions, ConvertResult } from '@/lib/types'
import { cleanHtml } from '@/lib/parser/cleanHtml'
import { parseWechatArticle } from '@/lib/parser/parseWechatArticle'
import { downloadImages } from '@/lib/assets/downloadImages'
import { applyImageResultsToHtml, prepareImages } from './imageTransform'
import { collectLinksFromHtml } from './linkTransform'
import { htmlToMarkdown } from './htmlToMarkdown'
import { createFrontmatter } from '@/lib/output/frontmatter'

export async function convertArticle(html: string, options: ConvertOptions): Promise<ConvertResult> {
  const parsed = parseWechatArticle(html, options.sourceUrl)
  const cleanedHtml = cleanHtml(parsed.contentHtml)
  const prepared = prepareImages(cleanedHtml, parsed.metadata.sourceUrl || options.sourceUrl)
  const downloaded = await downloadImages(prepared.images, options.downloadImages)
  const htmlWithImages = applyImageResultsToHtml(prepared.html, downloaded.images)
  const links = collectLinksFromHtml(htmlWithImages, parsed.metadata.sourceUrl || options.sourceUrl)
  let markdown = htmlToMarkdown(htmlWithImages, parsed.metadata.sourceUrl || options.sourceUrl, options.keepHtml)

  if (options.appendLinks && links.length > 0) {
    markdown += `\n\n## 链接清单\n\n${links.map((link, index) => `${index + 1}. [${link.text || link.url}](${link.url})`).join('\n')}`
  }

  markdown = `${createFrontmatter(parsed.metadata, options.frontmatter)}${markdown}`.trim() + '\n'

  return {
    metadata: parsed.metadata,
    markdown,
    links,
    images: downloaded.images,
    assets: downloaded.assets,
    debug: {
      rawHtml: parsed.rawHtml,
      cleanedHtml: htmlWithImages
    }
  }
}
