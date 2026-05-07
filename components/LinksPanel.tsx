import type { LinkItem } from '@/lib/types'

interface LinksPanelProps {
  links: LinkItem[]
}

export function LinksPanel({ links }: LinksPanelProps) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/70 p-4">
      <h2 className="mb-3 text-lg font-bold">链接清单</h2>
      <div className="overflow-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10">
              <th className="py-2 pr-3">链接文本</th>
              <th className="py-2 pr-3">最终 URL</th>
              <th className="py-2 pr-3">原始 URL</th>
            </tr>
          </thead>
          <tbody>
            {links.length ? (
              links.map((link) => (
                <tr key={link.url} className="border-b border-ink/5 align-top">
                  <td className="max-w-48 break-words py-2 pr-3">{link.text || '空文本链接'}</td>
                  <td className="break-all py-2 pr-3 text-fern">{link.url}</td>
                  <td className="break-all py-2 pr-3 text-ink/65">{link.originalUrl || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 text-ink/65" colSpan={3}>
                  暂无链接。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
