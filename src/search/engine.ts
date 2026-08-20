import MiniSearch from 'minisearch'
import type { FulltextDoc } from '../content/schema.ts'
import { hasCJK, isLatinWord, segmentZh } from './tokenize.ts'

export interface SearchHit {
  id: string
  score: number
}

let index: MiniSearch<FulltextDoc> | null = null
let docs: FulltextDoc[] = []

export function buildIndex(allDocs: FulltextDoc[]): void {
  docs = allDocs
  index = new MiniSearch<FulltextDoc>({
    fields: ['title', 'rumor', 'fulltext'],
    tokenize: segmentZh
  })
  index.addAll(docs)
}

export function isIndexed(): boolean {
  return index !== null
}

/**
 * 混合检索：中文走 MiniSearch（标题 3x / 谣言 2x 加权 + 前缀），
 * 纯拉丁字母串（全拼/拼音首字母，如 "qianlong"/"ql"）走拼音线性匹配。
 */
export function search(query: string, limit = 50): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scores = new Map<string, number>()

  if (index && hasCJK(q)) {
    for (const r of index.search(q, {
      boost: { title: 3, rumor: 2, fulltext: 1 },
      prefix: true,
      fuzzy: 0.1
    })) {
      scores.set(r.id, (scores.get(r.id) ?? 0) + r.score)
    }
  }

  if (isLatinWord(q)) {
    for (const d of docs) {
      if (d.pinyinFull.includes(q) || d.pinyinInitials.includes(q)) {
        scores.set(d.id, (scores.get(d.id) ?? 0) + 1)
      }
    }
  }

  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
