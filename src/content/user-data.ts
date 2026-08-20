const KEY = 'rumor-archive:user-data'

export interface UserData {
  bookmarks: string[]
  read: string[]
  recent: string[]
  fontSize: 'small' | 'normal' | 'large'
  /** 卷宗浏览次数（馆志统计用） */
  views: Record<string, number>
  /** 首次开馆日期 ISO（建馆纪念） */
  openedAt: string | null
  /** 下架（隐藏）的档号清单——内置卷宗无法物理删除，下架即全馆隐藏 */
  retired: string[]
}

const DEFAULT: UserData = {
  bookmarks: [],
  read: [],
  recent: [],
  fontSize: 'normal',
  views: {},
  openedAt: null,
  retired: []
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<UserData>
    return {
      bookmarks: parsed.bookmarks ?? [],
      read: parsed.read ?? [],
      recent: parsed.recent ?? [],
      fontSize: parsed.fontSize ?? 'normal',
      views: parsed.views ?? {},
      openedAt: parsed.openedAt ?? null,
      retired: parsed.retired ?? []
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* localStorage 不可用时静默降级（仅丢失用户标记） */
  }
}
