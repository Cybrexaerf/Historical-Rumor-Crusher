# 史实勘误局 · 历史谣言澄清档案馆

Windows 离线运行的纯静态 Web 应用：收录、拆解、澄清网络流传的历史谣言。档案馆/卷宗视觉，GB/T 7714 参考文献，双层内容源（内置 + 本地导入）。

## 运行

```bash
npm install
npm run build      # 内容编译 → 打包 → 离线检查（三合一）
npm run preview    # 本地预览 http://localhost:4173
```

构建产物在 `dist/`，双击 `dist/index.html` 即可离线使用（file:// 直开，无需服务器）。

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
