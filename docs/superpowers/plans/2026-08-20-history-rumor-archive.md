# 史实勘误局（历史谣言档案馆）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Windows 离线纯静态 Web 应用「史实勘误局」：收录/拆解/澄清历史谣言，档案馆卷宗风视觉，md 内容构建期编译 + 运行时导入，客户端全文检索。

**Architecture:** Vite+React18+TS 静态应用（HashRouter, base './'）。构建期 Node 脚本将 `content/**/*.md` 编译为 `dist/data/{manifest,entries,fulltext}` JSON；运行时双层内容源（内置 dist/data ⊕ IndexedDB 导入层）按 id+revision 合并为统一仓库（zustand）；Web Worker 内 MiniSearch + Intl.Segmenter + pinyin-pro 检索。

**Tech Stack:** Vite 5, React 18, TypeScript strict, Tailwind CSS, react-router HashRouter, zustand, markdown-it, gray-matter, zod, minisearch, pinyin-pro, dompurify, idb（IndexedDB 封装）。

**Spec:** `docs/specs/2026-08-20-history-rumor-archive-design.md`

**Hard constraints (from spec §9):** 产物零 http(s) 外链；file:// 兼容；TS strict/ESLint 零 error；单文件 ≤300 行；首包 gzip ≤350KB；千条 60fps 虚拟滚动；搜索 ≤150ms；正文对比度 ≥7:1；每任务提交一次。

---

## Task 0: 仓库初始化与脚手架

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/design/tokens.css`, `src/vite-env.d.ts`, `AGENTS.md`, `.gitignore`

- [x] Step 0.1: `git init`；创建 `.gitignore`（node_modules/ dist/）
- [x] Step 0.2: 手写 `package.json`（scripts: dev/build/preview/lint/typecheck/test/content:build/content:new/check:offline）后 `npm install` 依赖：react, react-dom, react-router-dom, zustand, markdown-it, gray-matter, zod, minisearch, pinyin-pro, dompurify, idb；devDeps: vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom, @types/markdown-it, tailwindcss@3, postcss, autoprefixer, eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, vitest, @testing-library/react, jsdom
- [x] Step 0.3: `vite.config.ts`：`base:'./'`、react 插件、manualChunks（react 路由/内容/搜索分包）、`build.target:'es2020'`
- [x] Step 0.4: `src/design/tokens.css`：CSS 变量（--paper #F4EDDA / --ink #2B2620 / --gold #8A6D2F / --seal #A8352C / --verdict-green #3E5E46 / 评级四色 / 字号三档 / 行高 1.9 / 间距阶梯），Tailwind 接入 tokens
- [x] Step 0.5: `src/App.tsx` 最小 HashRouter 骨架（路由占位组件）；`index.html` 本地字体引用占位
- [x] Step 0.6: `AGENTS.md` 写入 spec §9 的 11 条红线
- [x] Step 0.7: 验证：`npm run build` 成功；`git commit -m "chore: scaffold vite+react+ts+tailwind with design tokens"`

## Task 1: 内容 Schema 与受控词表（单一事实源）

**Files:**
- Create: `src/content/schema.ts`

- [x] Step 1.1: 用 Zod 定义 `EntryMetaSchema`（id/title/rumor/verdict/era/category/tags/origin/evidence/updated/revision/references[{id,type,text}]）与派生 TS 类型 `EntryMeta`、`Entry`（meta+bodyHtml）。受控词表常量：`ERAS`（xianqin/qinhan/weijin/suitang/songyuan/ming/qing/modern + 中文标签）、`CATEGORIES`（royal/war/figures/texts/tech/society/modern + 中文标签）、`VERDICTS`（refuted/partial/disputed/open + 中文标签+色）、`ORIGINS`、`EVIDENCE_LEVELS`
- [x] Step 1.2: vitest 单测：合法样例通过；非法 verdict/era/duplicate ref id 报错
- [x] Step 1.3: `npm run test` 通过；commit `feat: content schema and controlled vocabularies`

## Task 2: 内容构建管线（构建期 md → JSON）

**Files:**
- Create: `scripts/build-content.mjs`, `scripts/lib/parse-entry.mjs`, `scripts/new-entry.mjs`, `scripts/check-offline.mjs`
- Test: `scripts/parse-entry.test.mjs`（vitest）

- [x] Step 2.1: `parse-entry.mjs`：gray-matter 解析 → zod 校验（错误信息含文件名+字段）→ markdown-it（脚注插件）渲染正文 → DOMPurify 清洗 → 校验四个语义区块标题存在性（谣言溯源/史料考证/真相结论必含，流传脉络可选）→ 返回 {meta, bodyHtml, fulltext}
- [x] Step 2.2: `build-content.mjs`：扫描 `content/**/*.md` → 全库 id 查重 → 输出 `dist/data/manifest.json`（元数据数组+统计+构建时间）、`dist/data/entries/<id>.json`、`dist/data/chunks/fulltext-<NNN>.json`（每 100 条一块，含 id/title/rumor/fulltext/pinyinTrie 素材）。失败非零退出
- [x] Step 2.3: `new-entry.mjs`：交互式生成 md 模板（readline 问 title/era/category，其余填默认）
- [x] Step 2.4: `check-offline.mjs`：扫描 dist/ 内文本文件中 `https?://` 引用（允许 schema/w3.org 等白名单）→ 违规非零退出
- [x] Step 2.5: 编写 5 条示例内容 `content/*.md`（乾隆身世/焚书坑儒待选等，含完整 front-matter 与 [^ref] 脚注）
- [x] Step 2.6: vitest 覆盖 parse-entry（合法/缺区块/坏 verdict）；`npm run content:build` 产出 5 条数据；commit `feat: content pipeline with zod validation and offline check`

