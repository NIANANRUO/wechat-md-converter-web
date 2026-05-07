'use client'

import { useMemo, useState } from 'react'
import { ActionBar } from '@/components/ActionBar'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ImagesPanel } from '@/components/ImagesPanel'
import { InputMode, InputPanel } from '@/components/InputPanel'
import { LinksPanel } from '@/components/LinksPanel'
import { MetadataCard } from '@/components/MetadataCard'
import { OutputPanel } from '@/components/OutputPanel'
import { fetchArticleHtml } from '@/lib/assets/fetchArticleHtml'
import { convertArticle } from '@/lib/converter/convertArticle'
import type { ConvertOptions, ConvertResult, UrlFetchMode } from '@/lib/types'

export default function Home() {
  const [mode, setMode] = useState<InputMode>('html')
  const [html, setHtml] = useState('')
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ConvertResult>()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [urlFetchMode, setUrlFetchMode] = useState<UrlFetchMode>('public')
  const [publicEndpoint, setPublicEndpoint] = useState(process.env.NEXT_PUBLIC_WECHAT_FETCHER_URL || '')
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [options, setOptions] = useState<ConvertOptions>({
    frontmatter: true,
    downloadImages: true,
    appendLinks: true,
    keepHtml: false
  })

  const mergedOptions = useMemo(() => ({ ...options, sourceUrl: url }), [options, url])

  async function resolveHtml(): Promise<{ html: string; access?: 'public' | 'private' }> {
    if (mode === 'url') {
      const fetched = await fetchArticleHtml(url, {
        mode: urlFetchMode,
        publicEndpoint,
        customEndpoint,
        accessKey
      })
      return { html: fetched.html, access: fetched.access }
    }

    if (!html.trim()) throw new Error(mode === 'file' ? '请先上传 HTML 文件。' : '请先粘贴 HTML 源码。')
    return { html }
  }

  async function handleConvert() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const source = await resolveHtml()
      const converted = await convertArticle(source.html, mergedOptions)
      if (converted.debug) {
        converted.debug.proxyAccess = source.access
      }
      setResult(converted)
      setNotice(source.access ? `转换完成，代理模式：${source.access === 'private' ? '私有密钥' : '公共'}` : '转换完成。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="py-4">
        <h1 className="text-3xl font-black tracking-normal md:text-5xl">微信公众号转 Markdown</h1>
        <p className="mt-3 max-w-3xl text-base text-ink/70 md:text-lg">
          将公众号文章转换为干净、可归档、可编辑的 Markdown 文件，并支持链接识别、图片本地化和 ZIP 导出。
        </p>
      </header>

      <ErrorMessage message={error} />
      {notice && <div className="rounded-md border border-fern/30 bg-fern/10 px-4 py-3 text-sm text-fern">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[26rem_minmax(0,1fr)] 2xl:grid-cols-[28rem_minmax(0,1fr)]">
        <div className="relative z-20 min-w-0">
          <InputPanel
            mode={mode}
            html={html}
            url={url}
            options={mergedOptions}
            urlFetchMode={urlFetchMode}
            customEndpoint={customEndpoint}
            accessKey={accessKey}
            loading={loading}
            onModeChange={setMode}
            onHtmlChange={setHtml}
            onUrlChange={setUrl}
            onOptionsChange={setOptions}
            onUrlFetchModeChange={setUrlFetchMode}
            onCustomEndpointChange={setCustomEndpoint}
            onAccessKeyChange={setAccessKey}
            onFileRead={(content) => {
              setHtml(content)
              setMode('file')
              setNotice('HTML 文件已读取，可以开始转换。')
            }}
            onConvert={() => void handleConvert()}
            actions={<ActionBar result={result} onNotice={setNotice} />}
          />
        </div>
        <div className="relative z-10 min-w-0">
          <OutputPanel markdown={result?.markdown || ''} />
        </div>
      </div>

      <div className="grid gap-6">
        <MetadataCard metadata={result?.metadata} />
        <LinksPanel links={result?.links || []} />
        <ImagesPanel images={result?.images || []} />
      </div>
    </main>
  )
}
