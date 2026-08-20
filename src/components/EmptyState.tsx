import Seal from './Seal.tsx'

interface EmptyStateProps {
  /** 印章文字（2 字最佳） */
  stamp?: string
  title: string
  hint?: string
  children?: React.ReactNode
}

/** 空态人格化：印章 + 档案馆口吻 */
export default function EmptyState({ stamp = '未立', title, hint, children }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-gold/50 p-10 text-center" style={{ backgroundColor: 'var(--c-paper)' }}>
      <div className="flex justify-center mb-3">
        <Seal text={stamp} size={56} color="var(--c-verdict-open)" />
      </div>
      <p className="font-serifzh font-bold text-lg">{title}</p>
      {hint && <p className="text-sm text-inksoft mt-1">{hint}</p>}
      {children}
    </div>
  )
}
