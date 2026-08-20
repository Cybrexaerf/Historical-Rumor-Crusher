import { CATEGORIES, ERAS, ORIGINS, VERDICTS } from '../../content/schema.ts'
import type { BrowseFilters, SortKey } from './filters.ts'
import { collectTags } from './filters.ts'
import type { MergedEntry } from '../../content/merge.ts'

interface FiltersPanelProps {
  filters: BrowseFilters
  sort: SortKey
  total: number
  shown: number
  entries: MergedEntry[]
  onChange: (filters: BrowseFilters, sort: SortKey) => void
}

function Group<T extends { key: string; label: string }>({
  title,
  items,
  selected,
  onToggle
}: {
  title: string
  items: readonly T[]
  selected: string[]
  onToggle: (key: string) => void
}) {
  return (
    <section className="mb-4">
      <h3 className="text-xs tracking-[0.3em] text-inksoft mb-2 border-b border-gold/30 pb-1">{title}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.includes(item.key)
          return (
            <li key={item.key}>
              <button
                type="button"
                aria-pressed={active}
                className={`px-2 py-0.5 text-sm border transition-colors ${
                  active
                    ? 'border-seal text-seal bg-seal/10'
                    : 'border-gold/40 text-inksoft hover:border-gold hover:text-ink'
                }`}
                onClick={() => onToggle(item.key)}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function FiltersPanel({ filters, sort, total, shown, entries, onChange }: FiltersPanelProps) {
  const toggle = (key: keyof BrowseFilters) => (value: string) => {
    const list = filters[key] as string[]
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    onChange({ ...filters, [key]: next }, sort)
  }

  const tags = collectTags(entries).slice(0, 24)
  const activeCount =
    filters.eras.length + filters.categories.length + filters.verdicts.length + filters.origins.length + filters.tags.length

  return (
    <aside className="border border-gold/40 p-4" style={{ backgroundColor: 'var(--c-paper)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serifzh font-bold text-lg">卷宗检索台</h2>
        <span className="text-xs text-inksoft">
          {shown}/{total} 卷
        </span>
      </div>

      <div className="mb-4 flex gap-1 items-center text-sm">
        <span className="text-inksoft text-xs mr-1">排序</span>
        {(
          [
            ['era', '时代'],
            ['updated', '更新'],
            ['title', '标题']
          ] as [SortKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={sort === key}
            className={`px-2 py-0.5 border ${
              sort === key ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
            }`}
            onClick={() => onChange(filters, key)}
          >
            {label}
          </button>
        ))}
      </div>

      <Group title="时代" items={ERAS} selected={filters.eras} onToggle={toggle('eras')} />
      <Group title="分类" items={CATEGORIES} selected={filters.categories} onToggle={toggle('categories')} />
      <Group title="评级" items={VERDICTS} selected={filters.verdicts} onToggle={toggle('verdicts')} />
      <Group title="谣言来源" items={ORIGINS.map((o) => ({ key: o, label: o }))} selected={filters.origins} onToggle={toggle('origins')} />

      {tags.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xs tracking-[0.3em] text-inksoft mb-2 border-b border-gold/30 pb-1">标签</h3>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => {
              const active = filters.tags.includes(tag)
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={`px-1.5 py-0.5 text-xs border ${
                      active ? 'border-seal text-seal bg-seal/10' : 'border-gold/40 text-inksoft'
                    }`}
                    onClick={() => toggle('tags')(tag)}
                  >
                    {tag}
                    <span className="ml-1 opacity-60">{count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mb-4">
        <h3 className="text-xs tracking-[0.3em] text-inksoft mb-2 border-b border-gold/30 pb-1">已读</h3>
        <div className="flex gap-1.5">
          {(
            [
              ['all', '全部'],
              ['unread', '未读'],
              ['read', '已读']
            ] as [BrowseFilters['readState'], string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filters.readState === key}
              className={`px-2 py-0.5 text-sm border ${
                filters.readState === key
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-gold/30 text-inksoft'
              }`}
              onClick={() => onChange({ ...filters, readState: key }, sort)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {activeCount > 0 && (
        <button
          type="button"
          className="w-full py-1 text-sm text-seal border border-seal/50 hover:bg-seal/10"
          onClick={() =>
            onChange({ ...filters, eras: [], categories: [], verdicts: [], origins: [], tags: [] }, sort)
          }
        >
          清空 {activeCount} 项筛选
        </button>
      )}
    </aside>
  )
}
