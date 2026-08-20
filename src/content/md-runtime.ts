import { parseEntry, type ParseResult } from './parse-entry.ts'

/** 浏览器端导入解析（file:// 下 DOMPurify 自动可用） */
export function parseMdForImport(raw: string, filename: string): ParseResult {
  return parseEntry(raw, filename)
}

/** 导入层条目 → 可下载的 md 文本（往返格式） */
export function recordToMarkdown(record: { rawMd: string }): string {
  return record.rawMd
}

/** 触发浏览器下载 */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
