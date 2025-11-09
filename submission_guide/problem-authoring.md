# 题目出题与同步规范 (Problem Authoring & Sync Guide)

本文件说明如何在题目源仓库 `ChenyuHeee/ccodegolf` 中编写题目与测试，并通过同步脚本整合到当前展示/排行仓库。

## 总体流程
1. 在源仓库创建题号目录：`<id>/`，例如 `0/`、`1/`、`2/`。
2. 在该目录下编写 `problem.md`，使用 YAML Frontmatter 描述元数据与可选测试。
3. （可选）如果测试较多，可放到单独的 `tests.json` 文件中；或使用 `tests_file` 字段指向它。
4. 同步工作流（手动或定时）在展示仓库运行，抓取这些文件并生成：
   - `competition/problems.json`（题目元数据汇总）
   - `competition/data/tests/week-<id>.json`（测试用例）
   - `competition/problems/<id>.md`（原始题面备份）
5. 展示端页面读取 `competition/problems.json` 动态渲染题目列表与难度；题面模板会根据 id 加载描述与难度。

## problem.md 格式示例
使用三条横线 `---` 包裹 YAML Frontmatter。示例：

```md
---
number: 2
slug: print-diamond-fast
# 标题（可用于中英文；也可以使用 name_zh / name_en 拆分）
title: 打印菱形（优化版）
short: 打印指定大小的菱形图案
# 建议同时提供中英文标题
name_zh: 打印菱形（优化版）
name_en: Print Diamond (Optimized)
# 难度积分 D
difficulty: 150
# 中文描述（使用多行块）
desc_zh: |
  给定一个正奇数 n，打印由星号组成的对称菱形图案。
  要求：
  1. 无额外尾随空格
  2. 末尾换行
# 英文描述
desc_en: |
  Given a positive odd integer n, print a symmetric diamond of asterisks.
  Requirements:
  1. No trailing spaces per line
  2. Final newline at end
# 简单内嵌测试（可选）：如果数量较少可以直接写进 frontmatter
# 每个测试对象支持 stdin / expected
# 大量测试请移到 tests.json 并用 tests_file 引用
# tests:
#   - stdin: "5\n"
#     expected: "  *\n ***\n*****\n ***\n  *\n"
# 引用外部测试文件（tests.json）
tests_file: tests.json
updatedAt: 2025-11-09T00:00:00.000Z
---

# 题面正文（Markdown）
这里可以继续写更详细的题解、约束、提示、样例、FAQ 等。
```

### 字段说明
| 字段 | 必需 | 说明 |
|------|------|------|
| number | 是 | 题号（整数）。作为 id 使用。 |
| slug | 否 | 短标识，用于索引或 URL（备用）。 |
| title / name_zh / name_en | 至少一个 | 题目标题；推荐同时给中英文。缺失时回退 title。 |
| short | 否 | 一句话简介，用于入口列表。 |
| difficulty | 是 | 难度积分 D，用于积分计算。未设时请在展示端脚本中添加或默认。 |
| desc_zh / desc_en | 推荐 | 多语言长描述。展示端可优先使用与当前语言对应的字段。 |
| desc / description | 兼容 | 如果仅提供一个通用描述，可用 desc。 |
| tests | 可选 | 少量测试直接写数组（仅在 frontmatter 内），用于评测。 |
| tests_file | 可选 | 指向同目录下的测试文件，如 `tests.json`。 |
| updatedAt | 否 | 时间戳 ISO 字符串；未提供时同步脚本会自动填当前时间。 |

## tests.json 格式
如果测试较多，建议放在同目录 `tests.json`：
```json
[
  { "stdin": "5\n", "expected": "  *\n ***\n*****\n ***\n  *\n" },
  { "stdin": "7\n", "expected": "   *\n  ***\n *****\n*******\n *****\n  ***\n   *\n" }
]
```
说明：
- `stdin`：传给程序的标准输入字符串（包含必要的换行）。
- `expected`：期望标准输出完整文本（保留换行）。

