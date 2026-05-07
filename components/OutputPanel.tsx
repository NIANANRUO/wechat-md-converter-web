import { useState } from 'react'
import { MarkdownPreview } from './MarkdownPreview'

interface OutputPanelProps {
  markdown: string
}

export function OutputPanel({ markdown }: OutputPanelProps) {
  const [tab, setTab] = useState<'markdown' | 'preview'>('markdown')

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">输出区</h2>
        <div className="grid grid-cols-2 overflow-hidden rounded-md border border-ink/15 bg-white">
          {(['markdown', 'preview'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`px-4 py-2 text-sm font-medium ${
                tab === item ? 'bg-fern text-white' : 'text-ink hover:bg-mist/70'
              }`}
            >
              {item === 'markdown' ? 'Markdown' : '预览'}
            </button>
          ))}
        </div>
      </div>
      {tab === 'markdown' ? (
        <textarea
          value={markdown}
          readOnly
          className="h-[46rem] resize-none overflow-auto rounded-md border border-ink/10 bg-white/80 p-4 font-mono text-sm leading-6 outline-none"
          placeholder="转换后的 Markdown 会显示在这里。"
        />
      ) : (
        <MarkdownPreview markdown={markdown} />
      )}
    </section>
  )
}
