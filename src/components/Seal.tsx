interface SealProps {
  text: string
  color?: string
  size?: number
  /** 印文方向：竖排（方章） */
  vertical?: boolean
  className?: string
  animated?: boolean
}

/** 印章：朱红描边方章 + 网纹残缺感（纯 CSS，无位图） */
export default function Seal({
  text,
  color = 'var(--c-seal)',
  size = 64,
  vertical = true,
  className = '',
  animated = false
}: SealProps) {
  return (
    <span
      aria-label={`印章：${text}`}
      role="img"
      className={`inline-flex items-center justify-center select-none ${animated ? 'anim-stamp' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 16)}px solid ${color}`,
        color,
        writingMode: vertical ? 'vertical-rl' : 'horizontal-tb',
        fontFamily: '"Noto Serif SC", "Source Han Serif SC", SimSun, serif',
        fontWeight: 900,
        fontSize: size / 3.2,
        letterSpacing: size / 12,
        transform: `rotate(${((text.length * 37) % 7) - 3}deg)`,
        opacity: 0.92,
        maskImage:
          'radial-gradient(circle at 30% 20%, transparent 0 2px, black 3px), radial-gradient(circle at 80% 90%, transparent 0 1px, black 2px)',
        WebkitMaskImage: 'none'
      }}
    >
      {text}
    </span>
  )
}
