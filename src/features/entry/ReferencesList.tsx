import { useState } from 'react'
import type { EntryMeta } from '../../content/schema.ts'

const TYPE_LABEL: Record<string, string> = {
  ancient: '古籍',
  modern: '出版物',
  journal: '论文',
  web: '存档网页'
}

/** 卷尾「卷内备考」：GB/T 7714 参考文献列表，可复制、可跳回正文引用处 */
export default function ReferencesList({ meta }: { meta: EntryMeta }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* file:// 下剪贴板可能受限，静默 */
    }
  }

  return (
    <section className="mt-12 border-t-2 border-double border-gold/60 pt-6">
      <h2 className="font-serifzh font-black text-xl tracking-[0.3em] mb-4">卷内备考 · 参考文献</h2>
      <ol className="space-y-2">
        {meta.references.map((ref, i) => (
          <li key={ref.id} className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="text-gold font-bold shrink-0">[{i + 1}]</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-inksoft border border-gold/40 px-1 mr-2 align-middle">
                {TYPE_LABEL[ref.type] ?? ref.type}
              </span>
              {ref.text}
              <span className="text-xs text-inksoft ml-2">[^{ref.id}]</span>
            </div>
            <button
              type="button"
              className="text-xs text-gold border border-gold/50 px-2 py-0.5 shrink-0 hover:bg-gold/10"
              onClick={() => void copy(ref.text, ref.id)}
            >
              {copied === ref.id ? '已复制' : '复制'}
            </button>
          </li>
        ))}
      </ol>
      <p className="text-xs text-inksoft mt-4">
        引用格式：GB/T 7714；古籍条目按传统引法混排。文中上标 [n] 可悬浮查看出处。
      </p>
    </section>
  )
}
