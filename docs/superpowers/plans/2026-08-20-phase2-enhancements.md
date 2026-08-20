# 史实勘误局 · 二期 Enhancement Plan（设计改造 / 富媒体 / 馆志 / 分发反馈）

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在既有档案馆应用上完成四项增强：前端设计深度改造、表格/图片/SVG 关系图富媒体支持、馆志统计面板与成就系统、GitHub Pages 托管与勘误反馈闭环。

**用户决策：** 托管 GitHub Pages；关系图用 SVG 资产图；图片为自藏+AI生成（无版权风险）；实施顺序 设计→富媒体→统计→分发。

**Spec:** `docs/specs/2026-08-20-history-rumor-archive-design.md`（一期）；本文件为二期增补。

---

## Phase A：设计深度改造

**Files:** `src/design/animations.css`, `src/index.css`, `src/features/landing/Hero.tsx`, `src/features/landing/Landing.tsx`, `src/components/Seal.tsx`, `src/features/entry/SectionRenderer.tsx`, `src/features/entry/EntryPage.tsx`, `src/features/search/SearchPage.tsx`, `src/components/EmptyState.tsx`（新建）

- [x] A1 动效库扩充：`page-turn`（进场翻阅）、`stamp-shake`（盖章余震并入 stamp-press）、`dust-float`（尘粒漂浮）、`ellipsis`（调档中省略号）；reduced-motion 全降级
- [x] A2 Hero 满版档案桌面场景：暖光锥（SVG 渐变）+ 档案堆剪影 + 尘粒粒子层（纯 CSS 动画，aria-hidden）
- [x] A3 辟谣红线 scroll-driven 生长：path 总长 dasharray，滚动进度驱动 dashoffset；reduced-motion 下直接全显
- [x] A4 印章印泥洇染增强（多层径向渐变 mask + 微模糊）
- [x] A5 排版精修：考证区块首字下沉（3 行衬线大字）、段首「◆」编目符、表格档案馆样式（暗金细框）、图片档案框样式（金框+纸衬底）
- [x] A6 卷宗页：进场 page-turn、纸面四角裁切线装饰、卷尾「本卷为馆藏第 N 卷 / 共 M 卷」
- [x] A7 空态/加载态人格化：EmptyState 组件（「此档未立」印章风）；检索「调档中…」状态
- [x] A8 `npm run build` + 全测试 + commit `feat: design deep revamp`

## Phase B：富媒体（表格 / 图片 / SVG 关系图）

**Files:** `scripts/build-content.mts`, `scripts/copy-assets.mts`（新建）, `scripts/rewrite-images.mts`（新建）, `package.json`, `src/index.css`, `content/assets/**`（新建）, `docs/ai-authoring-guide.md`

- [x] B1 `rewrite-images.mts`：`rewriteImagePaths(raw, id)` —— md 中 `![](./x.png)` 等相对路径（非 http/assets 开头）重写为 `./assets/content/<id>/x.png`；含单测
- [x] B2 `build-content.mts` 接入重写（两段式：先取 id 再重写再 parseEntry）
- [x] B3 `copy-assets.mts`：vite build 之后把 `content/assets/**` 复制到 `dist/assets/content/**`；build 链更新为 content → vite → copy-assets → check-offline
- [x] B4 index.css：表格（`border-collapse`+暗金框+表头加重）、img（max-width+金框+纸衬底+可选说明行）
- [x] B5 示例落地：fenshu-kengru 加「烧/不烧」对照表；zhenghe-meizhou 配 SVG 航线对照示意图（自绘 SVG 入 content/assets）
- [x] B6 `docs/ai-authoring-guide.md` 增补：表格语法、图片放 `content/assets/<id>/`、SVG 关系图制作规范（AI 生成 SVG 的要求：无外链字体/脚本、viewBox 自适应、档案配色）
- [x] B7 commit `feat: rich media - table styling and image/svg asset pipeline`

## Phase C：馆志年报（统计面板 + 成就）

**Files:** `src/content/user-data.ts`, `src/content/store.ts`, `src/features/entry/EntryPage.tsx`, `src/features/stats/StatsPage.tsx`（新建）, `src/features/stats/achievements.ts`（新建+测试）, `src/App.tsx`, `src/app/Layout.tsx`

- [x] C1 user-data 扩展：`views: Record<string, number>`、`openedAt: string`（首次开馆日期，向后兼容迁移）
- [x] C2 store：`incrementViews(id)`；init 时写 openedAt
- [x] C3 EntryPage 挂 incrementViews
- [x] C4 achievements.ts 纯函数：开馆/初窥门径(≥1)/博览群书(≥10)/藏书家(≥100)/通读一朝代/收藏家(书签≥10)/勘误协助者(采纳勘误)/开馆月纪念(≥30天) + 单测
- [x] C5 StatsPage：建馆纪念铭牌（日期/天数/馆藏）、8×4 时代×评级热力方阵、分类黄铜横条、来源印章墙、阅读进度封条、最常翻阅 TOP5、成就徽章墙（印章式，锁定态半透明）
- [x] C6 路由 `#/stats` + 顶栏「馆志」；commit `feat: annual-report stats page with achievements`

## Phase D：GitHub Pages 托管 + 勘误收件箱

**Files:** `.github/workflows/deploy.yml`（新建）, `src/features/imports/corrections.ts`（新建）, `src/features/entry/CorrectionButton.tsx`（新建）, `src/features/imports/CorrectionInbox.tsx`（新建）, `src/features/imports/ImportsPage.tsx`, `src/features/entry/EntryPage.tsx`, `README.md`

- [x] D1 deploy.yml：push main → npm ci → build → upload-pages-artifact → deploy-pages；README 写「建仓+开启 Pages」三步指引
- [x] D2 corrections.ts：Correction 类型 + localStorage 持久化（status: pending/accepted/rejected）
- [x] D3 CorrectionButton（卷宗页）：表单（错误位置/依据/联系方式）→ 生成勘误单 JSON 下载（含 entryId/标题/日期）
- [x] D4 CorrectionInbox（导入管理页）：导入勘误单 JSON、按状态分组、采纳（链接跳卷宗改 md）/驳回；采纳态供成就「勘误协助者」判定
- [x] D5 README/guide 增补分发与反馈流程；commit `feat: github pages deploy and correction feedback loop`

## 收尾

- [x] vitest / tsc / eslint / build / check-offline 全绿；preview 冒烟；更新计划勾选；commit
