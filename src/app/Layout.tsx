import { Link, Outlet, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', label: '档案大厅' },
  { to: '/browse', label: '总目录' },
  { to: '/timeline', label: '时代长卷' },
  { to: '/search', label: '检索' },
  { to: '/bookmarks', label: '我的书架' },
  { to: '/imports', label: '导入管理' }
]

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gold/40 bg-paper sticky top-0 z-40">
        <nav className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 flex-wrap">
          <Link to="/" className="font-serifzh font-bold text-lg tracking-widest">
            史实勘误局
          </Link>
          <ul className="flex gap-3 text-sm flex-wrap">
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
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gold/40 py-3 text-center text-xs text-inksoft">
        史实勘误局 · 本地离线馆藏 · 内容以卷尾参考文献为准
      </footer>
    </div>
  )
}
