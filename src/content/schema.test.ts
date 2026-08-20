import { describe, expect, it } from 'vitest'
import { EntryMetaSchema, ERA_KEYS, VERDICT_KEYS } from './schema'

const validMeta = {
  id: 'qianlong-hanrein',
  title: '乾隆是汉人所生的陈家洛之子？',
  rumor: '乾隆皇帝实为海宁陈氏汉人之子，雍正以女易子。',
  verdict: 'refuted',
  era: 'qing',
  category: 'royal',
  tags: ['乾隆', '身世传闻'],
  origin: '文学演绎',
  evidence: 'strong',
  updated: '2026-08-20',
  revision: 1,
  references: [
    { id: 'ref1', type: 'ancient', text: '陈康祺. 郎潜纪闻·卷四[M]. 北京: 中华书局, 1984: 132.' }
  ]
}

describe('EntryMetaSchema', () => {
  it('accepts a valid entry', () => {
    const r = EntryMetaSchema.safeParse(validMeta)
    expect(r.success).toBe(true)
  })

  it('rejects bad verdict', () => {
    expect(EntryMetaSchema.safeParse({ ...validMeta, verdict: 'fake' }).success).toBe(false)
  })

  it('rejects bad era', () => {
    expect(EntryMetaSchema.safeParse({ ...validMeta, era: 'three-kingdoms' }).success).toBe(false)
  })

  it('rejects duplicate reference ids', () => {
    const dup = {
      ...validMeta,
      references: [validMeta.references[0], validMeta.references[0]]
    }
    const r = EntryMetaSchema.safeParse(dup)
    expect(r.success).toBe(false)
  })

  it('rejects non-kebab id and bad date', () => {
    expect(EntryMetaSchema.safeParse({ ...validMeta, id: 'Bad_ID' }).success).toBe(false)
    expect(EntryMetaSchema.safeParse({ ...validMeta, updated: '2026/08/20' }).success).toBe(false)
  })

  it('era/verdict key lists match spec vocabularies', () => {
    expect(ERA_KEYS).toHaveLength(8)
    expect(VERDICT_KEYS).toHaveLength(4)
  })
})
