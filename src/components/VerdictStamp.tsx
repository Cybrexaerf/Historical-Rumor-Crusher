import { verdictMeta } from '../content/schema.ts'
import Seal from './Seal'

interface VerdictStampProps {
  verdict: string
  size?: number
  animated?: boolean
  showLabel?: boolean
}

/** 评级章：已证伪/部分属实/存疑/无定论 */
export default function VerdictStamp({
  verdict,
  size = 64,
  animated = false,
  showLabel = true
}: VerdictStampProps) {
  const meta = verdictMeta(verdict)
  const label = meta?.label ?? verdict
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <Seal text={label.slice(0, 2)} color={meta?.color} size={size} animated={animated} />
      {showLabel && (
        <span className="text-sm" style={{ color: meta?.color, fontWeight: meta?.weight }}>
          {label}
        </span>
      )}
    </span>
  )
}
