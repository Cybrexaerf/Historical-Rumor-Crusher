import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { RandomButton } from './hooks'
import { getStoredTheme, setTheme, type Theme } from '../design/theme.ts'

function ThemeToggle() {
  const [current, setCurrent] = useState<Theme>(() => getStoredTheme())
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      aria-label={current === 'dark' ? '切换到亮色阅览室' : '切换到暗夜特藏室'}
      title={current === 'dark' ? '亮色阅览室' : '暗夜特藏室'}
      className="w-8 h-8 border border-gold/50 leading-none text-sm hover:bg-gold/10"
      onClick={() => {
        setTheme(next)
        setCurrent(next)
      }}
    >
      {current === 'dark' ? '☀' : '☾'}
    </button>
  )
}

const NAV = [
  { to: '/browse', label: '总目录' },
  { to: '/timeline', label: '时代长卷' },
  { to: '/search', label: '检索' },
  { to: '/bookmarks', label: '我的书架' },
  { to: '/stats', label: '馆志' },
  { to: '/imports', label: '导入管理' }
]

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--c-paper-deep)' }}>
      <header className="sticky top-0 z-40 border-b border-gold/40" style={{ backgroundColor: 'var(--c-paper)' }}>
        <nav className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 flex-wrap">
          <Link to="/" className="font-serifzh font-black text-xl tracking-[0.3em]">
            史实勘误局
          </Link>
          <span className="hidden sm:inline text-xs text-inksoft border-l border-gold/40 pl-4">
            历史谣言澄清档案馆
          </span>
          <ul className="flex gap-1 text-sm flex-wrap ml-auto">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={`px-2 py-1 border-b-2 ${
                    pathname === n.to
                      ? 'border-seal text-seal'
                      : 'border-transparent text-inksoft hover:text-ink'
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <RandomButton />
        </nav>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gold/40 py-3 text-center text-xs text-inksoft">
        史实勘误局 · 本地离线馆藏 · 卷内陈述以卷尾参考文献为准
      </footer>
    </div>
  )
}
