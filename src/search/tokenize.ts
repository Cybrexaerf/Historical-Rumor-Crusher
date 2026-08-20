const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })

/** 中文分词（MiniSearch 索引与查询共用同一分词器） */
export function segmentZh(text: string): string[] {
  const out: string[] = []
  for (const seg of segmenter.segment(text.toLowerCase())) {
    if (seg.isWordLike) out.push(seg.segment)
  }
  return out
}

export function hasCJK(text: string): boolean {
  return /[^\x00-\x7f]/.test(text)
}

export function isLatinWord(text: string): boolean {
  return /^[a-z0-9]+$/.test(text)
}
