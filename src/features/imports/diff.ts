export interface DiffRow {
  type: 'same' | 'add' | 'del'
  text: string
}

/** 简易行级 LCS diff（供两版卷宗对照） */
export function lineDiff(a: string, b: string): DiffRow[] {
  const A = a.split(/\r?\n/)
  const B = b.split(/\r?\n/)
  const n = A.length
  const m = B.length
  if (n * m > 4_000_000) {
    return [...A.map((text) => ({ type: 'del' as const, text })), ...B.map((text) => ({ type: 'add' as const, text }))]
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const rows: DiffRow[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      rows.push({ type: 'same', text: A[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'del', text: A[i] })
      i++
    } else {
      rows.push({ type: 'add', text: B[j] })
      j++
    }
  }
  while (i < n) rows.push({ type: 'del', text: A[i++] })
  while (j < m) rows.push({ type: 'add', text: B[j++] })
  return rows
}
