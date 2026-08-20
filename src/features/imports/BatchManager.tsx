import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { manifest as manifestAll } from '../../content/load-manifest.ts'
import { eraLabel } from '../../content/schema.ts'
import { downloadText } from '../../content/md-runtime.ts'

interface Row {
  id: string
  title: string
  era: string
  source: 'built' | 'imported'
  retired: boolean
}

/** 馆务室：全馆卷宗批量管理（下架/恢复/移除导入/导出） */
export default function BatchManager() {
  const user = useArchive((s) => s.user)
  const manifest = useArchive((s) => s.merged)
  const imports = useArchive((s) => s.imports)
  const retireEntries = useArchive((s) => s.retireEntries)
  const restoreEntries = useArchive((s) => s.restoreEntries)
  const removeImport = useArchive((s) => s.removeImport)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'built' | 'imported' | 'retired'>('all')

  /** 全馆清单 = 全部内置 + 全部导入（含已下架），生效信息取自合并索引 */
  const rows = useMemo<Row[]>(() => {
    const retiredSet = new Set(user.retired)
    const metaById = new Map<string, { title: string; era: string }>()
    for (const m of manifestAll.entries) metaById.set(m.id, { title: m.title, era: m.era })
    for (const im of imports) {
      const cur = metaById.get(im.meta.id)
      const effective = manifest.byId.get(im.meta.id)
      // 导入版未生效（被内置更高版压制）时显示内置标题
      if (!effective || effective.source === 'imported') {
        metaById.set(im.meta.id, { title: im.meta.title, era: im.meta.era })
      } else if (!cur) {
        metaById.set(im.meta.id, { title: im.meta.title, era: im.meta.era })
      }
    }
    return [...metaById.entries()].map(([id, meta]) => {
      const effective = manifest.byId.get(id)
      return {
        id,
        title: effective?.meta.title ?? meta.title,
        era: effective?.meta.era ?? meta.era,
        source: effective?.source ?? (imports.some((im) => im.meta.id === id) ? 'imported' : 'built'),
        retired: retiredSet.has(id)
      }
    })
  }, [manifest, manifestAll, imports, user.retired])

  const shown = useMemo(
    () =>
      rows.filter((r) =>
        filter === 'all' ? true : filter === 'retired' ? r.retired : filter === 'built' ? r.source === 'built' && !r.retired : r.source === 'imported' && !r.retired
      ),
    [rows, filter]
  )

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const selectedIds = [...selected]
  const selectedImports = selectedIds.filter((id) => rows.find((r) => r.id === id && r.source === 'imported'))

  const exportSelected = () => {
    for (const id of selectedImports) {
      const rec = imports.find((im) => im.meta.id === id)
      if (rec) downloadText(`${id}.md`, rec.rawMd)
    }
  }

  return (
    <section className="mt-12" aria-label="馆务室">
      <h2 className="font-serifzh font-bold text-lg mb-1">馆务室 · 全馆卷宗管理</h2>
      <p className="text-xs text-inksoft mb-4">
        内置卷宗随应用打包、无法物理删除——「下架」即从全馆隐藏（目录/检索/长卷/馆志同步生效），可随时恢复上架。
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        {(
          [
            ['all', `全部 ${rows.length}`],
            ['built', `在架·内置 ${rows.filter((r) => r.source === 'built' && !r.retired).length}`],
            ['imported', `在架·本地 ${rows.filter((r) => r.source === 'imported' && !r.retired).length}`],
            ['retired', `已下架 ${rows.filter((r) => r.retired).length}`]
          ] as [typeof filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            className={`px-2 py-0.5 border ${
              filter === key ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
            }`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-inksoft">已选 {selectedIds.length} 卷</span>
      </div>

      <div className="border border-gold/40" style={{ backgroundColor: 'var(--c-paper)' }}>
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-gold/30 text-sm">
          <button
            type="button"
            className="px-2 py-0.5 border border-gold/50 hover:bg-gold/10 disabled:opacity-40"
            disabled={selectedIds.length === 0}
            onClick={() => {
              if (window.confirm(`确定下架选中的 ${selectedIds.length} 卷？下架后全馆隐藏，可随时恢复。`)) {
                retireEntries(selectedIds)
                setSelected(new Set())
              }
            }}
          >
            下架选中
          </button>
          <button
            type="button"
            className="px-2 py-0.5 border border-verdict-green/60 text-verdict-green hover:bg-verdict-green/10 disabled:opacity-40"
            disabled={selectedIds.length === 0}
            onClick={() => {
              restoreEntries(selectedIds)
              setSelected(new Set())
            }}
          >
            恢复上架
          </button>
          <button
            type="button"
            className="px-2 py-0.5 border border-seal/60 text-seal hover:bg-seal/10 disabled:opacity-40"
            disabled={selectedImports.length === 0}
            onClick={() => {
              if (window.confirm(`确定移除选中的 ${selectedImports.length} 卷本地导入？（内置版本不受影响）`)) {
                for (const id of selectedImports) void removeImport(id)
                setSelected(new Set())
              }
            }}
          >
            移除本地导入（{selectedImports.length}）
          </button>
          <button
            type="button"
            className="px-2 py-0.5 border border-gold/50 hover:bg-gold/10 disabled:opacity-40"
            disabled={selectedImports.length === 0}
            onClick={exportSelected}
          >
            导出本地导入为 md
          </button>
        </div>

        <ul className="max-h-96 overflow-y-auto">
          {shown.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-3 py-2 border-b border-gold/15 text-sm">
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                aria-label={`选择 ${r.title}`}
                className="accent-[var(--c-seal)] w-4 h-4 shrink-0"
              />
              <span className="text-xs text-inksoft w-16 shrink-0">{eraLabel(r.era)}</span>
              <Link to={r.retired ? '#/imports' : `/entry/${r.id}`} className="flex-1 min-w-0 truncate hover:text-seal">
                {r.title}
              </Link>
              <span className={`text-xs px-1.5 py-0.5 border shrink-0 ${r.retired ? 'border-seal text-seal' : r.source === 'imported' ? 'border-gold text-gold' : 'border-gold/30 text-inksoft'}`}>
                {r.retired ? '已下架' : r.source === 'imported' ? '本地' : '内置'}
              </span>
              <span className="text-xs text-inksoft w-40 shrink-0 truncate hidden sm:block" title={r.id}>
                {r.id}
              </span>
            </li>
          ))}
          {shown.length === 0 && <li className="px-3 py-6 text-center text-inksoft text-sm">此分类下暂无卷宗。</li>}
        </ul>
      </div>
    </section>
  )
}
