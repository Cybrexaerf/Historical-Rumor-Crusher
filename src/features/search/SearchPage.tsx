import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import { searchIndex } from '../../search/client.ts'
import { segmentZh } from '../../search/tokenize.ts'
import { ERAS, eraLabel, verdictMeta } from '../../content/schema.ts'
import Highlight from './Highlight.tsx'
import EmptyState from '../../components/EmptyState.tsx'

type Scope = 'all' | 'title' | 'rumor'

export default function SearchPage() {
  const entries = useArchive((s) => s.merged.entries)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])

  const scopeIds = useMemo(() => {
    if (scope === 'all' || /^[a-z0-9\s]+$/i.test(debounced.trim())) return null
    const q = debounced.trim()
    return new Set(
      entries
        .filter((e) => (scope === 'title' ? e.meta.title.includes(q) : e.meta.rumor.includes(q)))
        .map((e) => e.id)
    )
  }, [scope, debounced, entries])

  const [hits, setHits] = useState<{ id: string; score: number }[]>([])
  const [searching, setSearching] = useState(false)
  useEffect(() => {
    if (!debounced.trim()) {
      setHits([])
      setSearching(false)
      return
    }
    setSearching(true)
    const start = performance.now()
    void searchIndex(debounced).then((h) => {
      setHits(h)
      setSearching(false)
      setElapsed(Math.round(performance.now() - start))
    })
  }, [debounced])

  const terms = useMemo(() => (debounced ? [...new Set([...segmentZh(debounced), debounced])] : []), [debounced])
  const filtered = hits
    .filter((h) => !scopeIds || scopeIds.has(h.id))
    .map((h) => ({ hit: h, entry: byId.get(h.id) }))
    .filter((r) => r.entry)

  const grouped = useMemo(() => {
    const groups: { era: string; items: typeof filtered }[] = []
    for (const era of ERAS) {
      const items = filtered.filter((r) => r.entry!.meta.era === era.key)
      if (items.length > 0) groups.push({ era: era.key, items })
    }
    return groups
  }, [filtered])

  return (
    <div>
      <h1 className="font-serifzh font-bold text-2xl mb-4 tracking-widest border-l-4 border-seal pl-3">
        全文检索
      </h1>
      <div className="flex gap-2 items-center mb-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词、全拼或拼音首字母（如 乾隆 / qianlong / ql）"
          aria-label="检索关键词"
          className="flex-1 border border-gold/60 px-3 py-2 text-lg outline-none focus:border-seal"
          style={{ backgroundColor: 'var(--c-paper)' }}
        />
        <div className="flex gap-1 text-sm" role="group" aria-label="检索范围">
          {(
            [
              ['all', '全部'],
              ['title', '标题'],
              ['rumor', '谣言陈述']
            ] as [Scope, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={scope === key}
              className={`px-2 py-1 border ${
                scope === key ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
              }`}
              onClick={() => setScope(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-inksoft mb-4" aria-live="polite">
        {searching
          ? null
          : debounced.trim()
            ? `命中 ${filtered.length} 卷 · 耗时 ${elapsed}ms`
            : '共索引全馆卷宗的标题、谣言陈述与正文。'}
      </p>

      {searching && (
        <p className="p-8 text-center text-inksoft anim-dots" role="status">
          调档中
        </p>
      )}

      {!searching && debounced.trim() && filtered.length === 0 && (
        <EmptyState stamp="未寻" title="此档未立" hint="未见相关卷宗——换个关键词，或试试拼音。" />
      )}

      {grouped.map((g) => (
        <section key={g.era} className="mb-6">
          <h2 className="text-sm tracking-[0.3em] text-inksoft border-b border-gold/30 pb-1 mb-3">
            {eraLabel(g.era)} · {g.items.length} 卷
          </h2>
          <ul>
            {g.items.map(({ entry }) => {
              const v = verdictMeta(entry!.meta.verdict)
              return (
                <li key={entry!.id} className="mb-3 border border-gold/40 p-3" style={{ backgroundColor: 'var(--c-paper)' }}>
                  <Link to={`/entry/${entry!.id}`} className="font-serifzh font-bold text-lg hover:text-seal">
                    <Highlight text={entry!.meta.title} terms={terms} />
                  </Link>
                  <p className="text-sm text-inksoft font-kai mt-1">
                    <Highlight text={entry!.meta.rumor} terms={terms} />
                  </p>
                  <span className="text-xs mt-1 inline-block" style={{ color: v?.color }}>
                    {v?.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
