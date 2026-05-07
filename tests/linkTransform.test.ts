import { describe, expect, it } from 'vitest'
import { collectLinksFromHtml, decodeWechatLink } from '@/lib/converter/linkTransform'
import { htmlToMarkdown } from '@/lib/converter/htmlToMarkdown'

describe('linkTransform', () => {
  it('converts normal and empty links to markdown', () => {
    const markdown = htmlToMarkdown('<p><a href="https://example.com">查看详情</a></p><p><a href="https://example.com/empty"></a></p>')
    expect(markdown).toContain('[查看详情](https://example.com/)')
    expect(markdown).toContain('<https://example.com/empty>')
  })

  it('decodes real URL from WeChat redirect parameters and HTML entities', () => {
    expect(decodeWechatLink('https://mp.weixin.qq.com/jump?url=https%3A%2F%2Fexample.com%2Fa')).toBe('https://example.com/a')
    expect(decodeWechatLink('https://mp.weixin.qq.com/jump?redirect_url=https%253A%252F%252Fexample.com%252Fb%253Fx%253D1')).toBe(
      'https://example.com/b?x=1'
    )
  })

  it('does not generate clickable javascript links', () => {
    const markdown = htmlToMarkdown('<a href="javascript:alert(1)">危险</a>')
    expect(markdown).toBe('危险')
  })

  it('deduplicates by final URL and resolves relative URLs', () => {
    const links = collectLinksFromHtml(
      '<a href="/a">A</a><a href="https://example.com/a">B</a><a href="https://mp.weixin.qq.com/jump?url=https%3A%2F%2Fexample.com%2Fb">B</a>',
      'https://example.com/root'
    )
    expect(links).toHaveLength(2)
    expect(links[0].url).toBe('https://example.com/a')
    expect(links[1].url).toBe('https://example.com/b')
  })
})
