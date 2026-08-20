import { useArchive } from '../../content/store.ts'
import { VERDICTS } from '../../content/schema.ts'
import Seal from '../../components/Seal.tsx'

export default function Hero() {
  const stats = useArchive((s) => s.merged.stats)
  const disputed = (stats.byVerdict.disputed ?? 0) + (stats.byVerdict.open ?? 0)

  return (
    <section className="relative overflow-hidden py-16 px-4" style={{ backgroundColor: 'var(--c-paper)' }}>
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <h1
          className="font-serifzh font-black text-5xl md:text-7xl leading-tight tracking-[0.25em] shrink-0"
          style={{ writingMode: 'vertical-rl' }}
          aria-label="史实勘误局"
        >
          史实勘误局
        </h1>
        <div className="flex-1 min-w-0">
          <p className="text-inksoft tracking-widest border-l-2 border-gold pl-4 mb-6">
            收录网络历史谣言 · 逐条拆解 · 卷卷可溯
          </p>
          <p className="text-lg mb-8">
            谣言止于档案。本馆收录网络流传的历史类谣言
            {stats.total} 条，逐条溯源、考证、结案。
          </p>
          <ul className="flex flex-wrap gap-6 text-sm">
            <li>
              收录谣言 <strong className="text-xl">{stats.total}</strong> 条
            </li>
            {VERDICTS.filter((v) => stats.byVerdict[v.key]).map((v) => (
              <li key={v.key} style={{ color: v.color }}>
                {v.label} <strong className="text-xl">{stats.byVerdict[v.key]}</strong> 条
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-inksoft">
            其中存疑待考 {disputed} 条 —— 存疑亦是诚实，疑案不妄断。
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-2">
          <Seal text="证伪" size={110} animated />
          <span className="text-xs text-inksoft tracking-widest">朱印既落 · 铁案如山</span>
        </div>
      </div>
    </section>
  )
}
