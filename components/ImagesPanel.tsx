import type { ImageItem } from '@/lib/types'

interface ImagesPanelProps {
  images: ImageItem[]
}

export function ImagesPanel({ images }: ImagesPanelProps) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/70 p-4">
      <h2 className="mb-3 text-lg font-bold">图片资源状态</h2>
      <div className="overflow-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10">
              <th className="py-2 pr-3">原始 URL</th>
              <th className="py-2 pr-3">本地路径</th>
              <th className="py-2 pr-3">状态</th>
              <th className="py-2 pr-3">失败原因</th>
            </tr>
          </thead>
          <tbody>
            {images.length ? (
              images.map((image) => (
                <tr key={image.originalUrl} className="border-b border-ink/5 align-top">
                  <td className="break-all py-2 pr-3">{image.originalUrl}</td>
                  <td className="break-all py-2 pr-3">{image.localPath || '-'}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        image.success ? 'bg-fern/10 text-fern' : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {image.success ? '已本地化' : '保留远程链接'}
                    </span>
                  </td>
                  <td className="break-words py-2 pr-3 text-ink/65">{image.error || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 text-ink/65" colSpan={4}>
                  暂无图片。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
