const KEY = 'rumor-archive:corrections'

export type CorrectionStatus = 'pending' | 'accepted' | 'rejected'

export interface Correction {
  /** 唯一 id（提交时间戳+随机） */
  id: string
  entryId: string
  entryTitle: string
  /** 错误位置（章节/段落/原句） */
  location: string
  /** 勘误依据 */
  evidence: string
  /** 提出者联系方式（可空） */
  contact: string
  submittedAt: string
  status: CorrectionStatus
  /** 馆主批注（驳回理由等） */
  note?: string
}

/** 勘误单导出文件的格式 */
export interface CorrectionFile {
  app: 'rumor-archive'
  type: 'correction'
  version: 1
  entryId: string
  entryTitle: string
  location: string
  evidence: string
  contact: string
  submittedAt: string
}

export function loadCorrections(): Correction[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Correction[]) : []
  } catch {
    return []
  }
}

export function saveCorrections(list: Correction[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 存储不可用时静默 */
  }
}

export function addCorrection(file: CorrectionFile): Correction {
  const list = loadCorrections()
  const correction: Correction = { ...file, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, status: 'pending' }
  saveCorrections([correction, ...list])
  return correction
}

export function setCorrectionStatus(id: string, status: CorrectionStatus, note?: string): void {
  const list = loadCorrections().map((c) => (c.id === id ? { ...c, status, note: note ?? c.note } : c))
  saveCorrections(list)
}

export function removeCorrection(id: string): void {
  saveCorrections(loadCorrections().filter((c) => c.id !== id))
}

export function hasAcceptedCorrections(): boolean {
  return loadCorrections().some((c) => c.status === 'accepted')
}

/** 解析勘误单 JSON 文本（朋友发来的文件） */
export function parseCorrectionFile(text: string): { ok: true; file: CorrectionFile } | { ok: false; error: string } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'JSON 解析失败' }
  }
  const d = data as Partial<CorrectionFile>
  if (d.app !== 'rumor-archive' || d.type !== 'correction' || typeof d.entryId !== 'string') {
    return { ok: false, error: '不是本馆勘误单格式' }
  }
  if (!d.evidence || !d.location) {
    return { ok: false, error: '勘误单缺少「错误位置」或「依据」' }
  }
  return {
    ok: true,
    file: {
      app: 'rumor-archive',
      type: 'correction',
      version: 1,
      entryId: d.entryId,
      entryTitle: d.entryTitle ?? '',
      location: d.location,
      evidence: d.evidence,
      contact: d.contact ?? '',
      submittedAt: d.submittedAt ?? new Date().toISOString()
    }
  }
}
