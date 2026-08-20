# 「史实勘误局」— 历史谣言澄清档案馆 · 开发设计文档 v1.0（定稿）

> 定位：一款 Windows 离线运行的纯静态 Web 应用，收录、拆解并澄清流传于网络的历史类谣言。信息密度大、知识体系化、溯源严谨，视觉以「档案馆/卷宗」为核心意象。

---

## 1. 已确认的核心决策

| 决策项 | 结论 |
|---|---|
| 部署形态 | 纯静态网页（Vite 构建，`base: './'` 相对路径，双击 index.html 或任意静态服务器可运行） |
| 运行环境 | Windows 离线，**零网络请求**，零后端 |
| 内容规模 | 按几百~几千条设计，预留万条扩展性 |
| 视觉方向 | 档案馆/卷宗风（泛黄纸卷 + 印章/火漆 + 暗金墨色），单主题暖纸色，无暗色模式 |
| 内容格式 | 从零编写，按本文档定义的结构化 Markdown 规范；**仅支持 md 导入，取消 txt 导入** |
| 用户本地功能 | 基础版：书签收藏、已读标记、最近浏览（localStorage） |
| 引用标准 | GB/T 7714（古籍按传统引法混排） |
| 内容流程 | 双层内容源：构建时内置 + 运行时拖拽导入（详见第 4 节） |
| 分类词表 | 7 类，不增删：帝王身世与宫廷 / 战争与军事 / 名人轶事 / 文化典籍与文献 / 科技与发明 / 社会生活与制度 / 近现代史 |
| 时代划分 | 8 大时段（先秦/秦汉/魏晋南北朝/隋唐/宋元/明/清/近现代）+ 卷内细分 |
| 拼音搜索 | 做（内置拼音库，支持首字母匹配） |
| 内容边界 | 不包含敏感近现代话题；离线应用无审核环节 |

---

## 2. 技术路线与工程架构

### 2.1 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | Vite 5 + TypeScript (strict) | 静态产物、构建快、生态最成熟 |
| 框架 | React 18 + **HashRouter** | Hash 路由是 `file://` 打开的硬性要求 |
| 样式 | Tailwind CSS + 自定义 Design Tokens（CSS Variables） | 档案馆风高度定制，不用现成组件库皮肤 |
| Markdown 解析 | markdown-it + gray-matter（构建侧与浏览器端复用同一解析器） | 保证渲染一致性 |
| 全文检索 | MiniSearch + `Intl.Segmenter` 中文分词 + Web Worker | 纯客户端、无外部依赖、支持中文与模糊搜索 |
| 拼音 | pinyin-pro（本地打包） | 首字母与全拼匹配 |
| 用户数据 | localStorage（书签/已读/最近） | 体积小、同步读写 |
| 导入数据 | IndexedDB（运行时导入的条目） | 结构化、容量大、可导出 |
| 字体 | 思源宋体（子集化 woff2，本地打包）+ 霞鹜文楷（引文） | 离线硬性要求：**任何字体不得走 CDN** |
| 脚本 | Node 20+ 跨平台脚本（内容编译、校验、索引生成） | Windows 兼容，避免 bash 语法 |

### 2.2 架构与数据流

```
【构建期】 content/**/*.md ──► scripts/build-content.mjs
             │ gray-matter 解析 front-matter
             │ markdown-it 渲染正文 HTML
             │ Zod 校验 schema（不合格→报错并退出，绝不带病构建）
             ▼
           dist/data/
             ├── manifest.json      全条目元数据（id、标题、时代、分类、评级、摘要）
             ├── entries/<id>.json  单条目正文（懒加载）
             └── chunks/fulltext-*.json  分块全文（供检索 Worker）

【运行期】 双层内容源合并：
           内置层(dist/data) ⊕ 导入层(IndexedDB)
                │ 按 id 合并（见第 4 节冲突策略）
                ▼
           统一内容仓库 Store (zustand)
                ├─ 路由: #/ #/browse #/entry/:id #/search #/imports #/bookmarks
                └─ 检索: Web Worker 构建 MiniSearch 索引 → IndexedDB 缓存索引
```

### 2.3 目录结构

```
webapp/
├── content/                ← 唯一的内容源（手写 md）
├── scripts/                ← build-content / validate / new-entry 脚本
├── src/
│   ├── app/                路由与布局
│   ├── features/           landing / browse / entry / search / imports / bookmarks
│   ├── components/         通用组件（Seal 印章、PaperCard、Citation 等）
│   ├── content/            内容仓库、合并逻辑、md 运行时解析
│   ├── search/             Worker 与索引
│   ├── design/             tokens.css、字体、纹理资产
│   └── lib/
├── public/textures/        纸纹、印章、火漆等本地资产
└── dist/                   构建产物（可直接分发）
```

