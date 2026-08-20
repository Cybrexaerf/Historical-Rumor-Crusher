import { splitFrontmatter } from '../../src/content/parse-entry.ts'
import { load as yamlLoad } from 'js-yaml'

const IMG_RE = /(!\[[^\]]*\]\()([^)\s]+)(\s*(?:"[^"]*")?\))/g

function isRewritable(p: string): boolean {
  if (/^(https?:|data:|\/\/)/i.test(p)) return false
  if (p.startsWith('assets/') || p.startsWith('./assets/') || p.startsWith('/')) return false
  return true
}

/**
 * 把 md 中的相对图片路径重写为打包路径 `./assets/content/<id>/<file>`。
 * 图片资产约定存放于 content/assets/<id>/ 下。
 */
export function rewriteImagePaths(raw: string, id: string): string {
  return raw.replace(IMG_RE, (full, prefix: string, path: string, suffix: string) => {
    if (!isRewritable(path)) return full
    const clean = path.replace(/^\.\//, '')
    return `${prefix}./assets/content/${id}/${clean}${suffix}`
  })
}

/** 从 md 提取 id（front-matter），供重写使用 */
export function extractId(raw: string): string | null {
  const fm = splitFrontmatter(raw)
  if (!fm) return null
  try {
    const data = yamlLoad(fm.data) as { id?: unknown }
    return typeof data.id === 'string' ? data.id : null
  } catch {
    return null
  }
}

/** 安全重写：id 提取失败时原样返回 */
export function rewriteEntryImages(raw: string): string {
  const id = extractId(raw)
  return id ? rewriteImagePaths(raw, id) : raw
}
