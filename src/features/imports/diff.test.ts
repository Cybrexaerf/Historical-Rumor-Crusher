import { describe, expect, it } from 'vitest'
import { lineDiff } from './diff'

describe('lineDiff', () => {
  it('detects additions and deletions', () => {
    const rows = lineDiff('a\nb\nc', 'a\nx\nc\nd')
    expect(rows).toEqual([
      { type: 'same', text: 'a' },
      { type: 'del', text: 'b' },
      { type: 'add', text: 'x' },
      { type: 'same', text: 'c' },
      { type: 'add', text: 'd' }
    ])
  })

  it('identical input yields all same', () => {
    expect(lineDiff('x\ny', 'x\ny').every((r) => r.type === 'same')).toBe(true)
  })
})
