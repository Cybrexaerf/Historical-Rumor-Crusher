import manifestJson from '../generated/data/manifest.json'
import type { EntryMeta, Manifest } from './schema.ts'

export const manifest = manifestJson as unknown as Manifest

export interface EntryFile {
  meta: EntryMeta
  bodyHtml: string
}

const entryLoaders = import.meta.glob('../generated/data/entries/*.json') as Record<
  string,
  () => Promise<{ default: EntryFile }>
>

/** 懒加载内置层卷宗正文（Vite 静态打包，file:// 零请求） */
export async function loadBuiltEntry(id: string): Promise<EntryFile | null> {
  const loader = entryLoaders[`../generated/data/entries/${id}.json`]
  if (!loader) return null
  const mod = await loader()
  return mod.default ?? (mod as unknown as EntryFile)
}

export function builtEntryIds(): string[] {
  return Object.keys(entryLoaders).map((p) => p.split('/').pop()!.replace(/\.json$/, ''))
}
