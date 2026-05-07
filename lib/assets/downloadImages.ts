import type { AssetItem, ImageItem } from '@/lib/types'
import type { PreparedImage } from '@/lib/converter/imageTransform'
import { extensionFromMime, extensionFromUrl, numberedImageName } from './filename'

export async function downloadImages(
  images: PreparedImage[],
  enabled: boolean
): Promise<{ images: ImageItem[]; assets: AssetItem[] }> {
  const assets: AssetItem[] = []
  const results: ImageItem[] = []
  const seen = new Map<string, ImageItem>()

  for (const image of images) {
    if (seen.has(image.normalizedUrl)) continue

    if (!enabled) {
      const item = {
        originalUrl: image.normalizedUrl,
        alt: image.alt,
        success: false,
        error: '图片本地化已关闭'
      }
      seen.set(image.normalizedUrl, item)
      results.push(item)
      continue
    }

    try {
      const response = await fetch(image.normalizedUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const mimeType = response.headers.get('content-type') || 'image/jpeg'
      const data = await response.arrayBuffer()
      const ext = extensionFromMime(mimeType) || extensionFromUrl(image.normalizedUrl)
      const filename = numberedImageName(assets.length + 1, ext)
      const path = `assets/${filename}`
      const item = {
        originalUrl: image.normalizedUrl,
        localPath: path,
        alt: image.alt,
        success: true
      }
      assets.push({ filename, path, mimeType, data })
      seen.set(image.normalizedUrl, item)
      results.push(item)
    } catch (error) {
      const item = {
        originalUrl: image.normalizedUrl,
        alt: image.alt,
        success: false,
        error: error instanceof Error ? error.message : '图片下载失败'
      }
      seen.set(image.normalizedUrl, item)
      results.push(item)
    }
  }

  return { images: results, assets }
}
