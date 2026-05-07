import JSZip from 'jszip'
import type { AssetItem, ArticleMetadata } from '@/lib/types'
import { safeFilename } from '@/lib/assets/filename'

export async function createArticleZip(markdown: string, metadata: Partial<ArticleMetadata>, assets: AssetItem[]): Promise<Blob> {
  const zip = new JSZip()
  const folderName = safeFilename(metadata.title || '', 'article')
  const folder = zip.folder(folderName)!
  folder.file('article.md', markdown)
  const assetsFolder = folder.folder('assets')!
  assets.forEach((asset) => {
    assetsFolder.file(asset.filename, asset.data)
  })
  return zip.generateAsync({ type: 'blob' })
}
