import { describe, expect, it } from 'vitest'
import { mergeEntries } from './merge'
import type { EntryMeta } from './schema'

const meta = (over: Partial<EntryMeta>): EntryMeta => ({
  id: 'a',
  title: 'A',
  rumor: 'r',
  verdict: 'refuted',
  era: 'qing',
  category: 'royal',
  tags: ['t'],
  origin: '讹传',
  evidence: 'strong',
  updated: '2026-08-20',
  revision: 1,
  references: [{ id: 'ref1', type: 'modern', text: 'x' }],
  ...over
})

describe('mergeEntries', () => {
  it('new import id joins library without touching built entries', () => {
    const idx = mergeEntries([meta({ id: 'a' })], [meta({ id: 'b', title: 'B' })])
    expect(idx.stats.total).toBe(2)
    expect(idx.byId.get('b')?.source).toBe('imported')
    expect(idx.byId.get('a')?.source).toBe('built')
  })

  it('higher import revision overrides built', () => {
    const idx = mergeEntries(
      [meta({ id: 'a', revision: 1 })],
      [meta({ id: 'a', revision: 2, title: '修订版' })]
    )
    const a = idx.byId.get('a')!
    expect(a.source).toBe('imported')
    expect(a.meta.revision).toBe(2)
    expect(a.conflictEqualRevision).toBe(false)
  })

  it('equal revision marks conflict and keeps built effective', () => {
    const idx = mergeEntries([meta({ id: 'a', revision: 3 })], [meta({ id: 'a', revision: 3 })])
    const a = idx.byId.get('a')!
    expect(a.source).toBe('built')
    expect(a.conflictEqualRevision).toBe(true)
    expect(idx.stats.conflicts).toBe(1)
  })

  it('lower import revision is superseded by built', () => {
    const idx = mergeEntries([meta({ id: 'a', revision: 5 })], [meta({ id: 'a', revision: 2 })])
    const a = idx.byId.get('a')!
    expect(a.source).toBe('built')
    expect(a.supersededRevision).toBe(2)
  })

  it('stats aggregate verdicts and sources', () => {
    const idx = mergeEntries(
      [meta({ id: 'a', verdict: 'refuted' }), meta({ id: 'b', verdict: 'disputed' })],
      [meta({ id: 'c', verdict: 'refuted' })]
    )
    expect(idx.stats.byVerdict.refuted).toBe(2)
    expect(idx.stats.byVerdict.disputed).toBe(1)
    expect(idx.stats.imported).toBe(1)
  })
})
