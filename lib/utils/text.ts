export function normalizeWhitespace(value: string | undefined | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

export function collapseMarkdownBlankLines(value: string): string {
  return value.replace(/\n{3,}/g, '\n\n').trim()
}

export function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
}
