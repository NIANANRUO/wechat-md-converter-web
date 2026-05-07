import type { ArticleMetadata } from '@/lib/types'

interface MetadataCardProps {
  metadata?: ArticleMetadata
}

export function MetadataCard({ metadata }: MetadataCardProps) {
  const rows = [
    ['标题', metadata?.title],
    ['作者', metadata?.author],
    ['公众号', metadata?.account],
    ['发布时间', metadata?.publishTime],
    ['来源链接', metadata?.sourceUrl],
    ['封面图', metadata?.cover]
  ]

  return (
    <section className="rounded-md border border-ink/10 bg-white/70 p-4">
      <h2 className="mb-3 text-lg font-bold">文章元信息</h2>
      <dl className="grid gap-3 text-sm md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-semibold text-ink/65">{label}</dt>
            <dd className="mt-1 break-words">{value || '未识别'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
