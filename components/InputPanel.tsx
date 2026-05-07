import type { ConvertOptions, UrlFetchMode } from '@/lib/types'

export type InputMode = 'html' | 'file' | 'url'

interface InputPanelProps {
  mode: InputMode
  html: string
  url: string
  options: ConvertOptions
  urlFetchMode: UrlFetchMode
  customEndpoint: string
  accessKey: string
  loading: boolean
  onModeChange: (mode: InputMode) => void
  onHtmlChange: (value: string) => void
  onUrlChange: (value: string) => void
  onOptionsChange: (options: ConvertOptions) => void
  onUrlFetchModeChange: (mode: UrlFetchMode) => void
  onCustomEndpointChange: (value: string) => void
  onAccessKeyChange: (value: string) => void
  onFileRead: (content: string) => void
  onConvert: () => void
  actions?: React.ReactNode
}

export function InputPanel({
  mode,
  html,
  url,
  options,
  urlFetchMode,
  customEndpoint,
  accessKey,
  loading,
  onModeChange,
  onHtmlChange,
  onUrlChange,
  onOptionsChange,
  onUrlFetchModeChange,
  onCustomEndpointChange,
  onAccessKeyChange,
  onFileRead,
  onConvert,
  actions
}: InputPanelProps) {
  async function handleFile(file?: File) {
    if (!file) return
    onFileRead(await file.text())
  }

  function updateOption(key: keyof ConvertOptions, value: boolean) {
    onOptionsChange({ ...options, [key]: value })
  }

  return (
    <section className="relative z-20 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold">输入区</h2>
        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-ink/15 bg-white">
          {[
            ['html', '粘贴 HTML'],
            ['file', '上传 HTML 文件'],
            ['url', '文章链接']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onMouseDown={() => onModeChange(value as InputMode)}
              onClick={() => onModeChange(value as InputMode)}
              className={`px-3 py-2 text-sm font-medium ${
                mode === value ? 'bg-fern text-white' : 'text-ink hover:bg-mist/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'html' && (
        <textarea
          value={html}
          onChange={(event) => onHtmlChange(event.target.value)}
          className="min-h-[22rem] resize-y rounded-md border border-ink/10 bg-white/80 p-4 font-mono text-sm leading-6 outline-none focus:border-fern"
          placeholder="在这里粘贴微信公众号文章页面 HTML 源码。"
        />
      )}

      {mode === 'file' && (
        <div className="rounded-md border border-dashed border-ink/25 bg-white/60 p-6">
          <label className="block text-sm font-semibold" htmlFor="html-file">
            选择 .html 或 .htm 文件
          </label>
          <input
            id="html-file"
            type="file"
            accept=".html,.htm,text/html"
            className="mt-3 block w-full text-sm"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <p className="mt-3 text-sm text-ink/65">文件读取完成后会进入同一个转换流程。</p>
        </div>
      )}

      {mode === 'url' && (
        <div className="rounded-md border border-ink/10 bg-white/70 p-4">
          <label className="block text-sm font-semibold" htmlFor="article-url">
            微信公众号文章链接
          </label>
          <input
            id="article-url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-2 outline-none focus:border-fern"
            placeholder="https://mp.weixin.qq.com/s/xxxx"
          />
          <fieldset className="mt-4 grid gap-2 text-sm">
            <legend className="mb-2 font-semibold">链接抓取方式</legend>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="url-fetch-mode"
                checked={urlFetchMode === 'public'}
                onChange={() => onUrlFetchModeChange('public')}
              />
              <span>使用公共代理，推荐</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="url-fetch-mode"
                checked={urlFetchMode === 'custom'}
                onChange={() => onUrlFetchModeChange('custom')}
              />
              <span>自建代理模板</span>
            </label>
          </fieldset>
          <details className="mt-3 rounded-md border border-ink/10 bg-white/60 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">高级设置</summary>
            <div className="mt-3 grid gap-3">
              {urlFetchMode === 'public' ? (
                <p className="rounded-md bg-mist/50 px-3 py-2 text-ink/70">
                  当前使用站点内置公共代理。普通用户无需配置代理地址。
                </p>
              ) : (
                <label className="grid gap-1">
                  <span className="font-medium">自定义代理地址</span>
                  <input
                    value={customEndpoint}
                    onChange={(event) => onCustomEndpointChange(event.target.value)}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-fern"
                    placeholder="https://your-worker.example.com/"
                  />
                </label>
              )}
              <label className="grid gap-1">
                <span className="font-medium">访问密钥，可选</span>
                <input
                  value={accessKey}
                  onChange={(event) => onAccessKeyChange(event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-fern"
                  placeholder="朋友或私有使用可填写"
                />
                <span className={`text-xs ${accessKey.trim() ? 'text-fern' : 'text-ink/55'}`}>
                  {accessKey.trim() ? '已填写访问密钥，转换时会请求私有模式。' : '未填写访问密钥，将按公共模式请求。'}
                </span>
              </label>
            </div>
          </details>
          <p className="mt-3 text-sm text-ink/65">
            公共代理会接收文章链接，并按公共限额处理；访问密钥可用于朋友或私有使用场景。本工具不提供登录绕过、风控规避或批量抓取能力。
          </p>
          <details className="mt-4 rounded-md border border-ink/10 bg-white/70 p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-ink">如果链接抓取失败怎么办？</summary>
            <p className="mt-3 text-ink/70">
              部分微信公众号文章可能因为平台验证、访问环境或权限限制，无法通过链接自动抓取。你可以改用“粘贴 HTML”模式：在浏览器中打开文章页面，右键选择“查看页面源代码”或“显示网页源代码”，全选并复制源码后粘贴到本工具转换。
            </p>
            <div className="mt-4 font-semibold">手动获取 HTML 源码步骤：</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/70">
              <li>在浏览器中打开微信公众号文章链接。</li>
              <li>在页面空白处右键，选择“查看页面源代码”或“显示网页源代码”。</li>
              <li>在新打开的源码页面中按 Ctrl + A 全选，再按 Ctrl + C 复制。</li>
              <li>回到本工具，切换到“粘贴 HTML”。</li>
              <li>粘贴源码，点击“转换为 Markdown”。</li>
            </ol>
            <p className="mt-3 text-ink/70">
              如果页面只显示“环境异常”“请完成验证”或需要登录后才能访问，请先在浏览器中完成正常访问；本工具不会绕过平台验证或权限限制。
            </p>
          </details>
        </div>
      )}

      <div className="grid gap-3 rounded-md border border-ink/10 bg-white/70 p-4 text-sm sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={options.frontmatter} onChange={(e) => updateOption('frontmatter', e.target.checked)} />
          输出 YAML Frontmatter
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.downloadImages}
            onChange={(e) => updateOption('downloadImages', e.target.checked)}
          />
          尝试下载并本地化图片
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={options.appendLinks} onChange={(e) => updateOption('appendLinks', e.target.checked)} />
          文末追加链接清单
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={options.keepHtml} onChange={(e) => updateOption('keepHtml', e.target.checked)} />
          保留复杂 HTML
        </label>
      </div>

      <button
        type="button"
        onClick={onConvert}
        disabled={loading}
        className="rounded-md bg-coral px-5 py-3 font-bold text-white transition hover:bg-fern disabled:cursor-wait disabled:bg-coral/50"
      >
        {loading ? '转换中...' : '转换为 Markdown'}
      </button>
      {actions}
    </section>
  )
}
