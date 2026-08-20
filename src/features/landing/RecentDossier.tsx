import { Link } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { eraLabel, verdictMeta } from '../../content/schema.ts'

/** 最新归档：最近更新的卷宗抽屉卡（hover 抽出） */
export default function RecentDossier() {
  const entries = useArchive((s) => s.merged.entries)
  const recent = [...entries]
    .sort((a, b) => (a.meta.updated < b.meta.updated ? 1 : -1))
    .slice(0, 6)

  if (recent.length === 0) return null

  return (
    <section aria-label="最新归档" className="py-10 px-4">
      <h2 className="mx-auto max-w-5xl font-serifzh font-bold text-2xl mb-6 tracking-widest border-l-4 border-seal pl-3">
        最新归档
      </h2>
      <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recent.map((e) => {
          const v = verdictMeta(e.meta.verdict)
          return (
            <Link
              key={e.id}
              to={`/entry/${e.id}`}
              className="group block border border-gold/50 p-4 anim-drawer hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: 'var(--c-paper)' }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-inksoft">{eraLabel(e.meta.era)}</span>
                <span
                  className="text-xs px-2 py-0.5 border"
                  style={{ color: v?.color, borderColor: v?.color }}
                >
                  {v?.label}
                </span>
              </div>
              <h3 className="font-serifzh font-bold text-lg leading-snug group-hover:text-seal">
                {e.meta.title}
              </h3>
              <p className="mt-2 text-sm text-inksoft line-clamp-2 font-kai">{e.meta.rumor}</p>
              <div className="mt-3 text-xs text-inksoft">
                归档 {e.meta.updated} · r{e.meta.revision}
                {e.source === 'imported' && (
                  <span className="ml-2 px-1 border border-gold text-gold">本地修订</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
