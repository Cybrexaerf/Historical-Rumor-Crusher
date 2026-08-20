import { describe, expect, it } from 'vitest'
import { parseEntry, splitFrontmatter } from './parse-entry'

const valid = `---
id: test-entry
title: 测试卷宗
rumor: |
  测试谣言陈述。
verdict: refuted
era: qing
category: royal
tags: [测试]
origin: 网络新造
evidence: strong
updated: 2026-08-20
revision: 1
references:
  - id: ref1
    type: modern
    text: "作者. 书名[M]. 北京: 出版社, 2020: 1."
---

## 谣言溯源

来源说明。[^ref1]

## 史料考证

考证内容。

## 真相结论

结论内容。

[^ref1]: 作者. 书名[M]. 北京: 出版社, 2020: 1.
`

describe('splitFrontmatter', () => {
  it('splits yaml and body', () => {
    const r = splitFrontmatter(valid)!
    expect(r.data).toContain('id: test-entry')
    expect(r.body).toContain('## 谣言溯源')
  })
  it('returns null when absent', () => {
    expect(splitFrontmatter('# 没有 front-matter')).toBeNull()
  })
})

describe('parseEntry', () => {
  it('parses a valid entry (jsdom env auto-sanitize)', () => {
    const r = parseEntry(valid, 'test.md')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.meta.id).toBe('test-entry')
      expect(r.bodyHtml).toContain('<h2>谣言溯源</h2>')
      expect(r.bodyHtml).toContain('footnote')
      expect(r.fulltext).toContain('考证内容')
      expect(r.bodyHtml).not.toMatch(/<script/)
    }
  })

  it('fails when required section missing', () => {
    const bad = valid.replace('## 真相结论\n\n结论内容。\n', '')
    const r = parseEntry(bad, 'bad.md')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain('真相结论')
  })

  it('fails on bad verdict', () => {
    const bad = valid.replace('verdict: refuted', 'verdict: nonsense')
    expect(parseEntry(bad, 'bad.md').ok).toBe(false)
  })

  it('rejects external links in body (offline rule)', () => {
    const bad = valid.replace(
      '来源说明。',
      '来源说明 [外链](https://example.com)。'
    )
    const r = parseEntry(bad, 'bad.md')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain('外链')
  })

  it('rejects raw html script injection', () => {
    const bad = valid.replace('来源说明。', '来源说明 <script>alert(1)</script>。')
    const r = parseEntry(bad, 'bad.md')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.bodyHtml).not.toContain('<script')
  })
})
