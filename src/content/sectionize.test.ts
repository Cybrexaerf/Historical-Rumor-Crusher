import { describe, expect, it } from 'vitest'
import { sectionize } from './sectionize'

const HTML = `<h2>谣言溯源</h2><p>来源。[^ref1]</p><h2>流传脉络</h2><p>脉络。</p><h2>史料考证</h2><p>考证。[^ref2]</p><h2>真相结论</h2><p>结论。</p><hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list"><li id="fn1" class="footnote-item"><p>陈康祺. 郎潜纪闻[M].</p></li><li id="fn2" class="footnote-item"><p>孟森. 明清史论著集刊[M].</p></li></ol></section>`

describe('sectionize', () => {
  it('splits into four semantic sections', () => {
    const r = sectionize(HTML)
    expect(r.sections.map((s) => s.key)).toEqual(['rumor-origin', 'spread', 'evidence', 'verdict'])
  })

  it('extracts footnotes with numbers and content', () => {
    const r = sectionize(HTML)
    expect(r.footnotes).toHaveLength(2)
    expect(r.footnotes[0]).toEqual({ n: 1, html: '<p>陈康祺. 郎潜纪闻[M].</p>' })
  })

  it('removes footnote block from sections', () => {
    const r = sectionize(HTML)
    expect(r.sections.every((s) => !s.html.includes('footnotes-sep'))).toBe(true)
  })

  it('handles html without footnotes or h2', () => {
    expect(sectionize('<p>仅一段。</p>').sections).toEqual([])
    const r = sectionize('<h2>真相结论</h2><p>结论。</p>')
    expect(r.sections[0].key).toBe('verdict')
    expect(r.footnotes).toEqual([])
  })
})
