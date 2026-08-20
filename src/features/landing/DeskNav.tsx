import { Link } from 'react-router-dom'
import { pickRandom } from '../random/random.ts'
import { useArchive } from '../../content/store.ts'

interface DeskItem {
  to: string
  label: string
  hint: string
}

const ITEMS: DeskItem[] = [
  { to: '/browse', label: '总目录', hint: '多维检索全馆卷宗' },
  { to: '/timeline', label: '时代长卷', hint: '沿时代轴纵览谣言' },
  { to: '/search', label: '全文检索', hint: '中文/拼音皆可查' },
  { to: '/imports', label: '导入管理', hint: '拖入 md 即可入馆' }
]

/** 桌面元素即导航：档案袋卡片 */
export default function DeskNav() {
  const entries = useArchive((s) => s.merged.entries)
  return (
    <section aria-label="馆藏导航" className="py-10 px-4">
      <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {ITEMS.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className="group relative block border border-gold/50 p-4 transition-transform hover:-translate-y-1"
            style={{ backgroundColor: 'var(--c-paper)', animationDelay: `${i * 60}ms` }}
          >
            <span className="block text-xs text-inksoft mb-2">档案袋 · 案卷{i + 1}</span>
            <span className="block font-serifzh font-bold text-xl mb-1 group-hover:text-seal">
              {item.label}
            </span>
            <span className="block text-sm text-inksoft">{item.hint}</span>
            <span
              aria-hidden
              className="absolute right-3 top-3 w-4 h-4 rounded-full border border-seal/40 group-hover:bg-seal/20"
            />
          </Link>
        ))}
      </div>
      <div className="mx-auto max-w-5xl mt-4 text-right">
        <button
          type="button"
          className="text-sm text-inksoft underline decoration-gold underline-offset-4 hover:text-seal"
          onClick={() => {
            const pick = pickRandom(entries)
            if (pick) window.location.hash = `#/entry/${pick.id}`
          }}
        >
          或随机抽一份卷宗试试手气 →
        </button>
      </div>
    </section>
  )
}
