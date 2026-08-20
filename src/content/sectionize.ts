import { SECTION_KEYS, SECTION_LABELS, SECTION_TITLES } from './schema.ts'
import type { SectionKey } from './schema.ts'

export interface Section {
  key: SectionKey | 'extra'
  title: string
  html: string
}

export interface Footnote {
  n: number
  html: string
}

export interface Sectionized {
  sections: Section[]
  footnotes: Footnote[]
}

/** 将渲染后的 bodyHtml 按 <h2> 语义区块切分，并抽出脚注区 */
export function sectionize(bodyHtml: string): Sectionized {
  let rest = bodyHtml
  const footnotes: Footnote[] = []

  const fnSep = rest.indexOf('<hr class="footnotes-sep">')
  if (fnSep !== -1) {
    const fnHtml = rest.slice(fnSep)
    rest = rest.slice(0, fnSep)
    for (const m of fnHtml.matchAll(/<li id="fn(\d+)" class="footnote-item">([\s\S]*?)<\/li>/g)) {
      footnotes.push({ n: Number(m[1]), html: m[2] })
    }
  }

  const parts = rest.split(/<h2>([^<]*)<\/h2>/)
  const sections: Section[] = []
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim()
    const html = parts[i + 1] ?? ''
    sections.push({ key: toKey(title), title, html })
  }

  return { sections, footnotes }
}

function toKey(title: string): SectionKey | 'extra' {
  const key = SECTION_TITLES[title.trim()]
  return key ?? 'extra'
}

export const isKnownSection = (key: Section['key']): boolean =>
  (SECTION_KEYS as readonly string[]).includes(key)

export const sectionLabel = (s: Section): string =>
  s.key === 'extra' ? s.title : SECTION_LABELS[s.key]
