import { useArchive } from '../../content/store.ts'
import { CATEGORIES, ERAS, VERDICTS, evidenceLabel } from '../../content/schema.ts'
import { collectTags } from '../browse/filters.ts'
import Seal from '../../components/Seal.tsx'

/* ——— 已有组件美化版 ——— */

/** 时代 × 评级热力方阵：去格线、色块为界、表格数字右对齐 */
export function HeatMatrix() {
  const entries = useArchive((s) => s.merged.entries)
  const cell = (era: string, verdict: string): number =>
    entries.filter((e) => e.meta.era === era && e.meta.verdict === verdict).length
  const max = Math.max(1, ...ERAS.flatMap((era) => VERDICTS.map((v) => cell(era.key, v.key))))

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse w-full text-sm" aria-label="时代与评级分布热力方阵">
        <thead>
          <tr>
            <th className="px-2 py-2 text-left text-xs font-normal text-inksoft">时段 ＼ 评级</th>
            {VERDICTS.map((v) => (
              <th key={v.key} className="px-2 py-2 text-xs font-normal">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: v.color }} />
                  <span style={{ color: v.color }}>{v.label}</span>
                </span>
              </th>
            ))}
            <th className="px-2 py-2 text-right text-xs font-normal text-inksoft">合计</th>
          </tr>
        </thead>
        <tbody>
          {ERAS.map((era, i) => {
            const total = entries.filter((e) => e.meta.era === era.key).length
            return (
              <tr key={era.key} className={i < ERAS.length - 1 ? 'border-b border-gold/20' : ''}>
                <th className="px-2 py-2 text-left whitespace-nowrap font-serifzh font-bold">{era.label}</th>
                {VERDICTS.map((v) => {
                  const n = cell(era.key, v.key)
                  const intensity = n === 0 ? 0 : 0.14 + (n / max) * 0.7
                  return (
                    <td key={v.key} className="px-1 py-1">
                      <div
                        className="h-9 flex items-center justify-center tabular-nums"
                        style={{
                          backgroundColor: n === 0 ? 'rgba(138,109,47,0.06)' : `rgba(168, 53, 44, ${intensity})`,
                          color: n === 0 ? 'var(--c-verdict-open)' : intensity > 0.5 ? 'var(--c-text-on-fill)' : 'inherit',
                          fontWeight: n === 0 ? 400 : 700
                        }}
                      >
                        {n === 0 ? '—' : n}
                      </div>
                    </td>
                  )
                })}
                <td className="px-2 py-2 text-right tabular-nums font-serifzh font-black text-base">{total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** 分类黄铜横条：统一宽度标签 + 大号数字 */
export function CategoryBars() {
  const stats = useArchive((s) => s.merged.stats)
  const max = Math.max(1, ...CATEGORIES.map((c) => stats.byCategory[c.key] ?? 0))
  return (
    <ul className="space-y-2.5" aria-label="分类分布">
      {CATEGORIES.map((c) => {
        const n = stats.byCategory[c.key] ?? 0
        return (
          <li key={c.key} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-right text-inksoft">{c.label}</span>
            <span className="flex-1 h-5 relative overflow-hidden" style={{ backgroundColor: 'rgba(138,109,47,0.10)' }}>
              <span
                className="absolute inset-y-0 left-0 rounded-r-sm"
                style={{
                  width: `${(n / max) * 100}%`,
                  background: 'linear-gradient(90deg, rgba(138,109,47,0.30), rgba(138,109,47,0.75))'
                }}
              />
            </span>
            <span className="w-8 text-right tabular-nums font-serifzh font-black text-base">{n}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function OriginWall() {
  const entries = useArchive((s) => s.merged.entries)
  return (
    <ul className="flex flex-wrap gap-5" aria-label="谣言来源分布">
      {ORIGINS_KEYS.map((o) => {
        const n = entries.filter((e) => e.meta.origin === o).length
        return (
          <li key={o} className="flex flex-col items-center gap-1.5">
            <Seal text={o.slice(0, 2)} size={56} color={n > 0 ? 'var(--c-seal)' : 'var(--c-verdict-open)'} />
            <span className="text-xs text-inksoft whitespace-nowrap">
              {o} · <span className="tabular-nums font-bold text-ink">{n}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
const ORIGINS_KEYS = ['文学演绎', '讹传', '伪史', '网络新造', '影视误导'] as const

/* ——— 阅读统计 ——— */

export function ReadingStats() {
  const user = useArchive((s) => s.user)
  const total = useArchive((s) => s.merged.stats.total)
  const merged = useArchive((s) => s.merged)
  const top = Object.entries(user.views)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <p className="text-sm mb-2">
          已读 <strong className="font-serifzh font-black text-3xl align-baseline">{user.read.length}</strong>
          <span className="text-inksoft"> / {total} 卷</span>
        </p>
        <div className="h-4 relative overflow-hidden" style={{ backgroundColor: 'rgba(138,109,47,0.12)' }}>
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${total > 0 ? (user.read.length / total) * 100 : 0}%`,
              backgroundColor: 'var(--c-seal)',
              backgroundRepeat: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,0.08) 6px 12px)'
            }}
            role="progressbar"
            aria-valuenow={user.read.length}
            aria-valuemax={total}
          />
        </div>
        <p className="text-xs text-inksoft mt-2">书签收藏 {user.bookmarks.length} 卷</p>
      </div>
      <div>
        <h3 className="text-xs tracking-[0.3em] text-inksoft mb-2">最常翻阅 TOP5</h3>
        {top.length === 0 ? (
          <p className="text-xs text-inksoft">暂无翻阅记录。</p>
        ) : (
          <ol className="text-sm space-y-1.5">
            {top.map(([id, n], i) => {
              const e = merged.byId.get(id)
              return (
                <li key={id} className="flex justify-between gap-3 border-b border-gold/15 pb-1.5">
                  <span className="truncate">
                    <span className="text-gold font-serifzh font-black mr-1.5">{i + 1}</span>
                    {e?.meta.title ?? id}
                  </span>
                  <span className="text-inksoft tabular-nums shrink-0">{n} 次</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}

/* ——— 新增统计 ——— */

/** 标签词云：字号随频次缩放 */
export function TagCloud() {
  const entries = useArchive((s) => s.merged.entries)
  const tags = collectTags(entries)
  if (tags.length === 0) return <p className="text-sm text-inksoft">暂无标签。</p>
  const max = tags[0].count
  const min = tags[tags.length - 1].count
  return (
    <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2" aria-label="标签词云">
      {tags.slice(0, 40).map(({ tag, count }) => {
        const scale = min === max ? 0.6 : 0.55 + ((count - min) / (max - min)) * 0.85
        return (
          <li
            key={tag}
            className="font-serifzh leading-none"
            style={{ fontSize: `${scale}rem`, color: scale > 1 ? 'var(--c-ink)' : 'var(--c-ink-soft)', fontWeight: scale > 1 ? 900 : 400 }}
            title={`${count} 卷`}
          >
            {tag}
            <span className="text-[0.6em] text-gold/70 ml-0.5 tabular-nums">{count}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** 证据强度三段条 */
export function EvidenceBar() {
  const entries = useArchive((s) => s.merged.entries)
  const counts = (['strong', 'medium', 'weak'] as const).map((k) => ({
    k,
    n: entries.filter((e) => e.meta.evidence === k).length
  }))
  const total = Math.max(1, entries.length)
  const colors: Record<string, string> = {
    strong: 'var(--c-verdict-green)',
    medium: 'var(--c-verdict-partial)',
    weak: 'var(--c-verdict-open)'
  }
  return (
    <div aria-label="证据强度分布">
      <div className="flex h-7 overflow-hidden" style={{ backgroundColor: 'rgba(138,109,47,0.10)' }}>
        {counts.map(({ k, n }) =>
          n > 0 ? (
            <div key={k} style={{ width: `${(n / total) * 100}%`, backgroundColor: colors[k] }} className="flex items-center justify-center">
              <span className="text-xs" style={{ color: 'var(--c-text-on-fill)' }}>
                {n}
              </span>
            </div>
          ) : null
        )}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs">
        {counts.map(({ k, n }) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: colors[k] }} />
            {evidenceLabel(k)} · <span className="tabular-nums font-bold">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 各时代阅读进度（封条样式） */
export function EraProgress() {
  const user = useArchive((s) => s.user)
  const entries = useArchive((s) => s.merged.entries)
  const read = new Set(user.read)
  return (
    <ul className="space-y-2" aria-label="各时代阅读进度">
      {ERAS.map((era) => {
        const items = entries.filter((e) => e.meta.era === era.key)
        const done = items.filter((e) => read.has(e.id)).length
        const pct = items.length > 0 ? (done / items.length) * 100 : 0
        return (
          <li key={era.key} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-right text-inksoft whitespace-nowrap">{era.label}</span>
            <span className="flex-1 h-3.5 relative overflow-hidden" style={{ backgroundColor: 'rgba(138,109,47,0.10)' }}>
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${pct}%`,
                  backgroundColor: 'var(--c-seal)',
                  backgroundRepeat: 'repeating-linear-gradient(45deg, transparent 0 5px, rgba(0,0,0,0.08) 5px 10px)'
                }}
              />
            </span>
            <span className="w-12 text-right tabular-nums text-xs">
              {done}/{items.length}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
