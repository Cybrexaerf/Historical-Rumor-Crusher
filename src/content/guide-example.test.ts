import { describe, expect, it } from 'vitest'
import { parseEntry } from './parse-entry'

/** 与 docs/ai-authoring-guide.md 第八节示例逐字一致，验证文档模板合法 */
const GUIDE_EXAMPLE = `---
id: yangguifei-dongdu
title: 杨贵妃没死，东渡去了日本？
rumor: |
  马嵬驿之变中杨贵妃并未被缢死，而是被掉包放走，经海路东渡日本，
  终老于彼，日本山口县至今有杨贵妃墓。
verdict: refuted
era: suitang
category: figures
tags: [杨贵妃, 马嵬驿, 唐代宫廷]
origin: 讹传
evidence: medium
updated: 2026-08-20
revision: 1
references:
  - id: ref1
    type: ancient
    text: "（后晋）刘昫等. 旧唐书·卷五十一·后妃传. 北京: 中华书局, 1975."
  - id: ref2
    type: modern
    text: "陈寅恪. 元白诗笺证稿[M]. 北京: 生活·读书·新知三联书店, 2001: 21-37."
---

## 谣言溯源

「贵妃东渡」的源头是白居易《长恨歌》「不见玉颜空死处」的文学留白，
以及日本中世以来流传的杨贵妃传说。日本山口县久津确有「杨贵妃墓」，
20 世纪日本作家的演义小说将其推向中文世界[^ref2]。

## 流传脉络

《长恨歌》文学想象（唐）→ 日本民间信仰与久津墓（中世）→ 近代日本小说演绎 → 中文网络「掉包东渡」故事定型。

## 史料考证

其一，正史记载明确。《旧唐书·后妃传》载：马嵬之变「上即命力士赐贵妃自尽，
遂缢死于佛室」[^ref1]，且改葬时「肌肤已坏，而香囊仍在」，可见确有尸身。

其二，陈寅恪对《长恨歌》的笺证早已指出：方士海上觅魂纯为文学虚构，
不可当史实读[^ref2]。

其三，久津「贵妃墓」经中日学者考证，实为日本古代杨贵妃信仰的民间附会，
与唐代渡来无涉。

## 真相结论

杨贵妃缢死于马嵬驿有正史直接记载；「东渡日本」是文学想象与民间信仰
层累而成的传说，主流史学界对其死于马嵬无异议。
`

describe('ai-authoring-guide example validity', () => {
  it('the guide example passes the real validator', () => {
    const r = parseEntry(GUIDE_EXAMPLE, 'guide-example.md')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.meta.id).toBe('yangguifei-dongdu')
      expect(r.warnings).toEqual([])
      expect(r.bodyHtml).toContain('footnote-ref')
    }
  })

  it('guide anti-patterns are rejected (spot checks)', () => {
    const bad = (s: string) => parseEntry(s.replace('---', '---'), 'bad.md')
    expect(bad(GUIDE_EXAMPLE.replace('verdict: refuted', 'verdict: 已证伪')).ok).toBe(false)
    expect(bad(GUIDE_EXAMPLE.replace('era: suitang', 'era: 唐朝')).ok).toBe(false)
    expect(bad(GUIDE_EXAMPLE.replace('updated: 2026-08-20', 'updated: 2026/08/20')).ok).toBe(false)
    expect(bad(GUIDE_EXAMPLE.replace('## 真相结论', '## 结案了')).ok).toBe(false)
    expect(bad(GUIDE_EXAMPLE.replace('推向中文世界', '推向[链接](https://example.com)')).ok).toBe(false)
  })
})
