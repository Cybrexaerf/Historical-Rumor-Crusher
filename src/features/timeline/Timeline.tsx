import { Link } from 'react-router-dom'
import { ERAS, verdictMeta } from '../../content/schema.ts'
import { useArchive } from '../../content/store.ts'

/** 时代长卷：横向展开的时间轴，谣言卷宗钉在轴上 */
export default function Timeline() {
  const entries = useArchive((s) => s.merged.entries)

  return (
    <div>
      <h1 className="font-serifzh font-bold text-2xl mb-2 tracking-widest border-l-4 border-seal pl-3">
        时代长卷
      </h1>
      <p className="text-sm text-inksoft mb-6">沿轴纵览八代谣言——滚动鼠标滚轮可横向推移长卷。</p>
      <div
        className="overflow-x-auto border-y-2 border-gold/60 py-8"
        style={{ backgroundColor: 'var(--c-paper)' }}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY
            e.preventDefault()
          }
        }}
      >
        <div className="flex items-stretch gap-0 min-w-max px-8" role="list">
          {ERAS.map((era, i) => {
            const items = entries.filter((e) => e.meta.era === era.key)
            return (
              <div key={era.key} className="flex items-stretch" role="group" aria-label={era.label}>
                {i > 0 && <div className="w-px self-stretch border-l border-dashed border-gold/40" />}
                <div className="w-56 shrink-0 px-4">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-serifzh font-black text-xl">{era.label}</span>
                    <span className="text-xs text-inksoft">{items.length} 卷</span>
                  </div>
                  <div className="border-t-2 border-gold/60 pt-3 space-y-2">
                    {items.length === 0 && (
                      <p className="text-xs text-inksoft italic">此代暂无归档卷宗</p>
                    )}
                    {items.map((e) => {
                      const v = verdictMeta(e.meta.verdict)
                      return (
                        <Link
                          key={e.id}
                          to={`/entry/${e.id}`}
                          role="listitem"
                          className="block border border-gold/40 px-2 py-1.5 hover:border-seal hover:bg-seal/5 transition-colors"
                          style={{ backgroundColor: 'var(--c-paper)' }}
                        >
                          <span className="block text-sm font-serifzh font-bold leading-snug">
                            {e.meta.title}
                          </span>
                          <span className="text-xs" style={{ color: v?.color }}>
                            {v?.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
