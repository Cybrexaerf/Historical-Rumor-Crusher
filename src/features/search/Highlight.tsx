interface HighlightProps {
  text: string
  terms: string[]
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 命中词朱红下划线标注 */
export default function Highlight({ text, terms }: HighlightProps) {
  const valid = terms.filter((t) => t.trim().length > 0)
  if (valid.length === 0) return <>{text}</>
  const re = new RegExp(`(${valid.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark
            key={i}
            className="bg-transparent text-seal font-bold underline decoration-seal/60 decoration-2 underline-offset-2"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
