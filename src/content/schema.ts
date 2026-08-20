import { z } from 'zod'

/** 受控词表 —— 全库唯一定义处（红线 6） */

export const ERAS = [
  { key: 'xianqin', label: '先秦' },
  { key: 'qinhan', label: '秦汉' },
  { key: 'weijin', label: '魏晋南北朝' },
  { key: 'suitang', label: '隋唐' },
  { key: 'songyuan', label: '宋元' },
  { key: 'ming', label: '明' },
  { key: 'qing', label: '清' },
  { key: 'modern', label: '近现代' }
] as const
export type EraKey = 'xianqin' | 'qinhan' | 'weijin' | 'suitang' | 'songyuan' | 'ming' | 'qing' | 'modern'
export const ERA_KEYS = ['xianqin', 'qinhan', 'weijin', 'suitang', 'songyuan', 'ming', 'qing', 'modern'] as const
export const eraLabel = (key: string): string => ERAS.find((e) => e.key === key)?.label ?? key

export const CATEGORIES = [
  { key: 'royal', label: '帝王身世与宫廷' },
  { key: 'war', label: '战争与军事' },
  { key: 'figures', label: '名人轶事' },
  { key: 'texts', label: '文化典籍与文献' },
  { key: 'tech', label: '科技与发明' },
  { key: 'society', label: '社会生活与制度' },
  { key: 'modern', label: '近现代史' }
] as const
export type CategoryKey =
  | 'royal' | 'war' | 'figures' | 'texts' | 'tech' | 'society' | 'modern'
export const CATEGORY_KEYS = ['royal', 'war', 'figures', 'texts', 'tech', 'society', 'modern'] as const
export const categoryLabel = (key: string): string =>
  CATEGORIES.find((c) => c.key === key)?.label ?? key

export const VERDICTS = [
  { key: 'refuted', label: '已证伪', color: 'var(--c-seal)', weight: 'bold' },
  { key: 'partial', label: '部分属实', color: 'var(--c-verdict-partial)', weight: 'bold' },
  { key: 'disputed', label: '存疑', color: 'var(--c-verdict-disputed)', weight: 'normal' },
  { key: 'open', label: '无定论', color: 'var(--c-verdict-open)', weight: 'normal' }
] as const
export type VerdictKey = 'refuted' | 'partial' | 'disputed' | 'open'
export const VERDICT_KEYS = ['refuted', 'partial', 'disputed', 'open'] as const
export const verdictMeta = (key: string) => VERDICTS.find((v) => v.key === key)

export const ORIGINS = ['文学演绎', '讹传', '伪史', '网络新造', '影视误导'] as const
export type OriginKey = (typeof ORIGINS)[number]

export const EVIDENCE_LEVELS = ['strong', 'medium', 'weak'] as const
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]
export const evidenceLabel = (key: string): string =>
  ({ strong: '史料充分', medium: '史料中等', weak: '史料薄弱' })[key] ?? key

export const REFERENCE_TYPES = ['ancient', 'modern', 'journal', 'web'] as const
export type ReferenceType = (typeof REFERENCE_TYPES)[number]

/** Front-matter Schema */

export const ReferenceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, '引用 id 须为小写字母数字连字符'),
  type: z.enum(REFERENCE_TYPES),
  text: z.string().min(1, '引用内容不能为空')
})

export const EntryMetaSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id 须为 kebab-case'),
  title: z.string().min(1).max(60),
  rumor: z.string().min(1).max(300),
  verdict: z.enum(VERDICT_KEYS),
  era: z.enum(ERA_KEYS),
  category: z.enum(CATEGORY_KEYS),
  tags: z.array(z.coerce.string().min(1).max(12)).min(1).max(8),
  origin: z.enum(ORIGINS),
  evidence: z.enum(EVIDENCE_LEVELS),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'updated 须为 YYYY-MM-DD'),
  revision: z.number().int().min(1).default(1),
  references: z.array(ReferenceSchema).min(1, '至少一条参考文献')
}).refine(
  (m) => new Set(m.references.map((r) => r.id)).size === m.references.length,
  { message: '参考文献 id 重复', path: ['references'] }
)
export type EntryMeta = z.infer<typeof EntryMetaSchema>
export type Reference = z.infer<typeof ReferenceSchema>

/** 正文区块键 */
export const SECTION_KEYS = ['rumor-origin', 'spread', 'evidence', 'verdict'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const SECTION_TITLES: Record<string, SectionKey> = {
  谣言溯源: 'rumor-origin',
  流传脉络: 'spread',
  史料考证: 'evidence',
  真相结论: 'verdict'
}
export const SECTION_LABELS: Record<SectionKey, string> = {
  'rumor-origin': '谣言溯源',
  spread: '流传脉络',
  evidence: '史料考证',
  verdict: '真相结论'
}
/** 必含区块（流传脉络可选） */
export const REQUIRED_SECTIONS: SectionKey[] = ['rumor-origin', 'evidence', 'verdict']

export interface Entry {
  meta: EntryMeta
  bodyHtml: string
}

export interface Manifest {
  builtAt: string
  total: number
  stats: Record<string, number>
  entries: EntryMeta[]
}

export interface FulltextDoc {
  id: string
  title: string
  rumor: string
  fulltext: string
  pinyinFull: string
  pinyinInitials: string
}
