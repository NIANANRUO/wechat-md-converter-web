import { describe, expect, it } from 'vitest'
import { createFrontmatter } from '@/lib/output/frontmatter'

describe('frontmatter', () => {
  it('generates escaped YAML frontmatter', () => {
    const fm = createFrontmatter({ title: '带"引号"', author: '作者' }, true, new Date('2026-05-06T12:00:00.000Z'))
    expect(fm).toContain('title: "带\\"引号\\""')
    expect(fm).toContain('author: "作者"')
    expect(fm).toContain('publish_time: ""')
    expect(fm).toContain('created_at: "2026-05-06T12:00:00.000Z"')
  })

  it('returns empty string when disabled', () => {
    expect(createFrontmatter({ title: 'x' }, false)).toBe('')
  })
})
