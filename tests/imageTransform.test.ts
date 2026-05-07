import { describe, expect, it, vi } from 'vitest'
import { downloadImages } from '@/lib/assets/downloadImages'
import { applyImageResultsToHtml, prepareImages } from '@/lib/converter/imageTransform'

describe('imageTransform', () => {
  it('moves data-src to src and fills protocol-relative URLs', () => {
    const prepared = prepareImages('<img data-src="//mmbiz.qpic.cn/a.jpg" alt="a">')
    expect(prepared.html).toContain('src="https://mmbiz.qpic.cn/a.jpg"')
    expect(prepared.images[0].normalizedUrl).toBe('https://mmbiz.qpic.cn/a.jpg')
  })

  it('replaces image paths with local paths when download succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } }))
    )
    const prepared = prepareImages('<img src="https://example.com/a.png" alt="a">')
    const downloaded = await downloadImages(prepared.images, true)
    const html = applyImageResultsToHtml(prepared.html, downloaded.images)
    expect(downloaded.assets).toHaveLength(1)
    expect(html).toContain('assets/image-001.png')
    vi.unstubAllGlobals()
  })

  it('keeps original link when download fails and avoids duplicate downloads', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('CORS')
    })
    vi.stubGlobal('fetch', fetchMock)
    const prepared = prepareImages('<img src="https://example.com/a.jpg"><img src="https://example.com/a.jpg">')
    const downloaded = await downloadImages(prepared.images, true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(downloaded.assets).toHaveLength(0)
    expect(downloaded.images[0].success).toBe(false)
    const html = applyImageResultsToHtml(prepared.html, downloaded.images)
    expect(html).toContain('https://example.com/a.jpg')
    vi.unstubAllGlobals()
  })
})