## Task 3: 运行时内容仓库与双层合并

**Files:**
- Create: `src/content/load-manifest.ts`, `src/content/import-db.ts`, `src/content/merge.ts`, `src/content/store.ts`
- Test: `src/content/merge.test.ts`

- [x] Step 3.1: `load-manifest.ts`：fetch('./data/manifest.json')（file:// 下改用打包 import 方案——由 Vite transformIndexHtml 注入？决策：使用 `fetch` 且构建产物为同源相对路径，file:// 下若 fetch 失败 fallback 到 `import.meta.glob` 的 JSON import）→ 最终采用 **import.meta.glob('../data/**/*.json') 静态打包**，保证 file:// 零兼容问题；条目懒加载改为 glob 懒 import
- [x] Step 3.2: `import-db.ts`：idb 封装 stores: `entries`（key=id，值 {meta, bodyHtml, importedAt, rawMd}）
- [x] Step 3.3: `merge.ts`：`mergeEntries(built: EntryMeta[], imported: ImportedEntry[]): MergedIndex` — 生效优先级 导入层>内置层；同 id 且 revision 相等 → 标记 `conflict: 'equal-revision'` 待人工裁决（此时生效内置版并挂冲突标记）；输出含每个 id 的 `{source:'built'|'imported'|'conflict', meta}` 列表 + 统计
- [x] Step 3.4: `store.ts`（zustand）：state: manifest/builtIndex/importedIndex/mergedIndex/bookmarks/readSet(已读)/recent；actions: init/loadEntry(id)/importEntry(rawMd)/removeImport(id)/resolveConflict(id,choice)/toggleBookmark/markRead/pushRecent
- [x] Step 3.5: vitest merge 策略矩阵（新增/高 revision 覆盖/低 revision 三选/equal-revision 冲突标记）；commit `feat: dual-layer content store with revision merge`

## Task 4: 检索 Worker（MiniSearch + 分词 + 拼音）

**Files:**
- Create: `src/search/worker.ts`, `src/search/client.ts`, `src/search/tokenize.ts`
- Test: `src/search/tokenize.test.ts`

- [x] Step 4.1: `tokenize.ts`：Intl.Segmenter('zh',{granularity:'word'}) 分词 + 小写化 + 英数保留
- [x] Step 4.2: `worker.ts`：接收全量 chunk 文档（含 pinyin 全拼+首字母字段，构建期由 pinyin-pro 生成）建 MiniSearch（fields: title,rumor,fulltext,pinyinFull,pinyinInitials；boost title 3x rumor 2x）；query 消息 → segment+拼音双写查询 → 返回 {id,score}[] top 50
- [x] Step 4.3: `client.ts`：Worker Promise 封装；首搜时懒启动
- [x] Step 4.4: 单测 tokenize；commit `feat: search worker with segmenter and pinyin`

