import { CATEGORIES, ERAS, ORIGINS, VERDICTS } from '../../content/schema.ts'
import type { BrowseFilters, SortKey } from './filters.ts'
import { collectTags } from './filters.ts'
import type { MergedEntry } from '../../content/merge.ts'
import CollapsibleGroup, { useGroupOpenState } from '../../components/CollapsibleGroup.tsx'

interface FiltersPanelProps {
  filters: BrowseFilters
  sort: SortKey
  total: number
  shown: number
  entries: MergedEntry[]
  onChange: (filters: BrowseFilters, sort: SortKey) => void
}

const GROUP_KEYS = ['era', 'cat', 'verdict', 'origin', 'tags', 'read'] as const

function ChipList({
  items,
  selected,
  onToggle,
  small = false
}: {
  items: readonly { key: string; label: string; count?: number }[]
  selected: string[]
  onToggle: (key: string) => void
  small?: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = selected.includes(item.key)
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={active}
              className={`border transition-colors ${
                small ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-sm'
              } ${
                active
                  ? 'border-seal text-seal bg-seal/10'
                  : 'border-gold/40 text-inksoft hover:border-gold hover:text-ink'
              }`}
              onClick={() => onToggle(item.key)}
            >
              {item.label}
              {item.count !== undefined && <span className="ml-1 opacity-60">{item.count}</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function FiltersPanel({ filters, sort, total, shown, entries, onChange }: FiltersPanelProps) {
  const { openGroups, toggle, setAll } = useGroupOpenState('rumor-archive:filter-groups', ['era'])

  const toggleIn = (key: keyof BrowseFilters) => (value: string) => {
    const list = filters[key] as string[]
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    onChange({ ...filters, [key]: next }, sort)
  }

  const tags = collectTags(entries).slice(0, 30)
  const activeCount =
    filters.eras.length + filters.categories.length + filters.verdicts.length + filters.origins.length + filters.tags.length

  const allOpen = GROUP_KEYS.every((k) => openGroups.has(k))

  return (
    <aside className="border border-gold/40 p-4 self-start lg:sticky lg:top-20" style={{ backgroundColor: 'var(--c-paper)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serifzh font-bold text-lg">卷宗检索台</h2>
        <span className="text-xs text-inksoft tabular-nums">
          {shown}/{total} 卷
        </span>
      </div>

      <div className="mb-3 flex gap-1 items-center text-sm flex-wrap">
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
        <button
          type="button"
          className="ml-auto text-xs text-inksoft underline decoration-dotted underline-offset-4 hover:text-seal"
          onClick={() => setAll(!allOpen, [...GROUP_KEYS])}
        >
          {allOpen ? '全部收起' : '全部展开'}
        </button>
      </div>

      <CollapsibleGroup title="时代" selectedCount={filters.eras.length} open={openGroups.has('era')} onToggle={() => toggle('era')}>
        <ChipList items={ERAS} selected={filters.eras} onToggle={toggleIn('eras')} />
      </CollapsibleGroup>

      <CollapsibleGroup title="分类" selectedCount={filters.categories.length} open={openGroups.has('cat')} onToggle={() => toggle('cat')}>
        <ChipList items={CATEGORIES} selected={filters.categories} onToggle={toggleIn('categories')} />
      </CollapsibleGroup>

      <CollapsibleGroup title="评级" selectedCount={filters.verdicts.length} open={openGroups.has('verdict')} onToggle={() => toggle('verdict')}>
        <ChipList
          items={VERDICTS.map((v) => ({ key: v.key, label: v.label }))}
          selected={filters.verdicts}
          onToggle={toggleIn('verdicts')}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="谣言来源" selectedCount={filters.origins.length} open={openGroups.has('origin')} onToggle={() => toggle('origin')}>
        <ChipList items={ORIGINS.map((o) => ({ key: o, label: o }))} selected={filters.origins} onToggle={toggleIn('origins')} />
      </CollapsibleGroup>

      {tags.length > 0 && (
        <CollapsibleGroup title="标签" selectedCount={filters.tags.length} open={openGroups.has('tags')} onToggle={() => toggle('tags')}>
          <div className="max-h-52 overflow-y-auto pr-1">
            <ChipList
              items={tags.map((t) => ({ key: t.tag, label: t.tag, count: t.count }))}
              selected={filters.tags}
              onToggle={toggleIn('tags')}
              small
            />
          </div>
        </CollapsibleGroup>
      )}

      <CollapsibleGroup
        title="已读"
        selectedCount={filters.readState !== 'all' ? 1 : 0}
        open={openGroups.has('read')}
        onToggle={() => toggle('read')}
      >
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
                filters.readState === key ? 'border-gold text-gold bg-gold/10' : 'border-gold/30 text-inksoft'
              }`}
              onClick={() => onChange({ ...filters, readState: key }, sort)}
            >
              {label}
            </button>
          ))}
        </div>
      </CollapsibleGroup>

      {activeCount > 0 && (
        <button
          type="button"
          className="w-full mt-3 py-1 text-sm text-seal border border-seal/50 hover:bg-seal/10"
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
