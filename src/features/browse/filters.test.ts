import { describe, expect, it } from 'vitest'
import { applyFilters, collectTags, deserializeFilters, serializeFilters } from './filters'
import type { MergedEntry } from '../../content/merge'
import type { EntryMeta } from '../../content/schema'

const entry = (over: Partial<EntryMeta> & { id: string }): MergedEntry => {
  const meta: EntryMeta = {
    title: over.id,
    rumor: 'r',
    verdict: 'refuted',
    era: 'qing',
    category: 'royal',
    tags: ['乾隆'],
    origin: '讹传',
    evidence: 'strong',
    updated: '2026-08-20',
    revision: 1,
    references: [{ id: 'ref1', type: 'modern', text: 'x' }],
    ...over
  }
  return { id: over.id, meta, source: 'built', conflictEqualRevision: false }
}

const entries = [
  entry({ id: 'b', era: 'qing', verdict: 'refuted', updated: '2026-08-01', tags: ['乾隆', '身世'] }),
  entry({ id: 'a', era: 'qinhan', verdict: 'partial', updated: '2026-08-10', tags: ['焚书'] }),
  entry({ id: 'c', era: 'ming', verdict: 'disputed', updated: '2026-08-05', tags: ['乾隆'] })
]

describe('applyFilters', () => {
  it('empty filters keep all, default era sort', () => {
    const out = applyFilters(entries, { eras: [], categories: [], verdicts: [], origins: [], tags: [], readState: 'all' }, 'era', [])
    expect(out.map((e) => e.id)).toEqual(['a', 'c', 'b'])
  })

  it('filters by era and verdict combined', () => {
    const f = { eras: ['qing', 'ming'], categories: [], verdicts: ['disputed'], origins: [], tags: [], readState: 'all' as const }
    expect(applyFilters(entries, f, 'era', []).map((e) => e.id)).toEqual(['c'])
  })

  it('filters by tag', () => {
    const f = { eras: [], categories: [], verdicts: [], origins: [], tags: ['乾隆'], readState: 'all' as const }
    expect(applyFilters(entries, f, 'era', []).map((e) => e.id)).toEqual(['c', 'b'])
  })

  it('read state filter uses read set', () => {
    const f = { eras: [], categories: [], verdicts: [], origins: [], tags: [], readState: 'unread' as const }
    expect(applyFilters(entries, f, 'era', ['a']).map((e) => e.id)).toEqual(['c', 'b'])
  })

  it('sort by updated desc', () => {
    const out = applyFilters(entries, { eras: [], categories: [], verdicts: [], origins: [], tags: [], readState: 'all' }, 'updated', [])
    expect(out.map((e) => e.id)).toEqual(['a', 'c', 'b'])
  })
})

describe('collectTags', () => {
  it('counts tag frequency', () => {
    expect(collectTags(entries)[0]).toEqual({ tag: '乾隆', count: 2 })
  })
})

describe('serialize/deserialize roundtrip', () => {
  it('roundtrips filters and sort', () => {
    const f = { eras: ['qing'], categories: ['royal'], verdicts: ['refuted'], origins: ['讹传'], tags: ['乾隆'], readState: 'unread' as const }
    const qs = serializeFilters(f, 'updated')
    const back = deserializeFilters(qs)
    expect(back.filters).toEqual(f)
    expect(back.sort).toBe('updated')
  })

  it('defaults roundtrip to empty', () => {
    const back = deserializeFilters(serializeFilters({ eras: [], categories: [], verdicts: [], origins: [], tags: [], readState: 'all' }, 'era'))
    expect(back.filters).toEqual({ eras: [], categories: [], verdicts: [], origins: [], tags: [], readState: 'all' })
    expect(back.sort).toBe('era')
  })
})
