import { describe, expect, it } from 'vitest'
import { computeAchievements } from './achievements'
import type { MergedEntry } from '../../content/merge'
import type { EntryMeta } from '../../content/schema'

const meta = (over: Partial<EntryMeta> & { id: string }): EntryMeta => ({
  title: over.id,
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

const entry = (id: string, era: EntryMeta['era'] = 'qing'): MergedEntry => ({
  id,
  meta: meta({ id, era }),
  source: 'built',
  conflictEqualRevision: false
})

const baseUser = { read: [], bookmarks: [], openedAt: null as string | null }

describe('computeAchievements', () => {
  it('earns founding only when openedAt exists', () => {
    const a1 = computeAchievements({ user: baseUser, merged: { entries: [] }, hasAcceptedCorrection: false })
    expect(a1.find((x) => x.id === 'founding')!.earned).toBe(false)
    const a2 = computeAchievements({
      user: { ...baseUser, openedAt: '2026-08-01' },
      merged: { entries: [] },
      hasAcceptedCorrection: false
    })
    expect(a2.find((x) => x.id === 'founding')!.earned).toBe(true)
  })

  it('read count thresholds', () => {
    const r = computeAchievements({
      user: { ...baseUser, read: ['a'] },
      merged: { entries: [entry('a')] },
      hasAcceptedCorrection: false
    })
    expect(r.find((x) => x.id === 'first-read')!.earned).toBe(true)
    expect(r.find((x) => x.id === 'well-read')!.earned).toBe(false)
  })

  it('era completion requires >=3 entries all read', () => {
    const entries = [entry('a'), entry('b'), entry('c')]
    const partial = computeAchievements({
      user: { ...baseUser, read: ['a', 'b'] },
      merged: { entries },
      hasAcceptedCorrection: false
    })
    expect(partial.find((x) => x.id === 'era-master')!.earned).toBe(false)
    const full = computeAchievements({
      user: { ...baseUser, read: ['a', 'b', 'c'] },
      merged: { entries },
      hasAcceptedCorrection: false
    })
    expect(full.find((x) => x.id === 'era-master')!.earned).toBe(true)
  })

  it('does not grant era-master when only 2 entries exist', () => {
    const r = computeAchievements({
      user: { ...baseUser, read: ['a', 'b'] },
      merged: { entries: [entry('a'), entry('b')] },
      hasAcceptedCorrection: false
    })
    expect(r.find((x) => x.id === 'era-master')!.earned).toBe(false)
  })

  it('corrector requires accepted correction', () => {
    const r = computeAchievements({ user: baseUser, merged: { entries: [] }, hasAcceptedCorrection: true })
    expect(r.find((x) => x.id === 'corrector')!.earned).toBe(true)
  })

  it('monthly at 30 days', () => {
    const old = new Date(Date.now() - 31 * 86400000).toISOString()
    const r = computeAchievements({
      user: { ...baseUser, openedAt: old },
      merged: { entries: [] },
      hasAcceptedCorrection: false
    })
    expect(r.find((x) => x.id === 'monthly')!.earned).toBe(true)
  })
})
