interface PaperCardProps {
  children: React.ReactNode
  className?: string
  /** 边缘微焦黄加深 */
  deep?: boolean
}

/** 卷宗纸卡容器：暗金 hairline 边 + 微焦黄边缘 */
export default function PaperCard({ children, className = '', deep = false }: PaperCardProps) {
  return (
    <div
      className={`relative border border-gold/50 ${className}`}
      style={{
        backgroundColor: deep ? 'var(--c-paper-deep)' : 'var(--c-paper)',
        boxShadow: 'inset 0 0 0 1px rgba(138,109,47,0.08), 0 1px 4px rgba(43,38,32,0.12)'
      }}
    >
      {children}
    </div>
  )
}
