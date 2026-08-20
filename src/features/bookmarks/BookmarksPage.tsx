import { Link } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { eraLabel, verdictMeta } from '../../content/schema.ts'
import EmptyState from '../../components/EmptyState.tsx'

function CardList({ ids, empty, stamp }: { ids: string[]; empty: string; stamp: string }) {
  const merged = useArchive((s) => s.merged)
  if (ids.length === 0) {
    return <EmptyState stamp={stamp} title="空空如也" hint={empty} />
  }
  return (
    <ul className="space-y-2">
      {ids
        .map((id) => merged.byId.get(id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
        .map((e) => {
          const v = verdictMeta(e.meta.verdict)
          return (
            <li key={e.id} className="border border-gold/40 p-3" style={{ backgroundColor: 'var(--c-paper)' }}>
              <Link to={`/entry/${e.id}`} className="font-serifzh font-bold hover:text-seal">
                {e.meta.title}
              </Link>
              <div className="text-xs text-inksoft mt-1">
                {eraLabel(e.meta.era)} · <span style={{ color: v?.color }}>{v?.label}</span> · r{e.meta.revision}
              </div>
            </li>
          )
        })}
    </ul>
  )
}

/** 我的书架：收藏 / 已读 / 最近浏览 */
export default function BookmarksPage() {
  const user = useArchive((s) => s.user)
  const total = useArchive((s) => s.merged.stats.total)

  return (
    <div>
      <h1 className="font-serifzh font-bold text-2xl mb-2 tracking-widest border-l-4 border-seal pl-3">
        我的书架
      </h1>
      <p className="text-sm text-inksoft mb-6">本地数据仅存于本机浏览器，不随应用分发。</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section aria-label="收藏">
          <h2 className="font-serifzh font-bold text-lg mb-3 border-b border-gold/40 pb-1">
            收藏 ★ <span className="text-sm text-inksoft">{user.bookmarks.length}</span>
          </h2>
          <CardList ids={user.bookmarks} stamp="未藏" empty="还没有收藏。在卷宗页点击「收藏本卷」即可加入。" />
        </section>
        <section aria-label="已读">
          <h2 className="font-serifzh font-bold text-lg mb-3 border-b border-gold/40 pb-1">
            已读 <span className="text-sm text-inksoft">{user.read.length}/{total}</span>
          </h2>
          <CardList ids={user.read} stamp="未启" empty="尚无已读记录。点开卷宗即自动记为已读。" />
        </section>
        <section aria-label="最近浏览">
          <h2 className="font-serifzh font-bold text-lg mb-3 border-b border-gold/40 pb-1">最近浏览</h2>
          <CardList ids={user.recent} stamp="无痕" empty="暂无浏览记录。" />
        </section>
      </div>
    </div>
  )
}
