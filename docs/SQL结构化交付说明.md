# SQL 结构化交付说明（panel_research.db）

> 本项目核心数据同时以 JSON 与 SQLite 双格式交付，便于批量结构化查询与转写。

## 数据库：`panel_research.db`（SQLite）

两张表，由 53 校面板 + 59 代码判别导入：

### 表 1 · `school_panel`（246 行 = 53 校 × 多年份）

| 列 | 类型 | 含义 |
|---|---|---|
| school | TEXT | 校名 |
| year | INTEGER | 年份（2022-2026） |
| retest_n | INTEGER | 一志愿复试人数 |
| admit_total / admit_first / admit_transfer | INTEGER | 总录取 / 一志愿录取 / 调剂录取 |
| score_min / score_med / score_must | INTEGER | 最低分 / 中位分 / 必达分 |
| pattern / pattern_label | TEXT | 录取模式（α/β/γ/vacuum/mixed） |
| collapse_drop | INTEGER | 门槛坍缩降幅 |
| conf | TEXT | 置信度 |

### 表 2 · `code_scan`（59 行 = 59 个二级学科代码）

| 列 | 类型 | 含义 |
|---|---|---|
| school / code / direction | TEXT | 校名 / 专业代码 / 方向名 |
| pattern | TEXT | 该代码的独立模式判别 |
| plate_2026 / must_2026 / med_2026 | INTEGER | 2026 盘子 / 必达 / 中位 |
| collapse_drop / conf | — | 坍缩降幅 / 置信度 |

## 常用查询

```sql
-- 各模式年份记录数
SELECT COUNT(*), pattern FROM school_panel GROUP BY pattern;
-- 山西大学三代码判别
SELECT school, code, pattern, must_2026 FROM code_scan WHERE school='山西大学';
-- 捡漏候选(B区+α/vacuum)
SELECT DISTINCT school, pattern, must_2026 FROM code_scan WHERE pattern IN ('alpha','vacuum') AND must_2026<=300 ORDER BY must_2026;
```

## 用途

供后续 K3 集群并行查询、网页内嵌（经 JSON API 转写）、报告批量出表。数据库为只读交付，重算请回源 JSON 台账（panel_pdf_ledger.json 等）。