---

## 3. 内容模型：Markdown 编写规范

### 3.1 Front-matter Schema（每条谣言一份 md）

```yaml
---
id: qianlong-hanrein        # 唯一ID，全库唯一，kebab-case，一经发布不改
title: 乾隆是汉人所生的陈家洛之子？
rumor: |                    # 谣言原始陈述（一句话，用于列表卡片与搜索摘要）
  乾隆皇帝实为海宁陈氏汉人之子，雍正以女易子……
verdict: refuted            # refuted已证伪 | partial部分属实 | disputed存疑 | open尚无定论
era: qing                   # 时代（受控词表：xianqin/qinhan/weijin/suitang/songyuan/ming/qing/modern）
category: figures           # 分类（受控词表，见下方 7 类）
tags: [乾隆, 身世传闻, 秘史]
origin: 文学演绎            # 谣言来源类型：文学演绎/讹传/伪史/网络新造/影视误导
evidence: strong            # 史料支撑强度：strong/medium/weak
updated: 2026-08-20
revision: 3                 # 每次修订 +1，用于导入层冲突判断
references:
  - id: ref1
    type: ancient           # ancient 古籍 | modern 近现代出版 | journal 论文 | web 存档网页
    text: "陈康祺. 郎潜纪闻·卷四[M]. 北京: 中华书局, 1984: 132."
---
```

分类受控词表（7 类）：`royal` 帝王身世与宫廷 / `war` 战争与军事 / `figures` 名人轶事 / `texts` 文化典籍与文献 / `tech` 科技与发明 / `society` 社会生活与制度 / `modern` 近现代史。

时代受控词表（8 大时段）：`xianqin` 先秦 / `qinhan` 秦汉 / `weijin` 魏晋南北朝 / `suitang` 隋唐 / `songyuan` 宋元 / `ming` 明 / `qing` 清 / `modern` 近现代。卷内正文可自行细分到具体朝代/时期。

### 3.2 正文结构约定（四个语义区块，渲染时差异化呈现）

```markdown
## 谣言溯源      ← 谣言从何而来、如何流传
## 流传脉络      ← 可选区块；史料不足可省略
## 史料考证      ← 主体论证，允许 [^ref1] 尾注引用
## 真相结论      ← 三五句的最终裁定，详情页以「结案陈词」样式盖章呈现
```

`[^ref1]` 尾注渲染为可悬浮的引用卡片（hover/点击弹出 GB/T 7714 完整条目 + 上下文说明）。

---

## 4. 增量导入与版本冲突策略

**原则：ID 是唯一键；双层内容源；导入层永远压在内置层之上。**

### 4.1 新增内容（不影响旧内容）
新 md 文件 → 拖入应用「导入管理处」→ 浏览器端解析 + Zod 校验 → id 在库中不存在 → 写入 IndexedDB 导入层。旧内容零触碰。要「转正」为内置内容：把该 md 放入 `content/` 重新构建即可（应用提供「导出导入层为 md 文件」功能完成闭环）。

### 4.2 修订旧内容
- **途径 A（推荐，源头修订）**：直接修改 `content/` 下对应 md，`revision + 1`，重新构建。构建是全量但确定性的，天然无冲突。
- **途径 B（运行时热修）**：拖入**同 id** 的修订版 md。应用比较 `revision`：
  - 导入版 revision > 内置版 → 采纳导入版，条目挂「本地修订」铜色徽章；
  - revision ≤ 内置版 → 弹窗三选：**覆盖仍导入 / 保留内置 / 查看两版差异后决定**（差异对比：正文 diff + 元数据对照表）。

### 4.3 冲突的根本避免
同一 id 只允许一个「生效版本」，生效优先级 = 导入层 > 内置层；导入层内以 revision 最高者生效，同 revision 时弹人工裁决对话框。导入管理处提供：生效版本一览、删除某条导入、一键导出全部导入层为 md。

---

## 5. 信息架构与功能清单

| 页面/功能 | 要点 |
|---|---|
| **落地页「档案大厅」** | 见第 6.2 节创意方案 |
| **总目录 `#/browse`** | 高密度知识结构：左栏多维导航（时代树、分类、谣言来源类型、评级筛选、标签云）+ 右栏条目卡片列表（编号/标题/一句话谣言/评级章/时代），支持排序（时代/更新时间/标题拼音）与筛选组合，虚拟滚动 |
| **时代长卷轴** | 横向时间轴视图，8 大时段谣言条目钉在轴上，点击直达 |
| **详情页 `#/entry/:id`「卷宗」** | 见第 6.3 节 |
| **全文搜索 `#/search`** | 中文分词 + 拼音全拼/首字母；命中高亮；结果按相关度/时代分组；搜索范围可选「标题/谣言陈述/全文/参考文献」 |
| **导入管理 `#/imports`** | 拖拽 md 导入、校验报告、冲突裁决、差异对比、导出 md |
| **我的书架 `#/bookmarks`** | 收藏、已读、最近浏览三个分栏 |
| **随机调阅** | 全局按钮，「抽出一份卷宗」过渡动画，冷启动探索利器 |

