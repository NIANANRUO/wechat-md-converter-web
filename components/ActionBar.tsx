import type { ConvertResult } from '@/lib/types'
import { safeFilename } from '@/lib/assets/filename'
import { createArticleZip } from '@/lib/output/createZip'
import { downloadBlob, downloadTextFile } from '@/lib/output/downloadFile'

interface ActionBarProps {
  result?: ConvertResult
  onNotice: (message: string) => void
}

export function ActionBar({ result, onNotice }: ActionBarProps) {
  const disabled = !result?.markdown

  async function copyMarkdown() {
    if (!result) return
    await navigator.clipboard.writeText(result.markdown)
    onNotice('Markdown 已复制到剪贴板。')
  }

  function downloadMarkdown() {
    if (!result) return
    downloadTextFile(result.markdown, `${safeFilename(result.metadata.title)}.md`)
  }

  async function downloadZip() {
    if (!result) return
    const blob = await createArticleZip(result.markdown, result.metadata, result.assets)
    downloadBlob(blob, `${safeFilename(result.metadata.title)}.zip`)
  }

  const buttonClass =
    'rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-fern disabled:cursor-not-allowed disabled:bg-ink/30'

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-ink/10 bg-white/70 p-4">
      <button type="button" disabled={disabled} onClick={copyMarkdown} className={buttonClass}>
        复制 Markdown
      </button>
      <button type="button" disabled={disabled} onClick={downloadMarkdown} className={buttonClass}>
        下载 Markdown
      </button>
      <button type="button" disabled={disabled} onClick={downloadZip} className={buttonClass}>
        下载 ZIP
      </button>
    </div>
  )
}