## Task 5: 布局壳与通用组件（档案馆设计系统落地）

**Files:**
- Create: `src/app/Layout.tsx`, `src/app/routes.tsx`, `src/components/Seal.tsx`, `src/components/PaperCard.tsx`, `src/components/VerdictStamp.tsx`, `src/components/PaperTexture.tsx`, `src/design/animations.css`

- [x] Step 5.1: `PaperTexture.tsx`：SVG feTurbulence 噪点纸纹背景组件（纯 CSS/SVG，无位图）；`PaperCard.tsx`：纸卡容器（微焦黄边、暗金 hairline）
- [x] Step 5.2: `Seal.tsx`：印章组件（props: text,color,size,rotated）朱红描边+网纹；`VerdictStamp.tsx`：四评级章映射
- [x] Step 5.3: `animations.css`：stamp-press（scale1.6→1 + 随机±3° + 400ms）、drawer-pull、unroll；`@media (prefers-reduced-motion: reduce)` 全禁用
- [x] Step 5.4: `Layout.tsx`：顶栏（馆名/搜索入口/随机调阅/书架/导入）+ 底部；字体落地（思源宋体 woff2 放 `src/design/fonts/`，font-face 声明；本期先系统衬线 fallback，M7 前子集化字体文件放入）
- [x] Step 5.5: 目检 dev server；commit `feat: archive design system components and layout shell`

## Task 6: 落地页「档案大厅」

**Files:**
- Create: `src/features/landing/Landing.tsx`, `src/features/landing/Hero.tsx`, `src/features/landing/DeskNav.tsx`, `src/features/landing/StatsPlaques.tsx`, `src/features/landing/RecentDossier.tsx`

- [x] Step 6.1: `Hero.tsx`：竖排巨字「史实勘误局」（writing-mode: vertical-rl）+ 滚动入场「证伪」大印 stamp-press + 真实统计副标题（读 store.mergedIndex 计算）
- [x] Step 6.2: `DeskNav.tsx`：档案袋导航卡（总目录/时代长卷/随机调阅/关于），hover 抬起 drawer-pull
- [x] Step 6.3: `StatsPlaques.tsx` 黄铜铭牌三块；`RecentDossier.tsx` 最近更新 6 卷宗抽屉卡
- [x] Step 6.4: `Landing.tsx` 组装 + 辟谣红线 SVG 贯穿（装饰性 path，aria-hidden）
- [x] Step 6.5: 验证统计数字=manifest 真实值；`npm run build`；commit `feat: landing hall with hero stamp and dossier nav`

## Task 7: 总目录页（多维筛选 + 虚拟滚动）

**Files:**
- Create: `src/features/browse/Browse.tsx`, `src/features/browse/FiltersPanel.tsx`, `src/features/browse/EntryCard.tsx`, `src/components/VirtualList.tsx`
- Test: `src/features/browse/filters.test.ts`

- [x] Step 7.1: `FiltersPanel.tsx`：时代树/分类/来源/评级/标签云多选 + 已读状态过滤；URL searchParams 持久化筛选状态
- [x] Step 7.2: `filters.ts` 纯函数 `applyFilters(index, filters, sort)`（排序：时代/更新时间/标题拼音）+ 单测
- [x] Step 7.3: `VirtualList.tsx`：简易窗口化列表（overscan 8，无第三方依赖）
- [x] Step 7.4: `EntryCard.tsx`：编号/标题/一句话谣言/评级章/时代/来源徽章/书签星标
- [x] Step 7.5: 千条模拟数据下 Chrome devtools 帧率验证（Console timing）；commit `feat: browse page with faceted filters and virtual list`

## Task 8: 时代长卷轴

**Files:**
- Create: `src/features/timeline/Timeline.tsx`

- [x] Step 8.1: 横向滚动时间轴：8 大时段分段轴 + 段内条目钉牌（点击直达 `#/entry/:id`）；横向滚轮支持（wheel→scrollLeft）
- [x] Step 8.2: commit `feat: era timeline scroll`

