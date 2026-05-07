const ALLOWED_HOSTS = new Set(['mp.weixin.qq.com'])
const PUBLIC_MAX_HTML_BYTES = 5 * 1024 * 1024
const PRIVATE_MAX_HTML_BYTES = 10 * 1024 * 1024
const MAX_URL_LENGTH = 4096

function corsHeaders(origin, env) {
  const allowedOrigins = (env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const allowAny = allowedOrigins.includes('*')
  const allowedOrigin = allowAny || (origin && allowedOrigins.includes(origin)) ? origin || '*' : allowedOrigins[0] || '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key'
  }
}

function securityHeaders(origin, env) {
  return {
    ...corsHeaders(origin, env),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }
}

function json(data, status = 200, origin = '', env = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...securityHeaders(origin, env),
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

function isAllowedOrigin(origin, env) {
  const allowedOrigins = (env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)
}

function isPrivateRequest(request, env) {
  const expected = env.PRIVATE_ACCESS_KEY
  if (!expected) return false
  return request.headers.get('X-Access-Key') === expected
}

function normalizeTarget(rawUrl) {
  if (!rawUrl) throw new Error('Missing url parameter.')
  if (rawUrl.length > MAX_URL_LENGTH) throw new Error('URL is too long.')
  const target = new URL(rawUrl)
  if (target.protocol !== 'https:') {
    throw new Error('Only https URLs are supported.')
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    throw new Error('Only mp.weixin.qq.com article URLs are allowed.')
  }
  if (!target.pathname.startsWith('/s/')) {
    throw new Error('Only WeChat article URLs under /s/ are allowed.')
  }
  return target
}

async function readLimitedText(response, maxBytes) {
  const contentLength = Number(response.headers.get('content-length') || '0')
  if (contentLength && contentLength > maxBytes) {
    throw new Error(`Response is too large. Max ${Math.floor(maxBytes / 1024 / 1024)} MB.`)
  }

  const reader = response.body?.getReader()
  if (!reader) return response.text()

  const chunks = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxBytes) {
      throw new Error(`Response is too large. Max ${Math.floor(maxBytes / 1024 / 1024)} MB.`)
    }
    chunks.push(value)
  }

  const merged = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder('utf-8').decode(merged)
}

async function fetchWechatHtml(target, maxBytes) {
  const response = await fetch(target.toString(), {
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://mp.weixin.qq.com/'
    }
  })

  const contentType = response.headers.get('content-type') || ''
  if (contentType && !contentType.includes('text/html')) {
    throw new Error('Target did not return HTML.')
  }

  const html = await readLimitedText(response, maxBytes)
  return {
    status: response.status,
    finalUrl: response.url,
    html
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: securityHeaders(origin, env) })
    }

    if (!isAllowedOrigin(origin, env)) {
      return json({ ok: false, error: 'Origin is not allowed.' }, 403, origin, env)
    }

    if (request.method !== 'GET') {
      return json({ ok: false, error: 'Method not allowed.' }, 405, origin, env)
    }

    try {
      const privateAccess = isPrivateRequest(request, env)
      const maxBytes = privateAccess ? PRIVATE_MAX_HTML_BYTES : PUBLIC_MAX_HTML_BYTES
      const requestUrl = new URL(request.url)
      const target = normalizeTarget(requestUrl.searchParams.get('url'))
      const result = await fetchWechatHtml(target, maxBytes)

      return json(
        {
          ok: result.status >= 200 && result.status < 400,
          access: privateAccess ? 'private' : 'public',
          status: result.status,
          url: target.toString(),
          finalUrl: result.finalUrl,
          html: result.html
        },
        200,
        origin,
        env
      )
    } catch (error) {
      return json(
        {
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error.'
        },
        400,
        origin,
        env
      )
    }
  }
}
