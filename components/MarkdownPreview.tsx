import ReactMarkdown from 'react-markdown'

interface MarkdownPreviewProps {
  markdown: string
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  return (
    <div className="markdown-body h-[46rem] overflow-auto rounded-md border border-ink/10 bg-white/75 p-5">
      <ReactMarkdown>{markdown || '转换后将在这里显示预览。'}</ReactMarkdown>
    </div>
  )
}
