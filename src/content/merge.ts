import type { EntryMeta } from './schema.ts'

export type EntrySource = 'built' | 'imported'

export interface MergedEntry {
  id: string
  meta: EntryMeta
  source: EntrySource
  /** 导入版 revision 与内置版相等：待人工裁决 */
  conflictEqualRevision: boolean
  /** 被内置版取代的导入（revision 较低），供导入管理页展示 */
  supersededRevision?: number
}

export interface MergedIndex {
  entries: MergedEntry[]
  byId: Map<string, MergedEntry>
  stats: {
    total: number
    imported: number
    conflicts: number
    byVerdict: Record<string, number>
    byEra: Record<string, number>
    byCategory: Record<string, number>
  }
}

/**
 * 双层合并（spec §4）：
 * - 导入层 revision 严格更高 → 导入版生效
 * - revision 相等 → 内置版生效 + equal-revision 冲突标记（人工裁决）
 * - revision 更低 → 内置版生效，导入版标记为被取代（仍留存 IndexedDB）
 */
export function mergeEntries(built: EntryMeta[], imported: EntryMeta[]): MergedIndex {
  const byId = new Map<string, MergedEntry>()

  for (const meta of built) {
    byId.set(meta.id, { id: meta.id, meta, source: 'built', conflictEqualRevision: false })
  }

  for (const meta of imported) {
    const existing = byId.get(meta.id)
    if (!existing) {
      byId.set(meta.id, { id: meta.id, meta, source: 'imported', conflictEqualRevision: false })
      continue
    }
    if (meta.revision > existing.meta.revision) {
      byId.set(meta.id, {
        id: meta.id,
        meta,
        source: 'imported',
        conflictEqualRevision: false
      })
    } else if (meta.revision === existing.meta.revision) {
      byId.set(meta.id, { ...existing, conflictEqualRevision: true })
    } else {
      byId.set(meta.id, { ...existing, supersededRevision: meta.revision })
    }
  }

  const entries = [...byId.values()]
  const count = (pick: (e: MergedEntry) => string): Record<string, number> => {
    const acc: Record<string, number> = {}
    for (const e of entries) {
      const k = pick(e)
      acc[k] = (acc[k] ?? 0) + 1
    }
    return acc
  }

  return {
    entries,
    byId,
    stats: {
      total: entries.length,
      imported: entries.filter((e) => e.source === 'imported').length,
      conflicts: entries.filter((e) => e.conflictEqualRevision).length,
      byVerdict: count((e) => e.meta.verdict),
      byEra: count((e) => e.meta.era),
      byCategory: count((e) => e.meta.category)
    }
  }
}
