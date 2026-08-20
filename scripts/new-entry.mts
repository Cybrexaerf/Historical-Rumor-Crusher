import { writeFile } from 'node:fs/promises'
import readline from 'node:readline/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, ERAS } from '../src/content/schema.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

console.log('—— 新建卷宗 ——')
const title = (await rl.question('标题（谣言一句话，如：乾隆是汉人所生？）')) || '未命名卷宗'
console.log('时代：' + ERAS.map((e) => `${e.key}=${e.label}`).join('，'))
const era = (await rl.question('时代 key（默认 qing）')) || 'qing'
console.log('分类：' + CATEGORIES.map((c) => `${c.key}=${c.label}`).join('，'))
const category = (await rl.question('分类 key（默认 figures）')) || 'figures'
const id =
  (await rl.question('id（kebab-case，默认 new-entry）')) ||
  'new-entry'
rl.close()

const today = new Date().toISOString().slice(0, 10)
const template = `---
id: ${id}
title: ${title}
rumor: |
  在此填写谣言的原始陈述（一两句话，用于列表卡片与搜索摘要）。
verdict: refuted
era: ${era}
category: ${category}
tags: [示例标签]
origin: 网络新造
evidence: medium
updated: ${today}
revision: 1
references:
  - id: ref1
    type: modern
    text: "作者. 书名[M]. 城市: 出版社, 年份: 页码."
  - id: ref2
    type: ancient
    text: "（朝代）作者. 古籍名·卷次. 点校本. 城市: 出版社, 年份: 页码."
---

## 谣言溯源

这一谣言从何而来、由谁传播。[^ref1]

## 流传脉络

可选区块：谣言如何随时间演变（史料不足可整段删除）。

## 史料考证

主体论证，允许脚注引用[^ref2]。

## 真相结论

三五句的最终裁定。
`

const file = path.join(root, 'content', `${id}.md`)
await writeFile(file, template, 'utf-8')
console.log(`已生成模板：${path.relative(root, file)}`)
