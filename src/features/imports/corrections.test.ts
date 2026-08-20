import { describe, expect, it } from 'vitest'
import {
  addCorrection,
  hasAcceptedCorrections,
  loadCorrections,
  parseCorrectionFile,
  removeCorrection,
  setCorrectionStatus
} from './corrections'

const FILE = {
  app: 'rumor-archive' as const,
  type: 'correction' as const,
  version: 1 as const,
  entryId: 'qianlong-hanrein',
  entryTitle: '乾隆是汉人陈世倌之子？',
  location: '史料考证 第二段',
  evidence: '页码有误，应为 412-416',
  contact: 'friend@example.com',
  submittedAt: '2026-08-20T10:00:00.000Z'
}

describe('corrections storage', () => {
  it('adds / loads / statuses / removes', () => {
    localStorage.clear()
    const c = addCorrection(FILE)
    expect(loadCorrections()).toHaveLength(1)
    expect(loadCorrections()[0].status).toBe('pending')
    expect(hasAcceptedCorrections()).toBe(false)

    setCorrectionStatus(c.id, 'accepted')
    expect(hasAcceptedCorrections()).toBe(true)
    expect(loadCorrections()[0].status).toBe('accepted')

    setCorrectionStatus(c.id, 'rejected', '依据不足')
    expect(loadCorrections()[0].note).toBe('依据不足')

    removeCorrection(c.id)
    expect(loadCorrections()).toHaveLength(0)
  })

  it('parses valid correction file json', () => {
    const r = parseCorrectionFile(JSON.stringify(FILE))
    expect(r.ok).toBe(true)
  })

  it('rejects invalid json / wrong shape / missing fields', () => {
    expect(parseCorrectionFile('not json').ok).toBe(false)
    expect(parseCorrectionFile('{"app":"other"}').ok).toBe(false)
    expect(parseCorrectionFile(JSON.stringify({ ...FILE, evidence: '' })).ok).toBe(false)
  })
})
