import type { ArticleMetadata } from '@/lib/types'

function yaml(value: string | undefined): string {
  return `"${(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function createFrontmatter(metadata: Partial<ArticleMetadata>, enabled = true, createdAt = new Date()): string {
  if (!enabled) return ''
  return [
    '---',
    `title: ${yaml(metadata.title)}`,
    `author: ${yaml(metadata.author)}`,
    `account: ${yaml(metadata.account)}`,
    `publish_time: ${yaml(metadata.publishTime)}`,
    `source_url: ${yaml(metadata.sourceUrl)}`,
    `cover: ${yaml(metadata.cover)}`,
    `created_at: ${yaml(createdAt.toISOString())}`,
    '---',
    ''
  ].join('\n')
}
