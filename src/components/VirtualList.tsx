import { useRef, useState, type UIEvent } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  viewportHeight: number
  overscan?: number
  getKey: (item: T, index: number) => string
  render: (item: T, index: number) => React.ReactNode
  className?: string
}

/** 零依赖窗口化列表：千条滚动 60fps */
export default function VirtualList<T>({
  items,
  itemHeight,
  viewportHeight,
  overscan = 8,
  getKey,
  render,
  className = ''
}: VirtualListProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const total = items.length * itemHeight
  const first = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visible = Math.ceil(viewportHeight / itemHeight) + overscan * 2
  const slice = items.slice(first, first + visible)

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={ref}
      className={`overflow-y-auto ${className}`}
      style={{ height: viewportHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: total, position: 'relative' }} role="list">
        {slice.map((item, i) => (
          <div
            key={getKey(item, first + i)}
            role="listitem"
            style={{ position: 'absolute', top: (first + i) * itemHeight, left: 0, right: 0, height: itemHeight }}
          >
            {render(item, first + i)}
          </div>
        ))}
      </div>
    </div>
  )
}
