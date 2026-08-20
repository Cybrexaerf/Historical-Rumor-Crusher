/**
 * 馆主配置 —— 部署到 GitHub Pages 后填写，即可启用「在线勘误（GitHub Issue）」。
 * 留空时在线勘误入口自动隐藏，本地勘误单方式始终可用。
 */
export const GITHUB_REPO = 'Cybrexaerf/Historical-Rumor-Crusher' // 例：'yourname/rumor-archive'（不要带 https:// 前缀）

/** 当前是否运行在部署站点（http/https）而非 file:// */
export function isOnline(): boolean {
  return typeof location !== 'undefined' && location.protocol.startsWith('http')
}

/** 生成预填好的 GitHub Issue 新建链接 */
export function githubIssueUrl(title: string, body: string): string | null {
  if (!GITHUB_REPO || !isOnline()) return null
  const params = new URLSearchParams({ title, body })
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`
}
