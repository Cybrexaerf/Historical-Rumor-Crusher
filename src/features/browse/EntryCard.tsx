import { Link } from 'react-router-dom'
import type { MergedEntry } from '../../content/merge.ts'
import { eraLabel, verdictMeta } from '../../content/schema.ts'
import { useArchive } from '../../content/store.ts'

/** 目录条目卡：统一行高以配合虚拟列表 */
export default function EntryCard({ entry, index }: { entry: MergedEntry; index: number }) {
  const m = entry.meta
  const v = verdictMeta(m.verdict)
  const bookmarks = useArchive((s) => s.user.bookmarks)
  const toggleBookmark = useArchive((s) => s.toggleBookmark)
  const bookmarked = bookmarks.includes(entry.id)

  return (
    <div className="h-[104px] px-3 py-2 border-b border-gold/30 flex items-start gap-3 hover:bg-gold/5 transition-colors">
      <span className="text-xs text-inksoft pt-1 w-8 tabular-nums shrink-0">
        {String(index + 1).padStart(3, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <Link to={`/entry/${entry.id}`} className="font-serifzh font-bold text-base hover:text-seal leading-snug">
          {m.title}
        </Link>
        <p className="text-sm text-inksoft font-kai truncate mt-1">{m.rumor}</p>
        <div className="flex flex-wrap gap-2 items-center mt-1.5 text-xs text-inksoft">
          <span>{eraLabel(m.era)}</span>
          <span aria-hidden>·</span>
          <span style={{ color: v?.color }}>{v?.label}</span>
          <span aria-hidden>·</span>
          <span>{m.origin}</span>
          <span aria-hidden>·</span>
          <span>r{m.revision}</span>
          {entry.source === 'imported' && (
            <span className="px-1 border border-gold text-gold">本地修订</span>
          )}
          {entry.conflictEqualRevision && (
            <span className="px-1 border border-seal text-seal">版本待裁</span>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label={bookmarked ? '取消收藏' : '收藏'}
        aria-pressed={bookmarked}
        className={`shrink-0 w-8 h-8 text-lg leading-none border ${
          bookmarked ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
        }`}
        onClick={() => toggleBookmark(entry.id)}
      >
        {bookmarked ? '★' : '☆'}
      </button>
    </div>
  )
}
