import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { parseMdForImport, recordToMarkdown, downloadText } from '../../content/md-runtime.ts'
import DropZone from './DropZone.tsx'
import ConflictDialog from './ConflictDialog.tsx'

interface Report {
  file: string
  ok: boolean
  kind?: 'added' | 'override' | 'equal' | 'stale' | 'invalid' | 'skipped'
  message: string
}

interface Conflict {
  file: string
  raw: string
  meta: import('../../content/schema.ts').EntryMeta
  existing: import('../../content/merge.ts').MergedEntry
  existingText: string
}

export default function ImportsPage() {
  const imports = useArchive((s) => s.imports)
  const merged = useArchive((s) => s.merged)
  const importRawMd = useArchive((s) => s.importRawMd)
  const removeImport = useArchive((s) => s.removeImport)
  const loadEntry = useArchive((s) => s.loadEntry)
  const bodies = useArchive((s) => s.bodies)

  const [reports, setReports] = useState<Report[]>([])
  const [conflict, setConflict] = useState<Conflict | null>(null)

  const handleFiles = async (files: File[]) => {
    const out: Report[] = []
    for (const file of files) {
      const raw = await file.text()
      const result = parseMdForImport(raw, file.name)
      if (!result.ok) {
        out.push({ file: file.name, ok: false, kind: 'invalid', message: result.errors.join('；') })
        continue
      }
      const existing = merged.byId.get(result.meta.id)
      if (existing && result.meta.revision <= existing.meta.revision) {
        const file2 = await loadEntry(existing.id)
        const existingText =
          existing.source === 'imported'
            ? (imports.find((im) => im.meta.id === existing.id)?.rawMd ?? file2?.bodyHtml ?? '')
            : (bodies[existing.id] ?? file2?.bodyHtml ?? '')
        setConflict({ file: file.name, raw, meta: result.meta, existing, existingText })
        out.push({ file: file.name, ok: true, kind: 'skipped', message: '等待人工裁决（已弹出对话框）' })
        continue
      }
      const outcome = await importRawMd(result.meta.id, result.meta, result.bodyHtml, raw)
      out.push({ file: file.name, ok: outcome.ok, kind: outcome.kind, message: outcome.message })
    }
    setReports((prev) => [...out, ...prev].slice(0, 50))
  }

  const decide = async (decision: 'override' | 'keep') => {
    if (!conflict) return
    if (decision === 'override') {
      const result = parseMdForImport(conflict.raw, conflict.file)
      if (result.ok) {
        await importRawMd(result.meta.id, result.meta, result.bodyHtml, conflict.raw)
        setReports((prev) => [
          { file: conflict.file, ok: true, kind: 'override', message: `已按人工裁决导入「${result.meta.title}」` },
          ...prev
        ])
      }
    } else {
      setReports((prev) => [
        { file: conflict.file, ok: true, kind: 'skipped', message: '保留本馆版本，未导入' },
        ...prev
      ])
    }
    setConflict(null)
  }

  return (
    <div>
      <h1 className="font-serifzh font-bold text-2xl mb-2 tracking-widest border-l-4 border-seal pl-3">
        导入管理
      </h1>
      <p className="text-sm text-inksoft mb-6">
        新增：拖入新 md 即入馆，不影响原有内容。修订：同档号高 revision 自动覆盖；低或同 revision
        将弹出三选裁决。导出可再入 content/ 转正为内置卷宗。
      </p>

      <DropZone onFiles={(files) => void handleFiles(files)} />

      {reports.length > 0 && (
        <section className="mt-6" aria-label="导入报告">
          <h2 className="font-serifzh font-bold text-lg mb-2">导入报告</h2>
          <ul className="text-sm space-y-1">
            {reports.map((r, i) => (
              <li
                key={i}
                className={`border-l-4 pl-3 py-1 ${
                  r.ok ? 'border-verdict-green' : 'border-seal'
                }`}
              >
                <span className="font-mono text-xs mr-2">{r.file}</span>
                {r.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-label="导入层一览">
        <h2 className="font-serifzh font-bold text-lg mb-3">
          导入层馆藏 · {imports.length} 卷
        </h2>
        {imports.length === 0 ? (
          <p className="text-sm text-inksoft border border-dashed border-gold/40 p-6 text-center">
            导入层为空。拖入 md 文件即可开始。
          </p>
        ) : (
          <ul className="space-y-2">
            {imports.map((im) => {
              const effective = merged.byId.get(im.meta.id)
              const isEffective = effective?.source === 'imported'
              return (
                <li key={im.meta.id} className="border border-gold/40 p-3 flex items-start gap-3" style={{ backgroundColor: 'var(--c-paper)' }}>
                  <div className="flex-1 min-w-0">
                    <Link to={`/entry/${im.meta.id}`} className="font-serifzh font-bold hover:text-seal">
                      {im.meta.title}
                    </Link>
                    <div className="text-xs text-inksoft mt-1">
                      {im.meta.id} · r{im.meta.revision} · 导入于 {im.importedAt.slice(0, 10)}{' '}
                      {isEffective ? (
                        <span className="text-verdict-green">（现行生效）</span>
                      ) : (
                        <span className="text-seal">（未生效：本馆有更高版本）</span>
                      )}
                      {effective?.conflictEqualRevision && (
                        <span className="text-seal"> · 同版冲突待裁</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      className="text-xs border border-gold/60 px-2 py-1 hover:bg-gold/10"
                      onClick={() => downloadText(`${im.meta.id}.md`, recordToMarkdown(im))}
                    >
                      导出 md
                    </button>
                    <button
                      type="button"
                      className="text-xs border border-seal/60 text-seal px-2 py-1 hover:bg-seal/10"
                      onClick={() => void removeImport(im.meta.id)}
                    >
                      移除
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {conflict && (
        <ConflictDialog
          filename={conflict.file}
          incoming={conflict.meta}
          incomingRaw={conflict.raw}
          existing={conflict.existing}
          existingText={conflict.existingText}
          onDecision={(d) => void decide(d)}
        />
      )}
    </div>
  )
}
