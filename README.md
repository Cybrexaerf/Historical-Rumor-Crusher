# 史实勘误局 · 历史谣言澄清档案馆

Windows 离线运行的纯静态 Web 应用：收录、拆解、澄清网络流传的历史谣言。档案馆/卷宗视觉，GB/T 7714 参考文献，双层内容源（内置 + 本地导入）。

## 分发与更新（GitHub Pages）

朋友们通过网址在线访问，你 push 到 main 即自动全网更新。**完整步骤：**

```bash
# ① 在 github.com 上新建一个空仓库（名字随意，如 rumor-archive；公开/私有均可——
#    私有仓库的朋友需被加为协作者才能访问 Pages）
# ② 本地关联并推送（首次）：
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
# ③ 仓库网页上：Settings → Pages → Source 选「GitHub Actions」
#    等待 Actions 跑完（约 1 分钟），即得到网址：
#    https://<用户名>.github.io/<仓库名>/
```

之后每次内容更新：改/增 `content/*.md` → `git add -A && git commit -m "..."` → `git push`，
朋友们刷新网页即得新版。在线版与 `file://` 离线版数据格式一致；仍可整包拷贝 `dist/` 离线分发。

## 在线勘误（GitHub Issue）

1. 编辑 `src/config.ts`，填入 `GITHUB_REPO = '你的用户名/仓库名'`，push 重新部署。
2. 朋友在在线版任一卷宗页点「勘误上报」，填写后可一键「转 GitHub 在线提交」——
   自动跳转到你仓库的 Issue 新建页，标题与正文已预填（仓库含 `correction.yml` 表单模板）。
3. 你在仓库 Issues 里看到反馈 → 修订 `content/<id>.md`（revision +1）→ push → Issue 自动关闭即闭环。
   离线朋友仍可用「下载勘误单 JSON → 导入管理 → 勘误收件箱」的本地流程。

## 勘误反馈（朋友 → 馆主）

朋友在任一卷宗页点「勘误上报」：在线版可直跳 GitHub Issue（需配置 `src/config.ts`），
离线版填写后下载勘误单 JSON 发给馆主。馆主在「导入管理 → 勘误收件箱」导入文件（或直接看
GitHub Issues），逐条「采纳 / 驳回」；采纳后按提示修订对应 `content/<id>.md`（revision +1）
再 push。被采纳的勘误会点亮「馆志 → 勘误协助者」成就。

## 卷宗管理（馆务室）

「导入管理 → 馆务室」支持全馆卷宗批量管理：多选后可**下架**（内置卷宗无法物理删除——
它们打包在应用里，下架即从目录/检索/长卷/馆志全馆隐藏，可随时恢复上架）、移除本地导入、
批量导出本地导入为 md。

## 运行

```bash
npm install
npm run build      # 内容编译 → 打包（单文件内联）→ 离线检查（三合一）
npm run preview    # 本地预览 http://localhost:4173
```

构建产物在 `dist/`：**双击 `dist/index.html` 即可离线使用**（已将全部 JS/CSS 内联进单 HTML，
`file://` 直开可用；字体文件在 `dist/assets/`，需与 index.html 保持同目录结构，分发时整个 `dist/` 一起拷贝）。

> 技术说明：浏览器对 `file://` 协议禁止加载外部 module 脚本（CORS），因此本应用采用
> `vite-plugin-singlefile` 单文件内联构建；懒加载路由与检索 Worker 在 file:// 下自动降级为主线程执行。

## 内容编写（content/*.md）

每条谣言一份 md，front-matter + 四个语义区块：

```markdown
---
id: kebab-case-id        # 全库唯一，一经发布不改
title: 标题（谣言一句话）
rumor: |
  谣言原始陈述（列表卡片与搜索摘要用）
verdict: refuted         # refuted | partial | disputed | open
era: qing                # xianqin|qinhan|weijin|suitang|songyuan|ming|qing|modern
category: royal          # royal|war|figures|texts|tech|society|modern
tags: [标签1, 标签2]
origin: 网络新造          # 文学演绎|讹传|伪史|网络新造|影视误导
evidence: strong         # strong | medium | weak
updated: 2026-08-20
revision: 1              # 每次修订 +1
references:
  - id: ref1
    type: modern         # ancient|modern|journal|web
    text: "作者. 书名[M]. 城市: 出版社, 年份: 页码."
---

## 谣言溯源
正文可用 [^ref1] 引用——脚注定义会自动由 references 生成，无需手写。

## 流传脉络      （可选）

## 史料考证

## 真相结论
```

- 受控词表唯一定义在 `src/content/schema.ts`；校验失败构建即中止并给出中文定位。
- 新建模板：`npm run content:new`。
- **AI 辅助批量编写**：将 `docs/ai-authoring-guide.md` 整份投喂给 AI，即可按本馆规范产出可直接导入的卷宗 md（文档示例已通过真实校验器测试）。
- 正文禁止外链（离线铁律），raw HTML 一律转义，渲染产物经 DOMPurify。

## 内容更新策略

- **新增**：新 md 放入 `content/` 重新构建；或直接在应用「导入管理」拖入（存 IndexedDB，不影响内置内容）。
- **修订**：改 `content/` 中对应文件，`revision + 1`，重新构建。
- **运行时导入冲突**：同 id 时按 revision 裁决——高者生效；相等或更低弹三选（覆盖/保留/看差异）。
- **转正**：导入层可导出为 md，移入 `content/` 重新构建即成内置卷宗。

## 脚本

| 命令 | 作用 |
|---|---|
| `npm run build` | 内容编译 + Vite 构建 + 离线外链扫描 |
| `npm run content:build` | 仅编译内容到 `src/generated/data/` |
| `npm run content:new` | 交互式生成新卷宗模板 |
| `npm run dev` / `preview` | 开发 / 预览 |
| `npm run test` / `lint` / `typecheck` | Vitest / ESLint / tsc |

## 架构速览

- Vite + React 19 + TS strict + Tailwind；HashRouter + `base:'./'`（file:// 兼容）
- 内容数据 `import.meta.glob` 静态打包（零运行时 fetch），条目/检索分片懒加载
- 双层内容源：内置层（构建产物）⊕ 导入层（IndexedDB），id + revision 合并
- 检索：MiniSearch + Intl.Segmenter 分词 + pinyin-pro（全拼/首字母），Worker 失败自动降级主线程
- 设计规范与红线见 `AGENTS.md` 与 `docs/specs/`
