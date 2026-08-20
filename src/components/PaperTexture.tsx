interface PaperTextureProps {
  children?: React.ReactNode
  className?: string
}

const NOISE_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.48 0 0 0 0 0.33 0 0 0 0.05 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>`
)}`

/** 泛黄纸卷质感底（纯 SVG 噪点，无位图、无外链） */
export default function PaperTexture({ children, className = '' }: PaperTextureProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundColor: 'var(--c-paper)',
        backgroundImage: `url("${NOISE_SVG}")`
      }}
    >
      {children}
    </div>
  )
}
