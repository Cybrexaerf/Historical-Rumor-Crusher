import { useState } from 'react'
import type { MergedEntry } from '../../content/merge.ts'
import type { CorrectionFile } from '../imports/corrections.ts'
import { downloadText } from '../../content/md-runtime.ts'
import { githubIssueUrl } from '../../config.ts'

interface CorrectionButtonProps {
  entry: MergedEntry
}

/** 卷尾「提交勘误」：在线版直跳 GitHub Issue；离线版生成勘误单文件邮寄给馆主 */
export default function CorrectionButton({ entry }: CorrectionButtonProps) {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [evidence, setEvidence] = useState('')
  const [contact, setContact] = useState('')
  const [done, setDone] = useState(false)

  const issueUrl = githubIssueUrl(
    `[勘误] ${entry.meta.title}`,
    [
      `**档号**：${entry.id}`,
      `**卷宗**：${entry.meta.title}`,
      `**错误位置**：${location || '（请在 Issue 模板中填写）'}`,
      `**勘误依据**：${evidence || '（请在 Issue 模板中填写）'}`,
      contact ? `**联系**：${contact}` : '',
      `**来源页面**：${typeof window !== 'undefined' ? window.location.href : ''}`
    ]
      .filter(Boolean)
      .join('\n\n')
  )

  const submit = () => {
    if (!location.trim() || !evidence.trim()) return
    const file: CorrectionFile = {
      app: 'rumor-archive',
      type: 'correction',
      version: 1,
      entryId: entry.id,
      entryTitle: entry.meta.title,
      location: location.trim(),
      evidence: evidence.trim(),
      contact: contact.trim(),
      submittedAt: new Date().toISOString()
    }
    downloadText(
      `correction-${entry.id}-${file.submittedAt.slice(0, 10)}.json`,
      JSON.stringify(file, null, 2)
    )
    setDone(true)
    setTimeout(() => {
      setOpen(false)
      setDone(false)
      setLocation('')
      setEvidence('')
      setContact('')
    }, 1800)
  }

  return (
    <>
      <button
        type="button"
        className="text-sm text-inksoft border border-gold/40 px-3 py-1 hover:text-seal hover:border-seal/50"
        onClick={() => setOpen(true)}
      >
        勘误上报
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(43,38,32,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-label="提交勘误"
        >
          <div className="max-w-lg w-full border-2 border-gold p-6 max-h-[85vh] overflow-y-auto" style={{ backgroundColor: 'var(--c-paper)' }}>
            <h2 className="font-serifzh font-bold text-xl mb-1">勘误上报</h2>
            <p className="text-xs text-inksoft mb-4">
              「{entry.meta.title}」（档号 {entry.id}）——发现叙述错误？请留下依据，勘误单将以文件形式下载，发送给馆主即可。
            </p>

            {done ? (
              <p className="text-center py-8">
                <span className="font-serifzh font-bold text-lg text-verdict-green">勘误单已生成</span>
                <br />
                <span className="text-sm text-inksoft">请将下载的 JSON 文件发送给馆主。</span>
              </p>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="text-inksoft">错误位置 *（章节 / 段落 / 原句）</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1 border border-gold/50 px-3 py-2 outline-none focus:border-seal"
                    style={{ backgroundColor: 'var(--c-paper-deep)' }}
                    placeholder="如：史料考证 第二段「页码 412-415」"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-inksoft">勘误依据 *</span>
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={4}
                    className="w-full mt-1 border border-gold/50 px-3 py-2 outline-none focus:border-seal"
                    style={{ backgroundColor: 'var(--c-paper-deep)' }}
                    placeholder="如：《雍正传》1985 年版页码应为 412-416，或有某某史料可补充……"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-inksoft">联系方式（可选，便于回执）</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full mt-1 border border-gold/50 px-3 py-2 outline-none focus:border-seal"
                    style={{ backgroundColor: 'var(--c-paper-deep)' }}
                    placeholder="昵称 / 邮箱"
                  />
                </label>
                <div className="flex justify-end gap-3 pt-2">
                  {issueUrl && (
                    <a
                      href={issueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border border-gold/60 text-sm hover:bg-gold/10"
                    >
                      转 GitHub 在线提交
                    </a>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 border border-gold/60 text-sm hover:bg-gold/10"
                    onClick={() => setOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-seal text-seal text-sm hover:bg-seal/10 disabled:opacity-40"
                    disabled={!location.trim() || !evidence.trim()}
                    onClick={submit}
                  >
                    生成勘误单
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
