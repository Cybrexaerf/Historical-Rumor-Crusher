import { useState } from 'react'
import type { EntryMeta } from '../../content/schema.ts'
import type { MergedEntry } from '../../content/merge.ts'
import { lineDiff } from './diff.ts'

interface ConflictDialogProps {
  filename: string
  incoming: EntryMeta
  incomingRaw: string
  existing: MergedEntry
  existingText: string
  onDecision: (decision: 'override' | 'keep') => void
}

/** revision ≤ 本馆版本时的三选裁决：覆盖导入 / 保留本馆 / 查看差异后决定 */
export default function ConflictDialog({
  filename,
  incoming,
  incomingRaw,
  existing,
  existingText,
  onDecision
}: ConflictDialogProps) {
  const [showDiff, setShowDiff] = useState(false)
  const rows = lineDiff(existingText, incomingRaw)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(43,38,32,0.5)' }} role="dialog" aria-modal="true" aria-label="版本冲突裁决">
      <div className="max-w-3xl w-full max-h-[85vh] overflow-y-auto border-2 border-gold p-6" style={{ backgroundColor: 'var(--c-paper)' }}>
        <h2 className="font-serifzh font-bold text-xl mb-2">版本冲突 · 待裁决</h2>
        <p className="text-sm text-inksoft mb-4">
          「{incoming.title}」（{filename}）revision 为 r{incoming.revision}，
          本馆现行版本（{existing.source === 'imported' ? '导入层' : '内置层'}）为 r{existing.meta.revision}。
        </p>
        <table className="w-full text-sm mb-5 border-collapse">
          <thead>
            <tr className="text-inksoft text-xs">
              <th className="border border-gold/30 p-2 text-left">字段</th>
              <th className="border border-gold/30 p-2 text-left">本馆现行</th>
              <th className="border border-gold/30 p-2 text-left">待导入</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['标题', existing.meta.title, incoming.title],
                ['评级', existing.meta.verdict, incoming.verdict],
                ['更新日期', existing.meta.updated, incoming.updated],
                ['revision', `r${existing.meta.revision}`, `r${incoming.revision}`]
              ] as [string, string, string][]
            ).map(([label, a, b]) => (
              <tr key={label}>
                <td className="border border-gold/30 p-2 text-inksoft">{label}</td>
                <td className="border border-gold/30 p-2">{a}</td>
                <td className="border border-gold/30 p-2">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="px-4 py-2 border border-seal text-seal hover:bg-seal/10" onClick={() => onDecision('override')}>
            仍要导入（覆盖现行）
          </button>
          <button type="button" className="px-4 py-2 border border-gold/60 hover:bg-gold/10" onClick={() => onDecision('keep')}>
            保留本馆版本
          </button>
          <button type="button" className="px-4 py-2 border border-gold/60 hover:bg-gold/10" onClick={() => setShowDiff((v) => !v)}>
            {showDiff ? '收起差异' : '查看两版差异'}
          </button>
        </div>

        {showDiff && (
          <div className="mt-4 border border-gold/40 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto" aria-label="两版差异对照">
            {rows.map((r, i) => (
              <div
                key={i}
                className={
                  r.type === 'add'
                    ? 'bg-verdict/10 text-verdict-green px-2'
                    : r.type === 'del'
                      ? 'bg-seal/10 text-seal line-through px-2'
                      : 'px-2 text-inksoft'
                }
              >
                {r.type === 'add' ? '+ ' : r.type === 'del' ? '- ' : '  '}
                {r.text || '\u00a0'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
