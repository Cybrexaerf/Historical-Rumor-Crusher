import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { pinyin } from 'pinyin-pro'
import { createNodeSanitizer, parseEntry, splitFrontmatter } from '../src/content/parse-entry.ts'
import { rewriteEntryImages } from './lib/rewrite-images.mts'
import { CATEGORY_KEYS, VERDICT_KEYS } from '../src/content/schema.ts'
import type { EntryMeta, FulltextDoc, Manifest } from '../src/content/schema.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const contentDir = path.join(root, 'content')
const outDir = path.join(root, 'src', 'generated', 'data')
const CHUNK_SIZE = 100

async function collectMdFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await collectMdFiles(p)))
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p)
  }
  return out.sort()
}

function pinyinOf(text: string): { full: string; initials: string } {
  const full = pinyin(text, { toneType: 'none', type: 'array', nonZh: 'consecutive' }).join('')
  const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array', nonZh: 'consecutive' }).join('')
  return { full, initials }
}

const domWin = new JSDOM('').window
const sanitize = createNodeSanitizer(domWin)

const files = await collectMdFiles(contentDir)
if (files.length === 0) {
  console.error('content/ 目录下没有任何 md 文件，中止构建。')
  process.exit(1)
}

const metas: EntryMeta[] = []
const bodies = new Map<string, string>()
let failed = false
for (const file of files) {
  const rel = path.relative(root, file)
  const raw = await readFile(file, 'utf-8')
  if (!splitFrontmatter(raw)) {
    console.error(`  [校验失败] ${rel}: 缺少 front-matter（须以 --- 开始）`)
    failed = true
    continue
  }
  const result = parseEntry(rewriteEntryImages(raw), rel, sanitize)
  if (!result.ok) {
    for (const err of result.errors) console.error(`  [校验失败] ${err}`)
    failed = true
    continue
  }
  if (metas.some((m) => m.id === result.meta.id)) {
    console.error(`  [校验失败] ${rel}: id「${result.meta.id}」与已有条目重复`)
    failed = true
    continue
  }
  for (const w of result.warnings) console.warn(`  [警告] ${rel}: ${w}`)
  metas.push(result.meta)
  bodies.set(result.meta.id, result.bodyHtml)
}
if (failed) {
  console.error('内容校验存在错误，构建中止（绝不带病构建）。')
  process.exit(1)
}

const stats: Record<string, number> = {}
for (const v of VERDICT_KEYS) stats[v] = metas.filter((m) => m.verdict === v).length
for (const c of CATEGORY_KEYS) stats[c] = metas.filter((m) => m.category === c).length

const manifest: Manifest = {
  builtAt: new Date().toISOString(),
  total: metas.length,
  stats,
  entries: metas
}

await rm(outDir, { recursive: true, force: true })
await mkdir(path.join(outDir, 'entries'), { recursive: true })
await mkdir(path.join(outDir, 'chunks'), { recursive: true })

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest), 'utf-8')

const docs: FulltextDoc[] = metas.map((meta) => {
  const pinyinText = pinyinOf(`${meta.title} ${meta.rumor}`)
  return {
    id: meta.id,
    title: meta.title,
    rumor: meta.rumor,
    fulltext: bodies.get(meta.id) ?? '',
    pinyinFull: pinyinText.full,
    pinyinInitials: pinyinText.initials
  }
})

for (let i = 0; i < metas.length; i++) {
  const meta = metas[i]
  await writeFile(
    path.join(outDir, 'entries', `${meta.id}.json`),
    JSON.stringify({ meta, bodyHtml: bodies.get(meta.id) }),
    'utf-8'
  )
}

for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
  const n = String(Math.floor(i / CHUNK_SIZE)).padStart(3, '0')
  await writeFile(path.join(outDir, 'chunks', `fulltext-${n}.json`), JSON.stringify(docs.slice(i, i + CHUNK_SIZE)), 'utf-8')
}

console.log(`内容构建完成：${metas.length} 条卷宗 → ${path.relative(root, outDir)}`)