---

## 6. 视觉设计系统（档案馆/卷宗风）

### 6.1 设计语言

- **色彩**：纸卷米黄 `#F4EDDA` 底、墨黑 `#2B2620` 正文、暗金 `#8A6D2F` 强调与边框、证伪朱红 `#A8352C`（印章/警示）、结案墨绿 `#3E5E46`（真相/结论）。评级色系：红=已证伪 / 赭黄=部分属实 / 灰蓝=存疑 / 空心=无定论。
- **字体**：标题思源宋体 Black（竖排大标题用于落地页）；正文思源宋体 Regular，行高 1.9，每行 ≤ 38 字；谣言引文用霞鹜文楷斜体以示「引述感」。
- **材质**：SVG 噪点纸纹叠加、边缘微焦黄、骑缝章、牛皮纸档案袋、火漆封缄、麻绳标签——全部本地 SVG/PNG 资产。
- **动效**（克制而有戏）：印章盖下（scale 1.6→1 + 轻微随机旋转 + 短暂震动）、档案袋抽出（y 轴位移 + 阴影渐显）、卷轴横向展开、纸张翻页微视差。所有动效 ≤ 400ms，`prefers-reduced-motion` 全局降级。

### 6.2 落地页创意方案「档案大厅」

首屏 = 一张**档案管理员的桌面**：

1. **Hero**：满屏泛黄案卷纸背景，中央竖排巨字「史实勘误局」，右下角一枚朱红大印随滚动入场「啪」地盖下——印文「证伪」二字。副标题横排小字：「收录网络历史谣言 N 条 · 已证伪 N 条 · 存疑待考 N 条」实时取自真实数据。
2. **桌面元素即导航**：桌上散落的档案袋（悬停抬起、显示目录标签）分别通往：总目录、时代长卷、随机调阅；一枚火漆封缄通往「关于本馆」。
3. **统计铭牌区**：黄铜铭牌质感的三块数据牌（馆藏总数/已证伪/本期新增）。
4. **最新归档**：最近更新的 6 份卷宗以「目录卡片抽屉」横排呈现，hover 抽出。
5. **一条贯穿的暗线**：一条红色细线（辟谣红线）从 Hero 的印章出发，蜿蜒贯穿全页连接各区块，隐喻「谣言的拆解线索」。

### 6.3 详情页「卷宗」排版系统

- **布局**：桌面端左固定 280px 卷宗封皮侧栏（馆藏编号、时代、分类、评级章、证据强度、标签、正文目录 TOC、参考文献锚点），右为正文纸面；移动端侧栏折叠为顶部信息条。
- **区块差异化**：
  - 谣言陈述 → 顶部「举报信」样式：打字机字体、红框、盖「受理」章；
  - 谣言溯源/流传脉络 → 旧报纸剪报拼贴风格；
  - 史料考证 → 正文纸面，尾注编号上标，hover 弹引用卡；
  - 真相结论 → 深墨绿卡片「结案陈词」，右侧盖评级大章，含一行 TL;DR；
  - 参考文献 → 卷尾「卷内备考」区，GB/T 7714 编号列表，可复制、可跳回正文引用处。
- **阅读辅助**：顶部阅读进度条做成「卷宗封条」样式；字号/行距三档可调；上一个/下一个条目按同分类联动。

---

## 7. AI 设计提示词

### 7.1 落地页 Hero 视觉资产生成提示词（Midjourney/即梦/SD 通用）

> A cinematic overhead shot of an archivist's desk in a dimly lit historical archive room, aged manila folders and yellowed case files stamped with red Chinese seal marks, warm candlelight from a brass desk lamp, red wax seals, hemp rope tags, a single red thread running across the files, dust particles in the light beam, muted palette of parchment beige, ink black, antique gold and vermilion red, photorealistic textures, subtle paper grain, no text, 16:9

### 7.2 前端界面风格提示词（粘贴进每个 UI 开发任务的提示词尾部）

