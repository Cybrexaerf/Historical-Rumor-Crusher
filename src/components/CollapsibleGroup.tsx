import { useState } from 'react'

export interface CollapsibleGroupProps {
  title: string
  /** 选中项数量（显示徽章） */
  selectedCount?: number
  /** 受控展开态 */
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

/** 检索台手风琴分组：标题行整行可点，选中数徽章提示 */
export default function CollapsibleGroup({
  title,
  selectedCount = 0,
  open,
  onToggle,
  children
}: CollapsibleGroupProps) {
  return (
    <section className="mb-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-2 text-left border-b border-gold/25 hover:border-gold/60 transition-colors"
      >
        <span
          aria-hidden
          className="text-xs transition-transform duration-200 w-3 text-inksoft"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        <span className="text-xs tracking-[0.3em] text-inksoft">{title}</span>
        {selectedCount > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 border border-seal text-seal bg-seal/10 tabular-nums">
            {selectedCount}
          </span>
        )}
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? 'var(--grp-max, 480px)' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pt-2 pb-3">{children}</div>
      </div>
    </section>
  )
}

/** 展开/收起状态记忆（localStorage 持久化） */
export function useGroupOpenState(storageKey: string, defaultOpen: string[]) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return new Set(JSON.parse(raw) as string[])
    } catch {
      /* 忽略损坏数据 */
    }
    return new Set(defaultOpen)
  })

  const persist = (next: Set<string>) => {
    setOpenGroups(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]))
    } catch {
      /* 静默 */
    }
  }

  const toggle = (key: string) => {
    const next = new Set(openGroups)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    persist(next)
  }

  const setAll = (open: boolean, keys: string[]) => {
    persist(open ? new Set(keys) : new Set())
  }

  return { openGroups, toggle, setAll }
}
