import { create } from 'zustand'
import { loadBuiltEntry, manifest, type EntryFile } from './load-manifest.ts'
import { deleteImport, getAllImports, putImport, type ImportRecord } from './import-db.ts'
import { mergeEntries, type MergedIndex } from './merge.ts'
import { loadUserData, saveUserData, type UserData } from './user-data.ts'
import type { EntryMeta } from './schema.ts'

export interface ImportOutcome {
  ok: boolean
  message: string
  kind?: 'added' | 'override' | 'equal' | 'stale' | 'invalid'
}

interface ArchiveState {
  ready: boolean
  merged: MergedIndex
  imports: ImportRecord[]
  user: UserData
  /** 正文缓存（懒加载后填充） */
  bodies: Record<string, string>

  init: () => Promise<void>
  loadEntry: (id: string) => Promise<EntryFile | null>
  setBody: (id: string, html: string) => void
  importRawMd: (id: string, meta: EntryMeta, bodyHtml: string, rawMd: string) => Promise<ImportOutcome>
  removeImport: (id: string) => Promise<void>
  toggleBookmark: (id: string) => void
  markRead: (id: string) => void
  pushRecent: (id: string) => void
  incrementViews: (id: string) => void
  setFontSize: (size: UserData['fontSize']) => void
}

const EMPTY_INDEX: MergedIndex = {
  entries: [],
  byId: new Map(),
  stats: { total: 0, imported: 0, conflicts: 0, byVerdict: {}, byEra: {}, byCategory: {} }
}

function reindex(imports: ImportRecord[]): MergedIndex {
  return mergeEntries(manifest.entries, imports.map((im) => im.meta))
}

export const useArchive = create<ArchiveState>((set, get) => ({
  ready: false,
  merged: EMPTY_INDEX,
  imports: [],
  user: { bookmarks: [], read: [], recent: [], fontSize: 'normal', views: {}, openedAt: null },
  bodies: {},

  async init() {
    const imports = await getAllImports()
    let user = loadUserData()
    if (!user.openedAt) {
      user = { ...user, openedAt: new Date().toISOString() }
      saveUserData(user)
    }
    applyFontSize(user.fontSize)
    set({ imports, user, merged: reindex(imports), ready: true })
  },

  async loadEntry(id) {
    const entry = get().merged.byId.get(id)
    if (entry?.source === 'imported') {
      const rec = get().imports.find((im) => im.meta.id === id)
      if (rec) return { meta: rec.meta, bodyHtml: rec.bodyHtml }
    }
    return loadBuiltEntry(id)
  },

  setBody(id, html) {
    set({ bodies: { ...get().bodies, [id]: html } })
  },

  async importRawMd(id, meta, bodyHtml, rawMd) {
    const existing = get().merged.byId.get(id)
    const record: ImportRecord = { meta, bodyHtml, rawMd, importedAt: new Date().toISOString() }
    let outcome: ImportOutcome
    if (!existing) {
      outcome = { ok: true, kind: 'added', message: `新卷宗「${meta.title}」已入馆藏` }
    } else if (meta.revision > existing.meta.revision) {
      outcome = { ok: true, kind: 'override', message: `「${meta.title}」已用修订版（r${meta.revision}）覆盖` }
    } else if (meta.revision === existing.meta.revision) {
      outcome = { ok: true, kind: 'equal', message: `「${meta.title}」与本馆版本同为 r${meta.revision}，已导入待裁决` }
    } else {
      outcome = { ok: true, kind: 'stale', message: `「${meta.title}」revision 低于本馆版本，已导入但未生效（可回退）` }
    }
    await putImport(record)
    const imports = await getAllImports()
    set({ imports, merged: reindex(imports) })
    return outcome
  },

  async removeImport(id) {
    await deleteImport(id)
    const imports = await getAllImports()
    set({ imports, merged: reindex(imports) })
  },

  toggleBookmark(id) {
    const { user } = get()
    const bookmarks = user.bookmarks.includes(id)
      ? user.bookmarks.filter((b) => b !== id)
      : [...user.bookmarks, id]
    const next = { ...user, bookmarks }
    saveUserData(next)
    set({ user: next })
  },

  markRead(id) {
    const { user } = get()
    if (user.read.includes(id)) return
    const next = { ...user, read: [...user.read, id] }
    saveUserData(next)
    set({ user: next })
  },

  pushRecent(id) {
    const { user } = get()
    const recent = [id, ...user.recent.filter((r) => r !== id)].slice(0, 20)
    const next = { ...user, recent }
    saveUserData(next)
    set({ user: next })
  },

  incrementViews(id) {
    const { user } = get()
    const views = { ...user.views, [id]: (user.views[id] ?? 0) + 1 }
    const next = { ...user, views }
    saveUserData(next)
    set({ user: next })
  },

  setFontSize(size) {
    const next = { ...get().user, fontSize: size }
    saveUserData(next)
    applyFontSize(size)
    set({ user: next })
  }
}))

function applyFontSize(size: UserData['fontSize']): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.fontsize = size
}
