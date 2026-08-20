import { useArchive } from '../../content/store.ts'

interface Plaque {
  label: string
  value: number
  hint: string
}

/** 黄铜铭牌统计区 */
export default function StatsPlaques() {
  const stats = useArchive((s) => s.merged.stats)
  const plaques: Plaque[] = [
    { label: '馆藏总数', value: stats.total, hint: '卷宗累计入馆' },
    { label: '已结案', value: (stats.byVerdict.refuted ?? 0) + (stats.byVerdict.partial ?? 0), hint: '已证伪 + 部分属实' },
    { label: '本地增补', value: stats.imported, hint: '导入层生效卷宗' }
  ]
  return (
    <section aria-label="馆藏统计" className="py-8 px-4">
      <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plaques.map((p) => (
          <div
            key={p.label}
            className="border-2 border-gold/70 px-5 py-4 text-center"
            style={{
              backgroundColor: 'var(--c-paper)',
              boxShadow: 'inset 0 0 0 3px var(--c-paper), inset 0 0 0 4px rgba(138,109,47,0.4)'
            }}
          >
            <div className="text-xs tracking-[0.3em] text-inksoft">{p.label}</div>
            <div className="font-serifzh font-black text-4xl my-2" style={{ color: 'var(--c-gold)' }}>
              {p.value}
            </div>
            <div className="text-xs text-inksoft">{p.hint}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
