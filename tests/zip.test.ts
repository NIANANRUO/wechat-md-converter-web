import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { createArticleZip } from '@/lib/output/createZip'

describe('createArticleZip', () => {
  it('creates zip with markdown and assets folder', async () => {
    const blob = await createArticleZip('# hi', { title: '' }, [
      { filename: 'image-001.jpg', path: 'assets/image-001.jpg', mimeType: 'image/jpeg', data: new Uint8Array([1]).buffer }
    ])
    const zip = await JSZip.loadAsync(blob)
    expect(zip.file('article/article.md')).toBeTruthy()
    expect(zip.folder('article/assets')).toBeTruthy()
    expect(zip.file('article/assets/image-001.jpg')).toBeTruthy()
  })
})
