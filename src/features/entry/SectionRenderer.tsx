import { useRef, useState } from 'react'
import type { Footnote, Section } from '../../content/sectionize.ts'
import { sectionLabel } from '../../content/sectionize.ts'
import VerdictStamp from '../../components/VerdictStamp.tsx'

interface SectionRendererProps {
  sections: Section[]
  footnotes: Footnote[]
  verdict: string
}

const STYLES: Record<string, { wrap: string; label: string }> = {
  'rumor-origin': {
    wrap: 'border-l-4 border-double border-ink/60 -rotate-[0.3deg] px-6 py-4 my-6 font-kai text-[1.05em]',
    label: '旧闻剪报 · 逐份对勘'
  },
  spread: {
    wrap: 'border-l-4 border-double border-ink/40 rotate-[0.25deg] px-6 py-4 my-6 font-kai text-[1.02em]',
    label: '流变记档 · 剪报续'
  },
  evidence: {
    wrap: 'my-8 px-1',
    label: '纸面考证 · 逐条辨析'
  },
  verdict: {
    wrap: 'my-10 px-8 py-6 text-[1.05em]',
    label: '结 案 陈 词'
  }
}

/** 四个语义区块的差异化呈现（spec §6.3） */
export default function SectionRenderer({ sections, footnotes, verdict }: SectionRendererProps) {
  const [tip, setTip] = useState<{ x: number; y: number; html: string } | null>(null)
  const articleRef = useRef<HTMLElement>(null)

  const showTip = (target: HTMLElement) => {
    const n = Number((target.textContent?.match(/\d+/) ?? ['0'])[0])
    const fn = footnotes.find((f) => f.n === n)
    if (!fn) return
    const rect = target.getBoundingClientRect()
    setTip({ x: rect.left, y: rect.bottom + 6, html: fn.html })
  }

  const onOver = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('a.footnote-ref')
    if (el) showTip(el as HTMLElement)
    else if (tip) setTip(null)
  }

  return (
    <article
      ref={articleRef}
      className="relative"
      onMouseOver={onOver}
      onMouseLeave={() => setTip(null)}
      style={{ maxWidth: 'var(--max-line)' }}
    >
      {sections.map((s) => {
        const style = STYLES[s.key] ?? STYLES.evidence
        const isVerdict = s.key === 'verdict'
        return (
          <section
            key={s.key + s.title}
            id={`sec-${s.key}`}
            className={`${style.wrap} ${s.key === 'evidence' ? 'sec-evidence' : ''}`}
            style={
              isVerdict
                ? { backgroundColor: 'var(--c-verdict-green)', color: 'var(--c-paper)', boxShadow: '0 2px 10px var(--c-shadow-strong)' }
                : undefined
            }
          >
            <header className={`flex items-center gap-3 mb-3 ${isVerdict ? '' : 'opacity-80'}`}>
              <h2 className="font-serifzh font-black text-xl tracking-[0.2em]">{s.title || sectionLabel(s)}</h2>
              <span
                className={`text-xs ${isVerdict ? 'text-paper/70' : 'text-inksoft'}`}
                aria-hidden
              >
                {style.label}
              </span>
              {isVerdict && <span className="ml-auto"><VerdictStamp verdict={verdict} size={52} animated /></span>}
            </header>
            <div className="entry-prose" dangerouslySetInnerHTML={{ __html: s.html }} />
          </section>
        )
      })}

      {tip && (
        <div
          role="tooltip"
          className="fixed z-50 max-w-md border border-gold/60 px-4 py-3 text-sm shadow-lg"
          style={{
            left: Math.min(tip.x, window.innerWidth - 380),
            top: tip.y,
            backgroundColor: 'var(--c-paper)'
          }}
          dangerouslySetInnerHTML={{ __html: tip.html }}
        />
      )}
    </article>
  )
}
