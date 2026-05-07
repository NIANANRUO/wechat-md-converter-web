export interface ArticleMetadata {
  title: string
  author: string
  account: string
  publishTime: string
  sourceUrl: string
  cover: string
}

export interface ParsedArticle {
  metadata: ArticleMetadata
  contentHtml: string
  rawHtml: string
}

export interface ConvertOptions {
  sourceUrl?: string
  frontmatter: boolean
  downloadImages: boolean
  appendLinks: boolean
  keepHtml: boolean
}

export type UrlFetchMode = 'public' | 'custom'

export interface ConvertResult {
  metadata: ArticleMetadata
  markdown: string
  links: LinkItem[]
  images: ImageItem[]
  assets: AssetItem[]
  debug?: {
    rawHtml: string
    cleanedHtml: string
    proxyAccess?: 'public' | 'private'
  }
}

export interface LinkItem {
  text: string
  url: string
  originalUrl?: string
}

export interface ImageItem {
  originalUrl: string
  localPath?: string
  alt?: string
  success: boolean
  error?: string
}

export interface AssetItem {
  filename: string
  path: string
  mimeType: string
  data: ArrayBuffer
}
