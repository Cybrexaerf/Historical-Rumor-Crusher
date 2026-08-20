import { useEffect, useRef } from 'react'
import Hero from './Hero.tsx'
import DeskNav from './DeskNav.tsx'
import StatsPlaques from './StatsPlaques.tsx'
import RecentDossier from './RecentDossier.tsx'

/** 辟谣红线：随滚动自印章向下生长（scroll-driven） */
function RedThread() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const el = pathRef.current
    if (!el || typeof el.getTotalLength !== 'function') return
    const len = el.getTotalLength()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.style.strokeDasharray = 'none'
      return
    }
    el.style.strokeDasharray = `${len}`
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 1
      el.style.strokeDashoffset = `${len * (1 - p)}`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      preserveAspectRatio="none"
      viewBox="0 0 100 300"
    >
      <path
        ref={pathRef}
        d="M 78 20 C 60 60, 90 90, 50 130 S 20 200, 50 260"
        fill="none"
        stroke="var(--c-seal)"
        strokeWidth="0.4"
        strokeDasharray="2 1.5"
      />
    </svg>
  )
}

/** 档案大厅：档案管理员桌面隐喻 + 辟谣红线贯穿 */
export default function Landing() {
  return (
    <div className="relative">
      <RedThread />
      <div className="relative">
        <Hero />
        <DeskNav />
        <StatsPlaques />
        <RecentDossier />
      </div>
    </div>
  )
}
