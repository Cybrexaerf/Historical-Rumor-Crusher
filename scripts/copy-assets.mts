import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** vite build 之后的收尾：1) 复制内容资产 2) 修正内联 CSS 的字体相对路径 */
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const srcDir = path.join(root, 'content', 'assets')
const outDir = path.join(root, 'dist', 'assets', 'content')
const distHtml = path.join(root, 'dist', 'index.html')

/* 1) 内容资产：content/assets/** → dist/assets/content/** */
let entries: string[] = []
try {
  entries = await readdir(srcDir)
} catch {
  console.log('无内容资产目录（content/assets/），跳过复制。')
}

if (entries.length > 0) {
  await mkdir(path.dirname(outDir), { recursive: true })
  await cp(srcDir, outDir, { recursive: true })
  console.log(`内容资产复制完成：${entries.length} 个条目目录 → dist/assets/content/`)
} else {
  console.log('content/assets/ 为空，跳过复制。')
}

/* 2) 单文件内联后，CSS 字体 url(./xxx.woff2) 相对 index.html 解析，
      但字体实际在 dist/assets/ 下——统一补上 assets/ 前缀 */
let html = await readFile(distHtml, 'utf-8')
const fixed = html.replace(/url\((\.\/)?(noto-serif-sc-[^)]+?\.woff2?)\)/g, 'url(./assets/$2)')
if (fixed !== html) {
  await writeFile(distHtml, fixed, 'utf-8')
  console.log('内联 CSS 字体路径已修正 → ./assets/')
} else {
  console.log('字体路径无需修正。')
}
