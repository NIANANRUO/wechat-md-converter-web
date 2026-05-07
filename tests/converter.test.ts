import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from '@/lib/converter/htmlToMarkdown'

describe('htmlToMarkdown', () => {
  it('converts common article structures', () => {
    const markdown = htmlToMarkdown(`
      <h2>标题</h2>
      <p>段落</p>
      <p><strong>加粗</strong> <em>斜体</em></p>
      <blockquote>引用</blockquote>
      <ul><li>列表</li></ul>
      <p><img src="assets/image-001.jpg" alt="图"></p>
      <p><a href="https://example.com"><img src="assets/image-002.jpg" alt="图链"></a></p>
    `)
    expect(markdown).toContain('## 标题')
    expect(markdown).toContain('段落')
    expect(markdown).toContain('**加粗**')
    expect(markdown).toContain('*斜体*')
    expect(markdown).toContain('> 引用')
    expect(markdown).toContain('-   列表')
    expect(markdown).toContain('![图](assets/image-001.jpg)')
    expect(markdown).toContain('[![图链](assets/image-002.jpg)](<https://example.com/>)')
    expect(markdown).not.toMatch(/\n{3,}/)
  })
})