> Design language: "Republic-era Chinese archive bureau" aesthetic. Parchment background #F4EDDA with subtle SVG paper grain; ink-black serif typography (Noto Serif SC), vertical hero headline; vermilion red (#A8352C) used ONLY for seal stamps and rumor verdicts; antique gold (#8A6D2F) hairline borders and dividers. Components look like physical dossier items: folders, index cards, brass nameplates, wax seals. Animations: stamp-press (400ms, slight random rotation), drawer-pull, scroll-unroll. High information density with generous reading whitespace. NEVER use rounded-corner SaaS cards, gradients, or drop-shadow heavy modern UI. All assets local, zero external requests.

### 7.3 印章/纹理资产生成提示词

> Traditional Chinese seal stamp texture, vermilion red ink, distressed edges, ink bleed unevenness, isolated on transparent background, top-down flat, high resolution --no text
> Aged paper texture, subtle stains and foxing at edges, warm beige tone, seamless tileable, flat scan, no objects, no text

---

## 8. AI 开发提示词（分阶段）

- **阶段 0 · 脚手架**：在当前目录初始化 Vite + React 18 + TypeScript (strict) + Tailwind 项目，配置 vite.config.ts：base 为 './'、HashRouter、手动分包。建立 src/design/tokens.css 设计令牌。禁止引入任何未列出的依赖。
- **阶段 1 · 内容管线**：编写 scripts/build-content.mjs：读取 content/**/*.md，gray-matter 解析 + Zod 校验（schema 见 3.1 节），markdown-it 渲染正文为 HTML（脚注插件，DOMPurify 清洗），输出 manifest.json、entries/<id>.json、chunks/fulltext-*.json。校验失败输出中文错误定位并以非零码退出。另写 scripts/new-entry.mjs 交互式生成模板。
- **阶段 2 · 数据层与合并**：实现 src/content：manifest 加载、条目按需加载、双层合并（内置 ⊕ IndexedDB 导入层，第 4 节冲突策略）；zustand store 暴露 getEntry/listEntries/bookmark/markRead。
- **阶段 3 · 落地页**：按 6.2 节实现档案大厅（粘贴 7.2 节设计指导）。印章入场动画随机 ±3° 旋转，prefers-reduced-motion 降级。统计数字从 manifest 真实计算。
- **阶段 4 · 目录/长卷/搜索**：browse 页（多维筛选组合 + 排序 + 虚拟滚动）、时代长卷横向滚动视图、MiniSearch 检索 Worker（Intl.Segmenter 分词 + pinyin-pro，索引缓存入 IndexedDB，命中高亮）。
- **阶段 5 · 详情页**：按 6.3 节实现卷宗页四区块差异化样式、引用尾注悬浮卡、TOC、进度封条、字号调节、上下条目联动。
- **阶段 6 · 导入与书架**：拖拽 md 导入（浏览器端同构校验）、冲突裁决对话框、两版 diff 视图、导出导入层为 md；书签/已读/最近浏览三栏页。

---

## 9. AI 开发约束（写入 AGENTS.md 的硬性红线）

1. **离线铁律**：产物中禁止任何 `http(s)://` 外链资源（字体/图片/脚本/统计），构建时用脚本扫描 dist 校验，违者构建失败。
2. **file:// 兼容**：HashRouter、相对路径资产、内容数据全部走打包 JSON。
3. **Windows 兼容**：所有脚本用 Node，路径处理用 `path`/URL API，禁止 bash-only 语法。
4. **安全**：所有 Markdown 渲染产物必须过 DOMPurify；md 中原始 HTML 白名单（仅 img/a/em 等少数标签）。
5. **质量门**：TypeScript strict 零 error；ESLint 零 error；单文件 ≤ 300 行，组件单一职责。
6. **内容与代码分离**：业务组件不得硬编码任何条目内容；受控词表定义在单一 schema 文件。
7. **性能预算**：首包 gzip ≤ 350KB；落地页本地打开可交互 ≤ 2s；千条目录滚动 60fps（虚拟列表）；搜索 ≤ 150ms。
8. **依赖白名单制**：新增依赖必须在对话中说明理由并获确认，优先零依赖实现。
9. **每阶段交付前**：`npm run build` + `npm run preview` 自验，附验证输出；不允许"应该可以"式交付。
10. **可访问性**：键盘可完整导航、图形元素有 aria-label、正文对比度 ≥ 7:1。
11. **Git 纪律**：每阶段一次语义化提交；不提交 dist/ 与 node_modules/。

---

## 10. 实施里程碑

M0 脚手架 + 设计令牌（0.5d）→ M1 内容管线 + 示例内容 5 条（1d）→ M2 数据层 + 合并策略（1d）→ M3 落地页（1.5d）→ M4 目录/长卷/搜索（2d）→ M5 详情页（1.5d）→ M6 导入/书架（1.5d）→ M7 全量内容灌入 + 性能与离线审计 + 打磨（1d）。总计约 10 个工作日（AI 辅助节奏）。
