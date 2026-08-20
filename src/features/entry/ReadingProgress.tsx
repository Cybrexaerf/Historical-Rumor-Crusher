import { useEffect, useState } from 'react'

/** 卷宗封条样式的阅读进度条 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? Math.min(1, doc.scrollTop / total) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-1"
      role="progressbar"
      aria-label="阅读进度"
    >
      <div
        className="h-full transition-[width] duration-150"
        style={{
          width: `${progress * 100}%`,
          backgroundColor: 'var(--c-seal)',
          backgroundRepeat: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,0.08) 6px 12px)'
        }}
      />
    </div>
  )
}
