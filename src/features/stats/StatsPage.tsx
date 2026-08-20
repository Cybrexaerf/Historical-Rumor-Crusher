import { useArchive } from '../../content/store.ts'
import { manifest } from '../../content/load-manifest.ts'
import { computeAchievements } from './achievements.ts'
import { hasAcceptedCorrections } from '../imports/corrections.ts'
import Seal from '../../components/Seal.tsx'
import { CategoryBars, EraProgress, EvidenceBar, HeatMatrix, OriginWall, ReadingStats, TagCloud } from './StatsWidgets.tsx'

function Plaque({ label, value, hint, big = false }: { label: string; value: string | number; hint: string; big?: boolean }) {
  return (
    <div
      className="border-2 border-gold/70 px-5 py-4 text-center"
      style={{
        backgroundColor: 'var(--c-paper)',
        boxShadow: 'inset 0 0 0 3px var(--c-paper), inset 0 0 0 4px rgba(138,109,47,0.4)'
      }}
    >
      <div className="text-xs tracking-[0.3em] text-inksoft">{label}</div>
      <div className={`font-serifzh font-black my-2 ${big ? 'text-4xl' : 'text-3xl'}`} style={{ color: 'var(--c-gold)' }}>
        {value}
      </div>
      <div className="text-xs text-inksoft">{hint}</div>
    </div>
  )
}

const ORDINALS = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']

function Section({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="font-serifzh font-bold text-xl mb-5 tracking-widest border-l-4 border-seal pl-3 flex items-baseline gap-3">
        {title}
        <span className="text-xs text-inksoft font-normal tracking-[0.4em]">馆志 · {ORDINALS[index - 1] ?? index}</span>
      </h2>
      {children}
    </section>
  )
}

function AchievementWall() {
  const user = useArchive((s) => s.user)
  const merged = useArchive((s) => s.merged)
  const list = computeAchievements({ user, merged, hasAcceptedCorrection: hasAcceptedCorrections() })
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
            className={`flex flex-col items-center gap-2 border p-4 text-center transition-colors ${
              a.earned ? 'border-gold/60' : 'border-gold/20 opacity-50 hover:opacity-75'
            }`}
            style={{ backgroundColor: 'var(--c-paper)' }}
            title={a.earned ? '已获得' : `未获得：${a.desc}`}
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

/** 镇馆之宝：被翻阅最多的卷宗 */
function Treasury() {
  const user = useArchive((s) => s.user)
  const merged = useArchive((s) => s.merged)
  const top = Object.entries(user.views).sort((a, b) => b[1] - a[1])[0]
  if (!top) {
    return (
      <p className="text-sm text-inksoft border border-dashed border-gold/40 p-6 text-center">
        尚无翻阅记录——读得最多的那卷，将成为镇馆之宝。
      </p>
    )
  }
  const entry = merged.byId.get(top[0])
  return (
    <div
      className="border-2 border-gold px-8 py-6 flex items-center gap-6"
      style={{
        backgroundColor: 'var(--c-paper)',
        boxShadow: 'inset 0 0 0 4px var(--c-paper), inset 0 0 0 5px rgba(138,109,47,0.5), 0 2px 12px rgba(43,38,32,0.15)'
      }}
    >
      <Seal text="镇馆" size={72} />
      <div className="min-w-0">
        <div className="text-xs tracking-[0.3em] text-inksoft mb-1">镇馆之宝</div>
        <p className="font-serifzh font-black text-2xl leading-snug truncate">{entry?.meta.title ?? top[0]}</p>
        <p className="text-sm text-inksoft mt-1">
          累计调阅 <strong className="text-ink tabular-nums">{top[1]}</strong> 次 · 档号 {top[0]}
        </p>
      </div>
    </div>
  )
}

/** 修订活跃度行 */
function RevisionActivity() {
  const entries = useArchive((s) => s.merged.entries)
  const totalRevs = entries.reduce((acc, e) => acc + e.meta.revision, 0)
  const cutoff = Date.now() - 30 * 86400000
  const recent30 = entries.filter((e) => new Date(e.meta.updated).getTime() >= cutoff).length
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-2 text-sm">
      <span>
        累计修订 <strong className="font-serifzh font-black text-xl">{totalRevs}</strong> 版
      </span>
      <span>
        近 30 日归档更新 <strong className="font-serifzh font-black text-xl">{recent30}</strong> 卷
      </span>
    </div>
  )
}

export default function StatsPage() {
  const user = useArchive((s) => s.user)
  const stats = useArchive((s) => s.merged.stats)
  const manifestWordCount = manifest.stats.wordCount ?? 0
  const manifestRefCount = manifest.stats.refCount ?? 0
  const totalViews = Object.values(user.views).reduce((a, b) => a + b, 0)
  const days = user.openedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.openedAt).getTime()) / 86400000))
    : 0
  const openedLabel = user.openedAt ? user.openedAt.slice(0, 10) : '——'

  const updatedList = useArchive((s) => s.merged.entries.map((e) => e.meta.updated).sort())
  const firstArchived = updatedList[0] ?? '——'
  const lastArchived = updatedList[updatedList.length - 1] ?? '——'

  return (
    <div className="space-y-14">
      <div>
        <h1 className="font-serifzh font-bold text-2xl mb-2 tracking-widest border-l-4 border-seal pl-3">
          馆志年报
        </h1>
        <p className="text-sm text-inksoft">本页数据仅记录于本机浏览器，供馆主自省与纪念。</p>
      </div>

      <Section index={1} title="建馆纪念">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Plaque label="本馆建于" value={openedLabel} hint="首次打开应用之日" />
          <Plaque label="开馆天数" value={days} hint="档案与您相伴的日子" />
          <Plaque label="馆藏总数" value={stats.total} hint="在馆卷宗累计" />
        </div>
      </Section>

      <Section index={2} title="馆藏规模">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Plaque label="馆藏总字数" value={manifestWordCount.toLocaleString('zh-Hans')} hint="全部卷宗考证正文字数" />
          <Plaque label="参考文献" value={manifestRefCount} hint="卷内备考累计条目" />
          <Plaque label="累计调阅" value={totalViews} hint="您翻开卷宗的总次数" />
        </div>
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-inksoft">最早归档</span>
            <strong className="font-serifzh text-lg">{firstArchived}</strong>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-inksoft">最新归档</span>
            <strong className="font-serifzh text-lg">{lastArchived}</strong>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gold/25">
          <RevisionActivity />
        </div>
      </Section>

      <Section index={3} title="馆藏分布 · 时代 × 评级">
        <HeatMatrix />
      </Section>

      <Section index={4} title="分类分布">
        <CategoryBars />
      </Section>

      <Section index={5} title="谣言来源 · 印章墙">
        <OriginWall />
      </Section>

      <Section index={6} title="证据强度分布">
        <EvidenceBar />
      </Section>

      <Section index={7} title="标签词云">
        <TagCloud />
      </Section>

      <Section index={8} title="阅读统计">
        <ReadingStats />
        <div className="mt-8 pt-6 border-t border-gold/25">
          <h3 className="text-xs tracking-[0.3em] text-inksoft mb-3">各时代通读进度</h3>
          <EraProgress />
        </div>
      </Section>

      <Section index={9} title="镇馆之宝">
        <Treasury />
      </Section>

      <Section index={10} title="馆员成就 · 徽章墙">
        <AchievementWall />
      </Section>
    </div>
  )
}
