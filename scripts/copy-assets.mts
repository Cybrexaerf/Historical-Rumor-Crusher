import { cp, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** vite build 之后：content/assets/** → dist/assets/content/**（相对路径图片资产） */
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const srcDir = path.join(root, 'content', 'assets')
const outDir = path.join(root, 'dist', 'assets', 'content')

let entries: string[] = []
try {
  entries = await readdir(srcDir)
} catch {
  console.log('无内容资产目录（content/assets/），跳过复制。')
  process.exit(0)
}

if (entries.length > 0) {
  await mkdir(path.dirname(outDir), { recursive: true })
  await cp(srcDir, outDir, { recursive: true })
  console.log(`内容资产复制完成：${entries.length} 个条目目录 → dist/assets/content/`)
} else {
  console.log('content/assets/ 为空，跳过复制。')
}
