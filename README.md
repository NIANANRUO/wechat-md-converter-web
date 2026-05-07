# wechat-md-converter-web

一个纯静态 Next.js Web 工具，用于将微信公众号文章内容转换为干净、可归档、可编辑的 Markdown 文件。支持粘贴 HTML、上传 HTML 文件、文章链接 best-effort 抓取、链接识别与微信跳转链接解码、图片本地化、YAML frontmatter、Markdown 预览、复制、下载 Markdown 和下载 ZIP。

本项目是纯静态前端应用，可以部署到 GitHub Pages。
由于 GitHub Pages 不提供内置服务端代理能力，浏览器直连文章链接可能受到 CORS 限制。
推荐部署随项目提供的 Cloudflare Worker 抓取代理，这样用户可以直接粘贴微信公众号链接并转换。

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

常用命令：

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

`npm run build` 会通过 Next.js 静态导出生成 `out/` 目录。

## 使用方式

首页 `/` 就是主要工具页面。选择输入方式，设置转换选项，点击“转换为 Markdown”，然后查看 Markdown、预览、元信息、链接清单和图片状态。

### 粘贴 HTML 模式

这是最稳定的推荐路径。请在浏览器中打开有权保存和处理的文章页面，复制网页 HTML 源码，粘贴到输入框后转换。

### 上传 HTML 文件模式

保存网页为 `.html` 或 `.htm` 文件后上传。应用使用浏览器 File API 读取文件内容，不会上传到服务器。

### 文章链接模式

文章链接模式支持两种抓取方式：

- 公共代理：推荐给普通用户。前端把微信公众号链接发送给站点配置的 Worker，Worker 返回 HTML，前端再完成解析与 Markdown 转换。
- 自定义代理：高级用户可以填写自己的 Worker 地址。

高级设置里可以填写访问密钥。普通陌生用户不需要填写；你和朋友可以填写私有密钥，以获得更高的 Worker 处理限制。

Worker 会接收文章链接。公众号页面仍可能因为登录、订阅权限、平台风控或服务限流而失败。本项目不实现登录绕过、风控规避或未授权批量抓取。

如果 Worker 或第三方读取服务返回“环境异常”，说明微信返回了验证页或目标文章需要额外访问条件。此时工具会显示失败原因；不建议把用户引导到复杂的收藏夹脚本流程。

## Markdown 预览

转换结果可在 Markdown 文本和预览之间切换。预览由 `react-markdown` 在浏览器端渲染。

## 图片本地化

默认会尝试通过浏览器 `fetch` 下载正文图片，并在 ZIP 中保存到 `assets/`。如果图片受 CORS 限制或下载失败，转换不会中断，Markdown 会保留远程图片链接，并在图片状态中显示失败原因。

## 链接识别

工具会解析普通链接、空文本链接、纯 URL 文本，并尝试从微信跳转链接参数中解码真实 URL。危险协议如 `javascript:` 和 `data:` 不会生成可点击 Markdown 链接。

## 下载

- 复制 Markdown：写入系统剪贴板。
- 下载 Markdown：保存单个 `.md` 文件。
- 下载 ZIP：生成 `article-title/article.md` 和 `article-title/assets/*`，完全在浏览器端完成。

## 部署到 GitHub Pages

项目包含 `.github/workflows/deploy.yml`。推送到 `main` 分支后会自动运行：

```bash
npm ci
npm run typecheck
npm test
npm run build
```

然后上传 `out/` 目录并使用 GitHub Pages 官方 Actions 部署。

在 GitHub 仓库中进入 Settings -> Pages，把 Source 选择为 GitHub Actions。之后 push 到 `main` 即可自动部署。

## 部署 Cloudflare Worker

Worker 用于把微信公众号链接转换成 HTML。前端仍然是纯静态 GitHub Pages，Worker 是独立的小型抓取代理。

1. 安装并登录 Wrangler：

```bash
npm install -g wrangler
wrangler login
```

2. 复制 Worker 配置：

```bash
cd worker
copy wrangler.toml.example wrangler.toml
```

macOS/Linux 使用：

```bash
cp wrangler.toml.example wrangler.toml
```

3. 部署 Worker：

```bash
npx wrangler deploy
```

部署成功后会得到类似：

```text
https://wechat-md-fetcher.your-name.workers.dev/
```

4. 本地开发时创建 `.env.local`：

```bash
NEXT_PUBLIC_WECHAT_FETCHER_URL=https://wechat-md-fetcher.your-name.workers.dev/
```

5. 设置朋友/私有访问密钥，可选但推荐：

```bash
npx wrangler secret put PRIVATE_ACCESS_KEY
```

按提示输入一段只有你和朋友知道的密钥。页面高级设置里的“访问密钥”填写这段值即可走私有限制。

6. 设置允许访问的前端域名，可选但推荐。编辑 `worker/wrangler.toml`：

```toml
[vars]
ALLOWED_ORIGINS = "https://your-name.github.io,http://localhost:3000"
```

开发阶段可以保持 `*`。公开部署后建议改成你的 GitHub Pages 域名。

7. GitHub Pages 部署时，在仓库 Settings -> Secrets and variables -> Actions -> Variables 中添加：

```text
NEXT_PUBLIC_WECHAT_FETCHER_URL=https://wechat-md-fetcher.your-name.workers.dev/
```

然后修改 workflow 或在构建环境中暴露该变量。也可以不配置，用户在页面上手动填写 Worker 地址。

Worker 只允许抓取 `https://mp.weixin.qq.com/s/...` 文章链接，并返回 HTML。公共请求最大响应 5 MB，带正确访问密钥的私有请求最大响应 10 MB。它不会处理登录、验证码、环境验证或批量抓取。

## GitHub Pages 子路径

默认配置适合部署到用户站点根路径。如果需要部署到仓库子路径，例如 `https://user.github.io/wechat-md-converter-web/`，可在 `next.config.js` 中按需增加：

```js
const repo = '/wechat-md-converter-web'

const nextConfig = {
  output: 'export',
  basePath: repo,
  assetPrefix: repo,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

## 常见问题

**为什么文章链接抓取失败？**
因为 GitHub Pages 是纯静态托管，浏览器直接请求公众号文章可能被 CORS 策略阻止。部署 Cloudflare Worker 后，链接模式会更接近“粘贴链接自动转换”的体验。

**图片为什么没有进入 ZIP？**
远程图片可能禁止跨域下载。应用会保留远程链接，并在图片状态里记录失败原因。

**内容会上传吗？**
不会。解析、转换、预览、ZIP 生成都在浏览器端完成。

## 合规说明

本工具仅用于处理用户有权保存和转换的内容。请勿用于绕过平台权限、破解登录、规避风控或批量抓取未授权内容。

## Roadmap

- 增强复杂排版和表格保真度。
- 支持更多元信息提取规则。
- 增加可选的 frontmatter 字段模板。
- 增加更多 Markdown 风格配置。
- 改进图片 MIME 识别与下载重试提示。
