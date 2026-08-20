import type { FulltextDoc } from '../content/schema.ts'
import type { SearchHit } from './engine.ts'
import type { OutboundMsg } from './worker.ts'

const chunkLoaders = import.meta.glob('../generated/data/chunks/*.json') as Record<
  string,
  () => Promise<{ default: FulltextDoc[] }>
>

interface PendingQuery {
  query: string
  resolve: (hits: SearchHit[]) => void
  reject: (err: Error) => void
}

let worker: Worker | null = null
let engineFallback: typeof import('./engine.ts') | null = null
let pending: PendingQuery[] = []
let ready: Promise<void> | null = null

async function loadDocs(): Promise<FulltextDoc[]> {
  const all: FulltextDoc[] = []
  for (const loader of Object.values(chunkLoaders)) {
    const mod = await loader()
    all.push(...(mod.default ?? (mod as unknown as FulltextDoc[])))
  }
  return all
}

function settleBuilt(): void {
  const queue = pending
  pending = []
  for (const p of queue) void runSearch(p.query).then(p.resolve, p.reject)
}

async function init(): Promise<void> {
  const docs = await loadDocs()
  try {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  } catch {
    worker = null
  }
  if (worker) {
    let builtResolve: (() => void) | null = null
    worker.onmessage = (e: MessageEvent<OutboundMsg>) => {
      if (e.data.type === 'built') {
        builtResolve?.()
        return
      }
      const msg = e.data
      pending = pending.filter((p) => {
        if (p.query === msg.query) {
          p.resolve(msg.hits)
          return false
        }
        return true
      })
    }
    const built = new Promise<void>((resolve, reject) => {
      builtResolve = resolve
      worker!.onerror = (err) => reject(err)
      setTimeout(resolve, 5000)
    })
    worker.postMessage({ type: 'build', docs })
    try {
      await built
      return
    } catch {
      worker = null
    }
  }
  engineFallback = await import('./engine.ts')
  engineFallback.buildIndex(docs)
}

function runSearch(query: string, limit = 50): Promise<SearchHit[]> {
  if (worker) {
    return new Promise<SearchHit[]>((resolve, reject) => {
      pending.push({ query, resolve, reject })
      worker!.postMessage({ type: 'query', query, limit })
    })
  }
  if (engineFallback) return Promise.resolve(engineFallback.search(query, limit))
  return Promise.resolve([])
}

/** 首次调用时懒初始化（Worker 失败自动降级主线程引擎）；后续直接查询 */
export async function searchIndex(query: string, limit = 50): Promise<SearchHit[]> {
  if (!ready) {
    ready = init().then(() => {
      settleBuilt()
    })
  }
  await ready
  if (!query.trim()) return []
  return runSearch(query, limit)
}
