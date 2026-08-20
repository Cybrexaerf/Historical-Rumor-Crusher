import MarkdownItPkg from 'markdown-it'
import footnotePkg from 'markdown-it-footnote'

type MdCtor = typeof MarkdownItPkg
const MarkdownIt: MdCtor =
  ((MarkdownItPkg as unknown as { default?: MdCtor }).default ?? MarkdownItPkg) as MdCtor
type FootnotePlugin = NonNullable<Parameters<MdCtor['prototype']['use']>[0]>
const footnote: FootnotePlugin =
  ((footnotePkg as unknown as { default?: FootnotePlugin }).default ?? footnotePkg) as FootnotePlugin

const md = new MarkdownIt({ html: false, linkify: false, typographer: false }).use(footnote)
import { load as yamlLoad } from 'js-yaml'
import DOMPurify from 'dompurify'
import { EntryMetaSchema } from './schema-validate.ts'
import { REQUIRED_SECTIONS, SECTION_LABELS, SECTION_TITLES } from './schema.ts'
import type { EntryMeta } from './schema.ts'

export interface ParseSuccess {
  ok: true
  meta: EntryMeta
  bodyHtml: string
  fulltext: string
  warnings: string[]
}
export interface ParseFailure {
  ok: false
  errors: string[]
}
export type ParseResult = ParseSuccess | ParseFailure

export type Sanitizer = (html: string) => string

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['id', 'class', 'aria-label', 'target', 'rel']
}

/** Node 环境（构建脚本）用：传入 jsdom window 生成 sanitizer */
export function createNodeSanitizer(win: unknown): Sanitizer {
  const purifier = (DOMPurify as unknown as (w: unknown) => { sanitize: (h: string, c?: unknown) => string })(win)
  return (html) => purifier.sanitize(html, SANITIZE_CONFIG)
}

function defaultSanitizer(): Sanitizer | null {
  if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
    return (html) => DOMPurify.sanitize(html, SANITIZE_CONFIG)
  }
  return null
}

export function splitFrontmatter(raw: string): { data: string; body: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return null
  return { data: m[1], body: m[2] }
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 正文引用了 [^id] 但未给定义时，自动用 front-matter 参考文献 补齐脚注定义 */
function appendAutoFootnotes(body: string, meta: EntryMeta): string {
  const defined = new Set([...body.matchAll(/\[\^([\w-]+)\]:/g)].map((m) => m[1]))
  const extras = meta.references
    .filter((r) => !defined.has(r.id))
    .map((r) => `[^${r.id}]: ${r.text}`)
  if (extras.length === 0) return body
  return `${body}\n\n${extras.join('\n\n')}\n`
}

function checkSections(body: string, warnings: string[]): void {
  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim())
  const found = new Set(h2s.filter((t) => SECTION_TITLES[t]).map((t) => SECTION_TITLES[t]))
  for (const key of REQUIRED_SECTIONS) {
    if (!found.has(key)) warnings.push(`缺少必含区块「${SECTION_LABELS[key]}」`)
  }
  const unknown = h2s.filter((t) => !SECTION_TITLES[t])
  if (unknown.length > 0) warnings.push(`未识别的二级标题将被并入上一区块：${unknown.join('、')}`)
}

/**
 * 解析一条卷宗 md（构建期与浏览器运行期共用的同构实现）。
 * Node 环境必须注入 sanitize（createNodeSanitizer(jsdomWindow)）。
 */
export function parseEntry(raw: string, filename = '(未命名)', inject?: Sanitizer): ParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const fm = splitFrontmatter(raw)
  if (!fm) {
    return { ok: false, errors: [`${filename}: 缺少 front-matter（须以 --- 开始）`] }
  }
  let data: unknown
  try {
    data = yamlLoad(fm.data)
  } catch (e) {
    return { ok: false, errors: [`${filename}: front-matter YAML 解析失败 —— ${(e as Error).message}`] }
  }
  const parsed = EntryMetaSchema.safeParse(data)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${filename}: 字段「${issue.path.join('.')}」${issue.message}`)
    }
    return { ok: false, errors }
  }
  const meta = parsed.data

  checkSections(fm.body, warnings)
  if (warnings.some((w) => w.startsWith('缺少必含区块'))) {
    return { ok: false, errors: [...errors, ...warnings.filter((w) => w.startsWith('缺少必含区块'))] }
  }

  const body = appendAutoFootnotes(fm.body, meta)

  const rawHtml = md.render(body)
  const sanitize = inject ?? defaultSanitizer()
  if (!sanitize) {
    return { ok: false, errors: [`${filename}: 当前环境无 window，须注入 sanitize`] }
  }
  const bodyHtml = sanitize(rawHtml)

  if (/https?:\/\//i.test(bodyHtml)) {
    errors.push(`${filename}: 正文包含外链（http/https），违反离线铁律`)
    return { ok: false, errors }
  }

  return { ok: true, meta, bodyHtml, fulltext: stripTags(bodyHtml), warnings }
}