## 同步脚本行为（展示仓库 c）
脚本 `scripts/sync_problems_from_ccodegolf.mjs` 会：
1. 尝试读取 `index.json`（若存在则按其中 id 列表；否则扫描 0..MAX_ID）。
2. 拉取每个 `<id>/problem.md`。
3. 解析 YAML Frontmatter，获得元数据与正文（正文当前只备份，不做解析）。
4. 若 frontmatter 中声明 `tests_file` 或存在同目录 `tests.json`，加载测试并写入 `competition/data/tests/week-<id>.json`。
5. 汇总所有题目写入 `competition/problems.json`。字段包含：id, slug, name_zh, name_en, short, difficulty, desc (或兼容描述), updatedAt, testsPath（如果生成了测试）。
6. 将原始 `problem.md` 复制到 `competition/problems/<id>.md` 保留溯源。

## 展示端使用约定
- 入口页读取 `competition/problems.json`，渲染题目卡片：`id`、标题、D、short/desc。
- 题面模板页面（复制 `_problem.template.html` 为 `<id>.html`）在加载时根据 URL 解析 id，从 problems.json 找对应对象：
  - 根据当前语言选择 `name_zh` / `name_en`。
  - 优先显示 `desc_zh` / `desc_en`；若不存在使用 `desc`。
  - 设置难度徽章 `D=<difficulty>`。
- 评测阶段读取 `competition/data/tests/week-<id>.json`（如果存在），逐个执行 Wandbox 编译运行对拍。

## 积分与难度映射
在展示仓库脚本 `scripts/compute_ranks.mjs` 中的 `ROUND_DIFFICULTY` 应与题目难度同步：
```js
const ROUND_DIFFICULTY = Object.freeze({
  1: 120,
  2: 150,
  // ... 按需补充
});
```
若题目添加后还未在此映射出现，可先添加，确保积分正确计算。

## 出题者注意事项
- 保证 `problem.md` 的 frontmatter 第一行是 `---`，结束行也是单独的 `---`。
- 避免使用复杂 YAML（脚本只支持“键: 值”和“键: |”多行块）。需要列表时建议改用 `tests.json`。
- 测试用例要能覆盖基本正确性与边界（小/大输入），避免过大导致 Wandbox 超时。
- 若题目描述需要公式或复杂 Markdown，本展示站当前不自动渲染正文，可后续扩展（例如增加题面正文区动态加载并做 Markdown 渲染）。

## 常见问题 (FAQ)
**Q: 没有 index.json 会怎样？**  
A: 脚本扫描 0..MAX_ID，遇到连续 15 个不存在的 id 会提前终止，减少浪费请求。

**Q: 新增题后多久出现在展示站？**  
A: 等待同步 Workflow 下次计划执行（每 6 小时）或手动触发 workflow。PR 合并后即生效。

**Q: 如何修改测试？**  
A: 更新源仓库对应题的 `tests.json` 或在 frontmatter 更新 `tests_file` 内容；同步后覆盖旧文件。

**Q: 是否能支持多语言长描述？**  
A: 可以：使用 `desc_zh` 和 `desc_en`。展示端可优先读取与当前语言匹配的字段。若未实现，会暂时使用 `desc`。

**Q: 测试是否支持多文件或复杂输入？**  
A: 当前只支持单一 stdin 字符串。若需多文件场景，建议简化题面或后续扩展脚本和评测逻辑。

## 后续扩展建议
- 添加 index.json 列出题号与状态（减少扫描成本）。
- 引入更完整 YAML 解析（如 js-yaml），支持数组字段（tests 直接内嵌）。
- Markdown 正文渲染：题面页面可按需 fetch `competition/problems/<id>.md` 并渲染（安全需做 XSS 过滤）。
- 评测后端化：使用自建沙箱/队列，降低对 Wandbox 的依赖与延迟。
- 测试分级：区分“快速样例”与“完整验证”以减少评测时间。

## 简易检查清单（出题者每次新增题）
1. 创建 `<id>/problem.md` 并填写 Frontmatter。  
2. （可选）创建 `<id>/tests.json`。  
3. Push 到源仓库。  
4. 在展示仓库触发 Sync workflow 或等待定时。  
5. 审阅自动 PR，确认 `competition/problems.json` 与 tests 文件正确。  
6. 更新 `ROUND_DIFFICULTY` 映射（若新增难度）。  
7. 验证题面 `<id>.html`、榜单 & 提交流程正常。  

如需进一步自动化或支持更多字段（标签、作者、发布时间等），可再扩展 Frontmatter 并调整同步脚本映射。
