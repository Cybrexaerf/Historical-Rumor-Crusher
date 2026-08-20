import { useArchive } from '../../content/store.ts'
import { VERDICTS } from '../../content/schema.ts'
import Seal from '../../components/Seal.tsx'

interface Dust {
  left: string
  top: string
  size: number
  dur: string
  delay: string
}

const DUST: Dust[] = [
  { left: '12%', top: '30%', size: 3, dur: '6.5s', delay: '0s' },
  { left: '22%', top: '55%', size: 2, dur: '8s', delay: '1.2s' },
  { left: '35%', top: '20%', size: 2.5, dur: '7s', delay: '0.6s' },
  { left: '48%', top: '65%', size: 2, dur: '9s', delay: '2s' },
  { left: '60%', top: '25%', size: 3, dur: '7.5s', delay: '0.3s' },
  { left: '72%', top: '50%', size: 2, dur: '8.5s', delay: '1.6s' },
  { left: '82%', top: '35%', size: 2.5, dur: '6.8s', delay: '0.9s' },
  { left: '90%', top: '60%', size: 2, dur: '9.5s', delay: '2.4s' },
  { left: '28%', top: '75%', size: 2, dur: '7.8s', delay: '1.9s' },
  { left: '55%', top: '40%', size: 2.5, dur: '8.2s', delay: '3.1s' }
]

/** 档案管理员桌面场景：暖光锥 + 档案堆剪影 + 尘粒（纯 SVG/CSS，无位图） */
function DeskScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="lamp-glow" cx="82%" cy="8%" r="65%">
            <stop offset="0%" stopColor="rgba(232,205,140,0.32)" />
            <stop offset="55%" stopColor="rgba(232,205,140,0.10)" />
            <stop offset="100%" stopColor="rgba(232,205,140,0)" />
          </radialGradient>
          <linearGradient id="lamp-cone" x1="1" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="rgba(214,178,104,0.20)" />
            <stop offset="100%" stopColor="rgba(214,178,104,0)" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#lamp-glow)" />
        <polygon points="100,0 100,40 38,100 8,100" fill="url(#lamp-cone)" />
        {/* 左下档案堆剪影 */}
        <g fill="rgba(43,38,32,0.10)">
          <rect x="2" y="88" width="26" height="7" rx="1" transform="rotate(-2 2 88)" />
          <rect x="4" y="82" width="22" height="7" rx="1" transform="rotate(1 4 82)" />
          <rect x="3" y="76" width="24" height="7" rx="1" transform="rotate(-1 3 76)" />
        </g>
        {/* 右下档案堆剪影 */}
        <g fill="rgba(43,38,32,0.13)">
          <rect x="70" y="90" width="28" height="7" rx="1" transform="rotate(1 70 90)" />
          <rect x="74" y="83" width="22" height="7" rx="1" transform="rotate(-2 74 83)" />
          <rect x="78" y="77" width="17" height="6" rx="1" transform="rotate(2 78 77)" />
        </g>
      </svg>
      {/* 光锥中的尘粒 */}
      {DUST.map((d, i) => (
        <span
          key={i}
          className="anim-dust absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: 'rgba(214,178,104,0.8)',
            ['--dust-dur' as string]: d.dur,
            ['--dust-delay' as string]: d.delay
          }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const stats = useArchive((s) => s.merged.stats)
  const disputed = (stats.byVerdict.disputed ?? 0) + (stats.byVerdict.open ?? 0)

  return (
    <section className="relative overflow-hidden py-20 px-4" style={{ backgroundColor: 'var(--c-paper)' }}>
      <DeskScene />
      <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <h1
          className="font-serifzh font-black text-5xl md:text-7xl leading-tight tracking-[0.25em] shrink-0"
          style={{ writingMode: 'vertical-rl', textShadow: '2px 2px 0 rgba(138,109,47,0.18)' }}
          aria-label="史实勘误局"
        >
          史实勘误局
        </h1>
        <div className="flex-1 min-w-0">
          <p className="text-inksoft tracking-[0.35em] border-l-2 border-gold pl-4 mb-6">
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
