import { describe, expect, it } from 'vitest'
import { buildIndex, search } from './engine'
import { segmentZh } from './tokenize'
import type { FulltextDoc } from '../content/schema'

const doc = (over: Partial<FulltextDoc>): FulltextDoc => ({
  id: 'a',
  title: '乾隆是汉人陈世倌之子？',
  rumor: '乾隆实为海宁陈氏汉人之子。',
  fulltext: '孟森考订雍正换子说不能成立。',
  pinyinFull: 'qianlongshirenchenshiguanzhizi',
  pinyinInitials: 'qlshrcsgzz',
  ...over
})

const docs = [
  doc({ id: 'a' }),
  doc({
    id: 'b',
    title: '郑和船队比哥伦布早发现美洲？',
    rumor: '1421 年郑和船队完成环球航行。',
    fulltext: '孟席斯的说法被学界全面批驳。',
    pinyinFull: 'zhenghechuanduibigelunbuzao',
    pinyinInitials: 'zhcdbglbzzfxmz'
  })
]

describe('segmentZh', () => {
  it('segments mixed chinese text into word-like tokens', () => {
    const tokens = segmentZh('乾隆是汉人')
    expect(tokens).toContain('乾隆')
    expect(tokens).toContain('汉人')
  })
})

describe('search engine', () => {
  it('chinese query hits relevant doc', () => {
    buildIndex(docs)
    const hits = search('乾隆 汉人')
    expect(hits.map((h) => h.id)).toContain('a')
    expect(hits.map((h) => h.id)).not.toContain('b')
  })

  it('full pinyin query matches', () => {
    buildIndex(docs)
    expect(search('qianlong').map((h) => h.id)).toContain('a')
  })

  it('pinyin initials query matches', () => {
    buildIndex(docs)
    expect(search('ql').map((h) => h.id)).toContain('a')
    expect(search('zhcd').map((h) => h.id)).toContain('b')
  })

  it('empty query returns empty', () => {
    buildIndex(docs)
    expect(search('   ')).toEqual([])
  })

  it('title matches score higher than body matches', () => {
    buildIndex(docs)
    const hits = search('孟森')
    expect(hits[0]?.id).toBe('a')
  })
})
