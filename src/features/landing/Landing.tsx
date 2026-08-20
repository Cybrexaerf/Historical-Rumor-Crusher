import Hero from './Hero.tsx'
import DeskNav from './DeskNav.tsx'
import StatsPlaques from './StatsPlaques.tsx'
import RecentDossier from './RecentDossier.tsx'

/** 档案大厅：档案管理员桌面隐喻 + 辟谣红线贯穿 */
export default function Landing() {
  return (
    <div className="relative">
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 100 300"
      >
        <path
          d="M 78 20 C 60 60, 90 90, 50 130 S 20 200, 50 260"
          fill="none"
          stroke="var(--c-seal)"
          strokeWidth="0.4"
          strokeDasharray="2 1.5"
        />
      </svg>
      <div className="relative">
        <Hero />
        <DeskNav />
        <StatsPlaques />
        <RecentDossier />
      </div>
    </div>
  )
}
