import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArchive } from '../content/store.ts'
import { pickRandom } from '../features/random/random.ts'

/** 应用启动：初始化内容仓库；提供全局「随机调阅」 */
export function useAppInit(): void {
  const init = useArchive((s) => s.init)
  useEffect(() => {
    void init()
  }, [init])
}

export function RandomButton({ className = '' }: { className?: string }) {
  const entries = useArchive((s) => s.merged.entries)
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className={`border border-seal/60 text-seal px-3 py-1 text-sm hover:bg-seal/10 transition-colors ${className}`}
      onClick={() => {
        const pick = pickRandom(entries)
        if (pick) navigate(`/entry/${pick.id}`)
      }}
    >
      随机调阅
    </button>
  )
}
