import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseWechatArticle } from '@/lib/parser/parseWechatArticle'

function fixture(name: string) {
  return readFileSync(join(process.cwd(), 'tests/fixtures', name), 'utf8')
}

describe('parseWechatArticle', () => {
  it('extracts metadata and content', () => {
    const parsed = parseWechatArticle(fixture('article-basic.html'), 'https://mp.weixin.qq.com/s/basic')
    expect(parsed.metadata.title).toBe('基础文章标题')
    expect(parsed.metadata.author).toBe('作者甲')
    expect(parsed.metadata.account).toBe('测试账号')
    expect(parsed.metadata.publishTime).toBe('2026-05-06')
    expect(parsed.metadata.cover).toBe('https://example.com/cover.jpg')
    expect(parsed.contentHtml).toContain('第一段内容')
  })

  it('does not crash when fields are missing', () => {
    const parsed = parseWechatArticle('<html><body><p>孤立内容</p></body></html>')
    expect(parsed.metadata.title).toBe('')
    expect(parsed.contentHtml).toContain('孤立内容')
  })
})
