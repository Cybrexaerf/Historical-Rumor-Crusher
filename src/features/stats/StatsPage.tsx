import { useArchive } from '../../content/store.ts'
import { CATEGORIES, ERAS, ORIGINS, VERDICTS } from '../../content/schema.ts'
import { computeAchievements } from './achievements.ts'
import { hasAcceptedCorrections } from '../imports/corrections.ts'
import Seal from '../../components/Seal.tsx'

function Plaque({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div
      className="border-2 border-gold/70 px-5 py-4 text-center"
      style={{
        backgroundColor: 'var(--c-paper)',
        boxShadow: 'inset 0 0 0 3px var(--c-paper), inset 0 0 0 4px rgba(138,109,47,0.4)'
      }}
    >
      <div className="text-xs tracking-[0.3em] text-inksoft">{label}</div>
      <div className="font-serifzh font-black text-3xl my-2" style={{ color: 'var(--c-gold)' }}>
        {value}
      </div>
      <div className="text-xs text-inksoft">{hint}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serifzh font-bold text-xl mb-4 tracking-widest border-l-4 border-seal pl-3">
      {children}
    </h2>
  )
}

/** 时代 × 评级热力方阵 */
function HeatMatrix() {
  const entries = useArchive((s) => s.merged.entries)
  const cell = (era: string, verdict: string): number =>
    entries.filter((e) => e.meta.era === era && e.meta.verdict === verdict).length
  const max = Math.max(
    1,
    ...ERAS.flatMap((era) => VERDICTS.map((v) => cell(era.key, v.key)))
  )

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse w-full text-sm" aria-label="时代与评级分布热力方阵">
        <thead>
          <tr>
            <th className="border border-gold/40 px-2 py-1 text-left text-inksoft text-xs">时段 ＼ 评级</th>
            {VERDICTS.map((v) => (
              <th key={v.key} className="border border-gold/40 px-2 py-1 text-xs" style={{ color: v.color }}>
                {v.label}
              </th>
            ))}
            <th className="border border-gold/40 px-2 py-1 text-inksoft text-xs">合计</th>
          </tr>
        </thead>
        <tbody>
          {ERAS.map((era) => {
            const total = entries.filter((e) => e.meta.era === era.key).length
            return (
              <tr key={era.key}>
                <th className="border border-gold/40 px-2 py-1 text-left whitespace-nowrap">{era.label}</th>
                {VERDICTS.map((v) => {
                  const n = cell(era.key, v.key)
                  const intensity = n === 0 ? 0 : 0.12 + (n / max) * 0.72
                  return (
                    <td
                      key={v.key}
                      className="border border-gold/40 px-2 py-1 text-center tabular-nums"
                      style={{
                        backgroundColor: n === 0 ? 'transparent' : `rgba(168, 53, 44, ${intensity})`,
                        color: intensity > 0.5 ? 'var(--c-paper)' : 'inherit'
                      }}
                    >
                      {n || '·'}
                    </td>
                  )
                })}
                <td className="border border-gold/40 px-2 py-1 text-center tabular-nums font-bold">{total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CategoryBars() {
  const stats = useArchive((s) => s.merged.stats)
  const max = Math.max(1, ...CATEGORIES.map((c) => stats.byCategory[c.key] ?? 0))
  return (
    <ul className="space-y-2" aria-label="分类分布">
      {CATEGORIES.map((c) => {
        const n = stats.byCategory[c.key] ?? 0
        return (
          <li key={c.key} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-right text-inksoft">{c.label}</span>
            <span className="flex-1 h-5 border border-gold/40 relative" style={{ backgroundColor: 'var(--c-paper)' }}>
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(n / max) * 100}%`,
                  background: 'linear-gradient(90deg, rgba(138,109,47,0.35), rgba(138,109,47,0.7))'
                }}
              />
            </span>
            <span className="w-8 tabular-nums">{n}</span>
          </li>
        )
      })}
    </ul>
  )
}

function OriginWall() {
  const entries = useArchive((s) => s.merged.entries)
  return (
    <ul className="flex flex-wrap gap-4" aria-label="谣言来源分布">
      {ORIGINS.map((o) => {
        const n = entries.filter((e) => e.meta.origin === o).length
        return (
          <li key={o} className="flex flex-col items-center gap-1">
            <Seal text={o.slice(0, 2)} size={54} color={n > 0 ? 'var(--c-seal)' : 'var(--c-verdict-open)'} />
            <span className="text-xs text-inksoft">
              {o} · {n}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ReadingStats() {
  const user = useArchive((s) => s.user)
  const total = useArchive((s) => s.merged.stats.total)
  const merged = useArchive((s) => s.merged)
  const top = Object.entries(user.views)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <p className="text-sm mb-2">
          已读 <strong className="text-xl">{user.read.length}</strong> / {total} 卷
        </p>
        <div className="h-4 border border-gold/50 relative" style={{ backgroundColor: 'var(--c-paper)' }}>
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
        <h3 className="text-sm text-inksoft mb-2">最常翻阅 TOP5</h3>
        {top.length === 0 ? (
          <p className="text-xs text-inksoft">暂无翻阅记录。</p>
        ) : (
          <ol className="text-sm space-y-1">
            {top.map(([id, n], i) => {
              const e = merged.byId.get(id)
              return (
                <li key={id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {i + 1}. {e?.meta.title ?? id}
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

function AchievementWall() {
  const user = useArchive((s) => s.user)
  const merged = useArchive((s) => s.merged)
  const list = computeAchievements({
    user,
    merged,
    hasAcceptedCorrection: hasAcceptedCorrections()
  })
  const earned = list.filter((a) => a.earned).length

  return (
    <div>
      <p className="text-sm text-inksoft mb-4">
        已获 {earned} / {list.length} 枚 —— 印章集齐之日，便是本馆之荣。
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="成就徽章">
        {list.map((a) => (
          <li
            key={a.id}
            className={`flex flex-col items-center gap-2 border p-4 text-center ${
              a.earned ? 'border-gold/60' : 'border-gold/20 opacity-45'
            }`}
            style={{ backgroundColor: 'var(--c-paper)' }}
          >
            <Seal text={a.stamp} size={56} color={a.earned ? 'var(--c-seal)' : 'var(--c-verdict-open)'} />
            <span className="font-serifzh font-bold text-sm">{a.name}</span>
            <span className="text-xs text-inksoft leading-snug">{a.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatsPage() {
  const user = useArchive((s) => s.user)
  const total = useArchive((s) => s.merged.stats.total)
  const days = user.openedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.openedAt).getTime()) / 86400000))
    : 0
  const openedLabel = user.openedAt ? user.openedAt.slice(0, 10) : '——'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serifzh font-bold text-2xl mb-2 tracking-widest border-l-4 border-seal pl-3">
          馆志年报
        </h1>
        <p className="text-sm text-inksoft">本页数据仅记录于本机浏览器，供馆主自省与纪念。</p>
      </div>

      <section aria-label="建馆纪念">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Plaque label="本馆建于" value={openedLabel} hint="首次打开应用之日" />
          <Plaque label="开馆天数" value={days} hint="档案与您相伴的日子" />
          <Plaque label="馆藏总数" value={total} hint="在馆卷宗累计" />
        </div>
      </section>

      <section aria-label="馆藏分布">
        <SectionTitle>馆藏分布 · 时代 × 评级</SectionTitle>
        <HeatMatrix />
      </section>

      <section aria-label="分类分布">
        <SectionTitle>分类分布</SectionTitle>
        <CategoryBars />
      </section>

      <section aria-label="谣言来源">
        <SectionTitle>谣言来源 · 印章墙</SectionTitle>
        <OriginWall />
      </section>

      <section aria-label="阅读统计">
        <SectionTitle>阅读统计</SectionTitle>
        <ReadingStats />
      </section>

      <section aria-label="成就">
        <SectionTitle>馆员成就 · 徽章墙</SectionTitle>
        <AchievementWall />
      </section>
    </div>
  )
}
