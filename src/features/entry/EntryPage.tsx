import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { sectionize } from '../../content/sectionize.ts'
import Seal from '../../components/Seal.tsx'
import EmptyState from '../../components/EmptyState.tsx'
import SectionRenderer from './SectionRenderer.tsx'
import ReferencesList from './ReferencesList.tsx'
import DossierSidebar from './DossierSidebar.tsx'
import ReadingProgress from './ReadingProgress.tsx'
import CorrectionButton from './CorrectionButton.tsx'

export default function EntryPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const merged = useArchive((s) => s.merged)
  const loadEntry = useArchive((s) => s.loadEntry)
  const markRead = useArchive((s) => s.markRead)
  const pushRecent = useArchive((s) => s.pushRecent)
  const incrementViews = useArchive((s) => s.incrementViews)
  const fontSize = useArchive((s) => s.user.fontSize)
  const setFontSize = useArchive((s) => s.setFontSize)
  const bookmarks = useArchive((s) => s.user.bookmarks)
  const toggleBookmark = useArchive((s) => s.toggleBookmark)

  const entry = merged.byId.get(id)
  const bodyHtml = useArchive((s) => s.bodies[id])
  const setBodyHtml = useArchive((s) => s.setBody)

  useEffect(() => {
    if (!entry) return
    void loadEntry(id).then((file) => {
      if (file) setBodyHtml(id, file.bodyHtml)
    })
    markRead(id)
    pushRecent(id)
    incrementViews(id)
  }, [id, entry, loadEntry, markRead, pushRecent, incrementViews])

  const { sections, footnotes } = useMemo(() => sectionize(bodyHtml ?? ''), [bodyHtml])

  const siblings = useMemo(() => {
    if (!entry) return { prev: null, next: null }
    const sameCat = merged.entries.filter((e) => e.meta.category === entry.meta.category)
    const i = sameCat.findIndex((e) => e.id === entry.id)
    return { prev: sameCat[i - 1] ?? null, next: sameCat[i + 1] ?? null }
  }, [entry, merged.entries])

  if (!entry) {
    const retired = useArchive.getState().user.retired.includes(id)
    return (
      <EmptyState
        stamp={retired ? '下架' : '查无'}
        title={retired ? '此卷已下架' : '查无此卷'}
        hint={retired ? '本卷已被馆主下架，可在「导入管理 → 馆务室」恢复上架。' : '可能已被移除，或档号有误。'}
      >
        <Link to="/browse" className="text-seal underline underline-offset-4 mt-3 inline-block">
          ← 返回总目录
        </Link>
      </EmptyState>
    )
  }

  const m = entry.meta
  const bookmarked = bookmarks.includes(id)
  const volumeNo = merged.entries.findIndex((e) => e.id === id) + 1

  return (
    <div>
      <ReadingProgress />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <DossierSidebar entry={entry} sections={sections} onFontSize={setFontSize} fontSize={fontSize} />

        <div
          className="anim-page-turn border border-gold/40 px-6 py-8 md:px-10 crop-marks"
          style={{ backgroundColor: 'var(--c-paper)' }}
        >
          {/* 举报信：谣言原始陈述 */}
          <section
            className="border-2 border-seal/70 p-6 mb-2 relative"
            style={{ backgroundColor: 'var(--c-paper-deep)' }}
            aria-label="谣言原始陈述"
          >
            <span className="absolute -top-3 left-4 px-2 text-xs tracking-[0.3em]" style={{ backgroundColor: 'var(--c-paper-deep)' }}>
              举报信 · 谣言原文
            </span>
            <p className="font-kai text-lg leading-loose">{m.rumor}</p>
            <span className="absolute right-4 bottom-3">
              <Seal text="受理" size={48} color="var(--c-seal)" />
            </span>
          </section>

          <header className="my-8">
            <h1 className="font-serifzh font-black text-3xl leading-snug">{m.title}</h1>
            <button
              type="button"
              aria-pressed={bookmarked}
              className={`mt-3 text-sm border px-3 py-1 ${
                bookmarked ? 'border-gold text-gold bg-gold/10' : 'border-gold/40 text-inksoft'
              }`}
              onClick={() => toggleBookmark(id)}
            >
              {bookmarked ? '★ 已收藏' : '☆ 收藏本卷'}
            </button>
          </header>

          <SectionRenderer sections={sections} footnotes={footnotes} verdict={m.verdict} />

          <div id="references">
            <ReferencesList meta={m} />
          </div>

          <nav className="mt-10 pt-6 border-t border-gold/40 flex justify-between gap-4 text-sm" aria-label="同分类卷宗">
            {siblings.prev ? (
              <button type="button" className="text-left hover:text-seal" onClick={() => navigate(`/entry/${siblings.prev!.id}`)}>
                ← 上一卷：{siblings.prev.meta.title}
              </button>
            ) : (
              <span />
            )}
            {siblings.next && (
              <button type="button" className="text-right hover:text-seal" onClick={() => navigate(`/entry/${siblings.next!.id}`)}>
                下一卷：{siblings.next.meta.title} →
              </button>
            )}
          </nav>

          <div className="mt-6 flex items-center justify-center gap-4">
            <p className="text-center text-xs text-inksoft tracking-[0.25em]">
              本卷为馆藏第 {volumeNo} 卷 · 共 {merged.entries.length} 卷 · 档号 {m.id}
            </p>
            <CorrectionButton entry={entry} />
          </div>
        </div>
      </div>
    </div>
  )
}
