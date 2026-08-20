import { z } from 'zod'
import {
  CATEGORY_KEYS,
  ERA_KEYS,
  EVIDENCE_LEVELS,
  ORIGINS,
  REFERENCE_TYPES,
  VERDICT_KEYS
} from './schema.ts'

/** Front-matter 校验（仅懒加载路径引用，避免 zod 进入首包） */

export const ReferenceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, '引用 id 须为小写字母数字连字符'),
  type: z.enum(REFERENCE_TYPES),
  text: z.string().min(1, '引用内容不能为空')
})

export const EntryMetaSchema = z
  .object({
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
  })
  .refine((m) => new Set(m.references.map((r) => r.id)).size === m.references.length, {
    message: '参考文献 id 重复',
    path: ['references']
  })
