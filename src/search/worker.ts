import { buildIndex, search } from './engine.ts'

const MSG = { build: 'build', query: 'query' } as const

export interface BuildMsg {
  type: typeof MSG.build
  docs: Parameters<typeof buildIndex>[0]
}
export interface QueryMsg {
  type: typeof MSG.query
  query: string
  limit?: number
}
export type InboundMsg = BuildMsg | QueryMsg

export type OutboundMsg =
  | { type: 'built'; count: number }
  | { type: 'results'; query: string; hits: ReturnType<typeof search> }

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<InboundMsg>) => void) | null
  postMessage: (m: OutboundMsg) => void
}

ctx.onmessage = (e: MessageEvent<InboundMsg>) => {
  const msg = e.data
  if (msg.type === MSG.build) {
    buildIndex(msg.docs)
    ctx.postMessage({ type: 'built', count: msg.docs.length })
  } else if (msg.type === MSG.query) {
    const hits = search(msg.query, msg.limit ?? 50)
    ctx.postMessage({ type: 'results', query: msg.query, hits })
  }
}
