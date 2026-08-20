import { useRef, useState } from 'react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

/** md 拖拽导入区 */
export default function DropZone({ onFiles }: DropZoneProps) {
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
        over ? 'border-seal bg-seal/5' : 'border-gold/60'
      }`}
      style={{ backgroundColor: 'var(--c-paper)' }}
      role="button"
      tabIndex={0}
      aria-label="拖入或选择 md 文件导入"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const files = [...e.dataTransfer.files].filter((f) => f.name.toLowerCase().endsWith('.md'))
        if (files.length > 0) onFiles(files)
      }}
    >
      <p className="font-serifzh font-bold text-lg mb-1">将 .md 卷宗拖入此处</p>
      <p className="text-sm text-inksoft">或点击选择文件（支持多选；仅接受 .md）</p>
      <input
        ref={inputRef}
        type="file"
        accept=".md"
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])]
          if (files.length > 0) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
