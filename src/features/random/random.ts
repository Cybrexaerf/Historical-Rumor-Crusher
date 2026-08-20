import type { MergedEntry } from '../../content/merge.ts'

/** 随机抽取一份卷宗（冷启动探索） */
export function pickRandom(entries: MergedEntry[]): MergedEntry | null {
  if (entries.length === 0) return null
  return entries[Math.floor(Math.random() * entries.length)]
}
