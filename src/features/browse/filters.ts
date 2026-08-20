import type { MergedEntry } from '../../content/merge.ts'
import { ERA_KEYS } from '../../content/schema.ts'

export interface BrowseFilters {
  eras: string[]
  categories: string[]
  verdicts: string[]
  origins: string[]
  tags: string[]
  readState: 'all' | 'unread' | 'read'
}

export type SortKey = 'era' | 'updated' | 'title'

export const EMPTY_FILTERS: BrowseFilters = {
  eras: [],
  categories: [],
  verdicts: [],
  origins: [],
  tags: [],
  readState: 'all'
}

const intersects = (a: string[], b: string[]): boolean => a.length === 0 || a.some((x) => b.includes(x))

export function applyFilters(
  entries: MergedEntry[],
  filters: BrowseFilters,
  sort: SortKey,
  read: string[]
): MergedEntry[] {
  const readSet = new Set(read)
  const out = entries.filter((e) => {
    const m = e.meta
    if (!intersects(filters.eras, [m.era])) return false
    if (!intersects(filters.categories, [m.category])) return false
    if (!intersects(filters.verdicts, [m.verdict])) return false
    if (!intersects(filters.origins, [m.origin])) return false
    if (filters.tags.length > 0 && !m.tags.some((t) => filters.tags.includes(t))) return false
    if (filters.readState === 'read' && !readSet.has(e.id)) return false
    if (filters.readState === 'unread' && readSet.has(e.id)) return false
    return true
  })

  const eraOrder = (key: string): number => ERA_KEYS.indexOf(key as (typeof ERA_KEYS)[number])
  out.sort((a, b) => {
    if (sort === 'era') {
      const d = eraOrder(a.meta.era) - eraOrder(b.meta.era)
      if (d !== 0) return d
      return a.meta.id.localeCompare(b.meta.id)
    }
    if (sort === 'updated') return a.meta.updated < b.meta.updated ? 1 : -1
    return a.meta.title.localeCompare(b.meta.title, 'zh')
  })
  return out
}

/** 全部标签（按频次降序） */
export function collectTags(entries: MergedEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const e of entries) {
    for (const t of e.meta.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/** URL 持久化：#/browse?era=qing,ming&cat=royal&v=refuted&o=讹传&t=乾隆,身世&rs=unread&sort=updated */
export function serializeFilters(filters: BrowseFilters, sort: SortKey): string {
  const p = new URLSearchParams()
  if (filters.eras.length) p.set('era', filters.eras.join(','))
  if (filters.categories.length) p.set('cat', filters.categories.join(','))
  if (filters.verdicts.length) p.set('v', filters.verdicts.join(','))
  if (filters.origins.length) p.set('o', filters.origins.join(','))
  if (filters.tags.length) p.set('t', filters.tags.join(','))
  if (filters.readState !== 'all') p.set('rs', filters.readState)
  if (sort !== 'era') p.set('sort', sort)
  return p.toString()
}

export function deserializeFilters(query: string): { filters: BrowseFilters; sort: SortKey } {
  const p = new URLSearchParams(query)
  const list = (k: string): string[] => {
    const v = p.get(k)
    return v ? v.split(',').filter(Boolean) : []
  }
  const rs = p.get('rs')
  const sort = p.get('sort')
  return {
    filters: {
      eras: list('era'),
      categories: list('cat'),
      verdicts: list('v'),
      origins: list('o'),
      tags: list('t'),
      readState: rs === 'read' || rs === 'unread' ? rs : 'all'
    },
    sort: sort === 'updated' || sort === 'title' ? sort : 'era'
  }
}
