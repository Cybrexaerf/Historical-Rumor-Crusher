# AGENTS.md — 开发硬性约束（红线）

1. **离线铁律**：产物中禁止任何 `http(s)://` 外链资源（字体/图片/脚本/统计），`npm run build` 内置 `check-offline.mjs` 扫描 dist，违者构建失败。
2. **file:// 兼容**：HashRouter、`base: './'` 相对路径；内容数据全部经 Vite 静态打包（import.meta.glob），禁止运行时 fetch 本地 JSON。
3. **Windows 兼容**：所有脚本用 Node（.mjs），路径用 `path`/URL API，禁止 bash-only 语法。
4. **安全**：所有 Markdown 渲染产物必须过 DOMPurify；md 原始 HTML 白名单（仅 a/img/em/strong/br）。
5. **质量门**：TypeScript strict 零 error；ESLint 零 error；单文件 ≤ 300 行；组件单一职责。
6. **内容与代码分离**：业务组件不得硬编码条目内容；受控词表（时代/分类/评级/来源）唯一定义在 `src/content/schema.ts`。
7. **性能预算**：首包 gzip ≤ 350KB；千条目录虚拟滚动 60fps；搜索 ≤ 150ms。
8. **依赖白名单制**：新增依赖须说明理由并获用户确认，优先零依赖。
9. **交付自验**：每阶段 `npm run build` + `npm run preview` 通过后才算完成；禁止"应该可以"式交付。
10. **可访问性**：键盘可完整导航；图形元素有 aria-label；正文对比度 ≥ 7:1。
11. **Git 纪律**：每任务一次语义化提交；不提交 dist/、node_modules/、src/generated/。