## Task 9: 搜索页

**Files:**
- Create: `src/features/search/SearchPage.tsx`, `src/features/search/Highlight.tsx`

- [x] Step 9.1: `SearchPage.tsx`：防抖 250ms 调 worker client；范围选择（标题/谣言/全文）；结果按时代分组 + 相关度排序；空态/无结果态
- [x] Step 9.2: `Highlight.tsx`：命中词朱红下划线标注（正则转义）
- [x] Step 9.3: 验证「乾隆」与「ql」均可命中；commit `feat: fulltext search page with pinyin`

## Task 10: 详情页「卷宗」

**Files:**
- Create: `src/features/entry/EntryPage.tsx`, `src/features/entry/DossierSidebar.tsx`, `src/features/entry/SectionRenderer.tsx`, `src/features/entry/CitationCard.tsx`, `src/features/entry/ReadingProgress.tsx`, `src/content/sectionize.ts`
- Test: `src/content/sectionize.test.ts`

- [x] Step 10.1: `sectionize.ts`：将 bodyHtml 按 h2 切成 {key:'rumor-origin'|'spread'|'evidence'|'verdict', html} 区块 + 单测
- [x] Step 10.2: `SectionRenderer.tsx`：四区块差异化样式——举报信（谣言陈述，红框打字机+「受理」章）/ 剪报（溯源+脉络）/ 纸面正文（考证，脚注上标）/ 结案陈词（墨绿卡+评级大章+TL;DR）
- [x] Step 10.3: `CitationCard.tsx`：hover/focus 弹 GB/T 7714 引用卡；「卷内备考」参考文献列表（复制按钮+跳回正文）
- [x] Step 10.4: `DossierSidebar.tsx`：固定左栏 280px（编号/元数据/TOC 滚动监听/字号三档调节写 localStorage）；`ReadingProgress.tsx` 封条进度
- [x] Step 10.5: 上下条目联动 + 进场 markRead + pushRecent；commit `feat: dossier entry page with differentiated sections`

## Task 11: 导入管理页

**Files:**
- Create: `src/features/imports/ImportsPage.tsx`, `src/features/imports/DropZone.tsx`, `src/features/imports/ConflictDialog.tsx`, `src/features/imports/DiffView.tsx`, `src/content/md-runtime.ts`

- [x] Step 11.1: `md-runtime.ts`：浏览器端复用 parse-entry 逻辑（markdown-it+gray-matter 浏览器版+zod），产出与构建期同构的校验结果
- [x] Step 11.2: `DropZone.tsx` 多文件拖入 → 逐文件校验 → 报告（成功/失败原因中文）；`ImportsPage.tsx` 导入层一览表（生效版本/来源/删除/导出全部为 md 下载）
- [x] Step 11.3: `ConflictDialog.tsx`：revision≤内置版时三选弹窗；`DiffView.tsx`：纯文本行级 diff（LCS 简易实现）+ 元数据对照表
- [x] Step 11.4: commit `feat: import manager with conflict resolution and diff`

## Task 12: 书架页 + 随机调阅

**Files:**
- Create: `src/features/bookmarks/BookmarksPage.tsx`, `src/features/random/random.ts`

- [x] Step 12.1: 书架三栏（收藏/已读/最近浏览，各自空态）；`random.ts` 随机 id + 跳转
- [x] Step 12.2: commit `feat: bookshelf and random pick`

## Task 13: 收尾审计（M7）

- [x] Step 13.1: `npm run lint && npm run typecheck && npm run test` 全绿
- [x] Step 13.2: `npm run build && npm run check:offline` 通过；首包 gzip 体积测量（`vite build` 输出）≤350KB
- [x] Step 13.3: `npm run preview` + Windows 下直接双击 dist/index.html（file://）全功能走查清单：落地页/目录筛选/长卷/搜索（中文+拼音）/详情四区块/引用卡/导入新 md/同 id 冲突三选/书签/已读/随机
- [x] Step 13.4: 字体子集化落地（思源宋体子集 woff2 打包入 dist）；commit `chore: final audit, fonts, offline verification`
