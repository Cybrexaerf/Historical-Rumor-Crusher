import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 扫描 dist/ 中文本资源的外链引用，违反离线铁律则非零退出 */
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const distDir = path.join(root, 'dist')
const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.webmanifest', '.xml'])
const WHITELIST = ['www.w3.org', 'www.w3school.com.cn', 'ns.adobe.com', 'schemas.android.com']

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (TEXT_EXT.has(path.extname(e.name).toLowerCase())) out.push(p)
  }
  return out
}

if (!(await stat(distDir)).isDirectory()) {
  console.error('dist/ 不存在，请先执行 vite build。')
  process.exit(1)
}

const files = await walk(distDir)
const violations: string[] = []
for (const file of files) {
  const text = await readFile(file, 'utf-8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, idx) => {
    const matches = line.matchAll(/https?:\/\/([^/\s"'<>)]+)/g)
    for (const m of matches) {
      const host = m[1]
      if (!WHITELIST.some((w) => host === w || host.endsWith(`.${w}`))) {
        violations.push(`${path.relative(root, file)}:${idx + 1} → ${m[0]}`)
      }
    }
  })
}

if (violations.length > 0) {
  console.error(`离线检查失败：发现 ${violations.length} 处外链引用 ——`)
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
}
console.log(`离线检查通过：扫描 ${files.length} 个文件，无外链引用。`)
