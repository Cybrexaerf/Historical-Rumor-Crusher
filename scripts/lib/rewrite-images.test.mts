import { describe, expect, it } from 'vitest'
import { extractId, rewriteEntryImages, rewriteImagePaths } from './rewrite-images.mts'

const MD = (body: string) => `---
id: demo-entry
title: t
---

${body}
`

describe('rewriteImagePaths', () => {
  it('rewrites bare relative path', () => {
    expect(rewriteImagePaths('![图](map.png)', 'demo')).toBe(
      '![图](./assets/content/demo/map.png)'
    )
  })

  it('rewrites ./ prefixed path with title', () => {
    expect(rewriteImagePaths('![x](./a.svg "示意")', 'demo')).toBe(
      '![x](./assets/content/demo/a.svg "示意")'
    )
  })

  it('keeps http urls untouched', () => {
    expect(rewriteImagePaths('![x](https://e.com/a.png)', 'demo')).toBe(
      '![x](https://e.com/a.png)'
    )
  })

  it('keeps already-packaged assets paths untouched', () => {
    expect(rewriteImagePaths('![x](assets/content/demo/a.png)', 'demo')).toBe(
      '![x](assets/content/demo/a.png)'
    )
    expect(rewriteImagePaths('![x](/abs/a.png)', 'demo')).toBe('![x](/abs/a.png)')
  })

  it('keeps data urls untouched', () => {
    expect(rewriteImagePaths('![x](data:image/png;base64,AAA)', 'demo')).toBe(
      '![x](data:image/png;base64,AAA)'
    )
  })

  it('ignores plain links (not images)', () => {
    expect(rewriteImagePaths('[文](file.md)', 'demo')).toBe('[文](file.md)')
  })
})

describe('extractId / rewriteEntryImages', () => {
  it('extracts id from front-matter', () => {
    expect(extractId(MD('x'))).toBe('demo-entry')
  })

  it('rewriteEntryImages rewrites with own id', () => {
    expect(rewriteEntryImages(MD('![a](b.png)'))).toContain('./assets/content/demo-entry/b.png')
  })

  it('returns raw unchanged when no front-matter', () => {
    expect(rewriteEntryImages('![a](b.png)')).toBe('![a](b.png)')
  })
})
