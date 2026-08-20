import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import VirtualList from '../../components/VirtualList.tsx'
import EmptyState from '../../components/EmptyState.tsx'
import FiltersPanel from './FiltersPanel.tsx'
import EntryCard from './EntryCard.tsx'
import { applyFilters, deserializeFilters, serializeFilters, type BrowseFilters, type SortKey } from './filters.ts'

export default function Browse() {
  const entries = useArchive((s) => s.merged.entries)
  const read = useArchive((s) => s.user.read)
  const [params, setParams] = useSearchParams()

  const { filters, sort } = useMemo(
    () => deserializeFilters(params.toString()),
    [params]
  )
  const shown = useMemo(() => applyFilters(entries, filters, sort, read), [entries, filters, sort, read])

  const onChange = (next: BrowseFilters, nextSort: SortKey) => {
    const qs = serializeFilters(next, nextSort)
    setParams(qs ? new URLSearchParams(qs) : new URLSearchParams(), { replace: true })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <FiltersPanel
        filters={filters}
        sort={sort}
        total={entries.length}
        shown={shown.length}
        entries={entries}
        onChange={onChange}
      />
      <section className="border border-gold/40" style={{ backgroundColor: 'var(--c-paper)' }}>
        <h1 className="sr-only">总目录</h1>
        {shown.length === 0 ? (
          <EmptyState stamp="无卷" title="没有符合条件的卷宗" hint="试试放宽筛选。" />
        ) : shown.length > 60 ? (
          <VirtualList
            items={shown}
            itemHeight={104}
            viewportHeight={720}
            getKey={(e) => e.id}
            render={(e, i) => <EntryCard entry={e} index={i} />}
          />
        ) : (
          <div role="list">
            {shown.map((e, i) => (
              <EntryCard key={e.id} entry={e} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
