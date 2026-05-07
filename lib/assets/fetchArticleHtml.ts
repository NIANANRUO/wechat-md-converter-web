export type ArticleFetchMode = 'public' | 'custom'

export interface FetchArticleHtmlOptions {
  mode: ArticleFetchMode
  publicEndpoint?: string
  customEndpoint?: string
  accessKey?: string
}

export interface FetchArticleHtmlResult {
  html: string
  access: 'public' | 'private'
}

function looksLikeHtml(value: string): boolean {
  return /<(html|body|article|div|section|meta|p|h1|h2|img|a)\b/i.test(value)
}

function looksLikeWechatBlockPage(value: string): boolean {
  return /环境异常|完成验证后即可继续访问|去验证|当前环境异常/.test(value)
}

function proxyUrl(endpoint: string, targetUrl: string): string {
  const trimmed = endpoint.trim()
  if (!trimmed) throw new Error('代理地址未配置。')
  const separator = trimmed.includes('?') ? '&' : '?'
  return `${trimmed}${separator}url=${encodeURIComponent(targetUrl.trim())}`
}

async function fetchProxyHtml(endpoint: string | undefined, targetUrl: string, accessKey?: string): Promise<FetchArticleHtmlResult> {
  const headers: HeadersInit = {}
  if (accessKey?.trim()) headers['X-Access-Key'] = accessKey.trim()
  const response = await fetch(proxyUrl(endpoint || '', targetUrl), { headers })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as {
      ok?: boolean
      html?: string
      error?: string
      status?: number
      access?: 'public' | 'private'
    }
    if (!data.ok || !data.html) throw new Error(data.error || `Worker returned status ${data.status || 'unknown'}`)
    return { html: data.html, access: data.access || 'public' }
  }
  return { html: await response.text(), access: accessKey?.trim() ? 'private' : 'public' }
}

export async function fetchArticleHtml(url: string, options: FetchArticleHtmlOptions): Promise<FetchArticleHtmlResult> {
  const targetUrl = url.trim()
  if (!targetUrl) throw new Error('请先输入文章链接。')

  const endpoint = options.mode === 'custom' ? options.customEndpoint : options.publicEndpoint
  const label = options.mode === 'custom' ? '自定义代理' : '公共代理'
  try {
    const result = await fetchProxyHtml(endpoint, targetUrl, options.accessKey)
    const html = result.html
    if (!looksLikeHtml(html)) throw new Error(`${label}没有返回可解析的 HTML。`)
    if (looksLikeWechatBlockPage(html)) throw new Error('微信返回了环境异常验证页，代理无法取得正文。')
    return result
  } catch (error) {
    throw new Error(`${label}抓取失败：${error instanceof Error ? error.message : '未知错误'}`)
  }
}
