import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadCorrections,
  parseCorrectionFile,
  removeCorrection,
  setCorrectionStatus,
  type Correction
} from './corrections.ts'

const STATUS_META: Record<Correction['status'], { label: string; color: string }> = {
  pending: { label: '待勘', color: 'var(--c-verdict-partial)' },
  accepted: { label: '已采纳', color: 'var(--c-verdict-green)' },
  rejected: { label: '已驳回', color: 'var(--c-verdict-open)' }
}

/** 勘误收件箱：导入朋友发来的勘误单，逐条裁决 */
export default function CorrectionInbox() {
  const [list, setList] = useState<Correction[]>(() => loadCorrections())
  const [msg, setMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = () => setList(loadCorrections())

  const handleFiles = async (files: File[]) => {
    let ok = 0
    const errs: string[] = []
    for (const f of files) {
      const r = parseCorrectionFile(await f.text())
      if (r.ok) {
        const { addCorrection } = await import('./corrections.ts')
        addCorrection(r.file)
        ok++
      } else {
        errs.push(`${f.name}：${r.error}`)
      }
    }
    setMsg(ok > 0 ? `已收录 ${ok} 份勘误单${errs.length ? `；${errs.length} 份失败` : ''}` : errs.join('；'))
    refresh()
  }

  const byStatus = (s: Correction['status']) => list.filter((c) => c.status === s)

  return (
    <section className="mt-10" aria-label="勘误收件箱">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-serifzh font-bold text-lg">
          勘误收件箱 · 待勘 {byStatus('pending').length} 件
        </h2>
        <button
          type="button"
          className="text-sm border border-gold/60 px-3 py-1 hover:bg-gold/10"
          onClick={() => inputRef.current?.click()}
        >
          导入勘误单
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])]
            if (files.length > 0) void handleFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      {msg && <p className="text-sm text-inksoft mb-2">{msg}</p>}

      {list.length === 0 ? (
        <p className="text-sm text-inksoft border border-dashed border-gold/40 p-6 text-center">
          收件箱空空——朋友们在卷宗页点「勘误上报」生成的 JSON 文件发给你后，在此导入。
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => {
            const sm = STATUS_META[c.status]
            return (
              <li key={c.id} className="border border-gold/40 p-4" style={{ backgroundColor: 'var(--c-paper)' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 border" style={{ color: sm.color, borderColor: sm.color }}>
                        {sm.label}
                      </span>
                      <Link to={`/entry/${c.entryId}`} className="font-serifzh font-bold text-sm hover:text-seal">
                        {c.entryTitle || c.entryId}
                      </Link>
                      <span className="text-xs text-inksoft">{c.submittedAt.slice(0, 10)}</span>
                      {c.contact && <span className="text-xs text-inksoft">来自 {c.contact}</span>}
                    </div>
                    <p className="text-sm mt-2">
                      <span className="text-inksoft text-xs mr-1">位置：</span>
                      {c.location}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-inksoft text-xs mr-1">依据：</span>
                      {c.evidence}
                    </p>
                    {c.note && (
                      <p className="text-xs text-inksoft mt-1">批注：{c.note}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="text-xs border border-verdict-green text-verdict-green px-2 py-1 hover:bg-verdict-green/10"
                          onClick={() => {
                            setCorrectionStatus(c.id, 'accepted')
                            refresh()
                          }}
                        >
                          采纳
                        </button>
                        <button
                          type="button"
                          className="text-xs border border-gold/60 px-2 py-1 hover:bg-gold/10"
                          onClick={() => {
                            const note = window.prompt('驳回理由（可空）：') ?? ''
                            setCorrectionStatus(c.id, 'rejected', note || undefined)
                            refresh()
                          }}
                        >
                          驳回
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="text-xs border border-seal/60 text-seal px-2 py-1 hover:bg-seal/10"
                      onClick={() => {
                        removeCorrection(c.id)
                        refresh()
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
                {c.status === 'accepted' && (
                  <p className="text-xs text-verdict-green mt-2">
                    已采纳——请修订 content/{c.entryId}.md（revision +1）并重新构建发布。
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
