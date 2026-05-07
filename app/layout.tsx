import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '微信公众号转 Markdown',
  description: '将微信公众号文章内容转换为干净、可归档、可编辑的 Markdown 文件。'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
