import { saveAs } from 'file-saver'

export function downloadTextFile(content: string, filename: string, mimeType = 'text/markdown;charset=utf-8'): void {
  saveAs(new Blob([content], { type: mimeType }), filename)
}

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}
