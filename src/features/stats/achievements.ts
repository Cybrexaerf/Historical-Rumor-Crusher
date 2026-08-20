import type { UserData } from '../../content/user-data.ts'
import type { MergedIndex } from '../../content/merge.ts'
import { ERAS } from '../../content/schema.ts'

export interface Achievement {
  id: string
  name: string
  desc: string
  /** 印章用 2 字 */
  stamp: string
  earned: boolean
}

export interface AchievementInput {
  user: Pick<UserData, 'read' | 'bookmarks' | 'openedAt'>
  merged: Pick<MergedIndex, 'entries'>
  /** 是否有已采纳的勘误 */
  hasAcceptedCorrection: boolean
}

export function computeAchievements(input: AchievementInput): Achievement[] {
  const { user, merged, hasAcceptedCorrection } = input
  const read = new Set(user.read)
  const readCount = user.read.length

  const erasComplete = ERAS.some((era) => {
    const items = merged.entries.filter((e) => e.meta.era === era.key)
    return items.length >= 3 && items.every((e) => read.has(e.id))
  })

  const daysOpen = user.openedAt
    ? Math.floor((Date.now() - new Date(user.openedAt).getTime()) / 86400000)
    : 0

  return [
    { id: 'founding', name: '开馆', desc: '首次踏入档案馆', stamp: '开馆', earned: !!user.openedAt },
    { id: 'first-read', name: '初窥门径', desc: '读完第一份卷宗', stamp: '初窥', earned: readCount >= 1 },
    { id: 'well-read', name: '博览群书', desc: '累计读完 10 份卷宗', stamp: '博览', earned: readCount >= 10 },
    { id: 'collector', name: '藏书家', desc: '累计读完 100 份卷宗', stamp: '藏书', earned: readCount >= 100 },
    { id: 'era-master', name: '通读一朝代', desc: '读完某一时段全部卷宗（≥3 卷）', stamp: '通读', earned: erasComplete },
    { id: 'curator', name: '收藏家', desc: '书架收藏 10 份卷宗', stamp: '珍藏', earned: user.bookmarks.length >= 10 },
    {
      id: 'corrector',
      name: '勘误协助者',
      desc: '一条勘误被本馆采纳',
      stamp: '勘误',
      earned: hasAcceptedCorrection
    },
    { id: 'monthly', name: '开馆月纪念', desc: '本馆开馆满 30 天', stamp: '月纪', earned: daysOpen >= 30 }
  ]
}
