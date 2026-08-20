import type { EntryMeta } from '../../content/schema.ts'
import {
  categoryLabel,
  eraLabel,
  evidenceLabel,
  verdictMeta
} from '../../content/schema.ts'
import type { Section } from '../../content/sectionize.ts'
import VerdictStamp from '../../components/VerdictStamp.tsx'
import type { MergedEntry } from '../../content/merge.ts'

interface DossierSidebarProps {
  entry: MergedEntry
  sections: Section[]
  onFontSize: (size: 'small' | 'normal' | 'large') => void
  fontSize: string
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 text-sm">
      <span className="text-inksoft text-xs mr-2">{label}</span>
      {children}
    </div>
  )
}

/** 卷宗封皮侧栏：档号、元数据、目录、字号调节 */
export default function DossierSidebar({ entry, sections, onFontSize, fontSize }: DossierSidebarProps) {
  const m: EntryMeta = entry.meta
  const v = verdictMeta(m.verdict)

  return (
    <aside
      className="border border-gold/50 p-5 lg:sticky lg:top-20"
      style={{ backgroundColor: 'var(--c-paper-deep)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs tracking-[0.25em] text-inksoft">卷宗封皮</span>
        <VerdictStamp verdict={m.verdict} size={44} />
      </div>

      <Meta label="档号">{m.id}</Meta>
      <Meta label="时代">{eraLabel(m.era)}</Meta>
      <Meta label="分类">{categoryLabel(m.category)}</Meta>
      <Meta label="证据强度">{evidenceLabel(m.evidence)}</Meta>
      <Meta label="谣言来源">{m.origin}</Meta>
      <Meta label="归档">
        {m.updated} · r{m.revision}
      </Meta>
      {entry.source === 'imported' && (
        <p className="mb-2 text-xs">
          <span className="border border-gold text-gold px-1.5 py-0.5">本地修订版</span>
        </p>
      )}
      {entry.conflictEqualRevision && (
        <p className="mb-2 text-xs text-seal">注意：本卷存在同版本号导入，待人工裁决（见导入管理）。</p>
      )}

      <div className="mb-4">
        <span className="text-inksoft text-xs mr-2">标签</span>
        <ul className="inline-flex flex-wrap gap-1">
          {m.tags.map((t) => (
            <li key={t} className="text-xs border border-gold/40 px-1.5 py-0.5">
              {t}
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="正文目录" className="border-t border-gold/30 pt-3 mb-4">
        <h3 className="text-xs tracking-[0.25em] text-inksoft mb-2">目录</h3>
        <ul className="space-y-1 text-sm">
          {sections.map((s) => (
            <li key={s.key + s.title}>
              <a href={`#/entry/${m.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-seal underline-offset-4 decoration-gold/50 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`#/entry/${m.id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById('references')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="hover:text-seal underline-offset-4 decoration-gold/50 hover:underline"
            >
              参考文献
            </a>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gold/30 pt-3">
        <h3 className="text-xs tracking-[0.25em] text-inksoft mb-2">字号</h3>
        <div className="flex gap-1">
          {(['small', 'normal', 'large'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={fontSize === s}
              className={`px-2 py-0.5 text-sm border ${
                fontSize === s ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
              }`}
              onClick={() => onFontSize(s)}
            >
              {s === 'small' ? '小' : s === 'normal' ? '中' : '大'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold/30 text-xs text-inksoft leading-relaxed">
        评级说明：
        <span style={{ color: v?.color }}>{v?.label}</span>
        ——结论以史料为唯一依据，正文逐条可溯。
      </div>
    </aside>
  )
}
