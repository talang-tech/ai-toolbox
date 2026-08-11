---
title: "Text Filter and CSV Row Filter Launched"
date: 2026-08-12
author: "AI Toolbox Team"
category: "Product Update"
tags: ["text tools", "CSV", "data cleaning", "filter", "new tools"]
description: "AI Toolbox adds Text Filter (Grep) and CSV Row Filter — filter text and CSV data efficiently in your browser, no data upload required."
---

# Text Filter and CSV Row Filter Launched

Today, AI Toolbox adds two data processing tools: **Text Filter (Grep)** and **CSV Row Filter**, covering text and structured data filtering needs.

## 🔍 Text Filter (Grep)

If you use grep on the command line to search through logs, you can now do the same right in your browser. Our **Text Filter** brings a fully local grep experience:

- **Keyword filtering**: type your search term, instantly filter matching lines
- **Regex support**: enable the Regex option for JavaScript regex patterns like `^error`, `\d+\.\d+\.\d+\.\d+` for IP matching
- **Case control**: toggle case-sensitive matching on/off
- **Inverse match**: exclude matching lines — equivalent to grep's `-v` flag
- **Real-time stats**: view total lines, matched lines, and excluded lines

### Use Cases

**Log analysis:** Extract all error lines from log files:

```
Pattern: ^error
Enable Regex and Case sensitive
→ Keeps only lines starting with "error"
```

**Code search:** Find all function definitions in a code snippet:

```
Pattern: function\s+\w+
Enable Regex
→ Extracts all function declarations
```

**Data cleaning:** Exclude lines containing a keyword (inverse match):

```
Pattern: deprecated
Enable Inverse match
→ Excludes all lines containing "deprecated"
```

## 🔎 CSV Row Filter

We already have CSV Column Filter for selecting columns. But what if you need to filter rows by column value conditions? That's what CSV Row Filter does.

### 13 Condition Types

| Condition | Description | Example |
|-----------|-------------|---------|
| Equals | Exact match | column = "Beijing" |
| Not Equals | Exclude specific value | column ≠ "test" |
| Contains | Substring match | column contains "Engineering" |
| Starts With | Prefix match | column starts with "A" |
| Ends With | Suffix match | column ends with ".com" |
| Greater Than | Numeric comparison | age > 30 |
| Less Than | Numeric comparison | age < 18 |
| Greater or Equal | Numeric comparison | score ≥ 60 |
| Less or Equal | Numeric comparison | score ≤ 100 |
| In Range | Numeric range | salary 50000-100000 |
| Regex Match | Regex pattern | match email format |
| Is Empty | Empty value filter | find empty cells |
| Not Empty | Non-empty filter | keep rows with values |

### Use Cases

**Salary filter:** Extract employees with salary between 50000-100000:

```
Column: salary → Condition: In Range → Value: 50000-100000
```

**Department filter:** Keep only Engineering rows:

```
Column: department → Condition: Equals → Value: Engineering
```

**Data cleaning:** Find all records where city is not empty:

```
Column: city → Condition: Not Empty
```

## Privacy First, Local Processing

Both tools follow AI Toolbox's core principle: **all data is processed locally in your browser, never uploaded to a server.** Your logs, CSV data, and code snippets never leave your device.

## 🌐 Related Tools

- [CSV Column Filter](/en/tools/csv-column-filter.html) — Select, rename, reorder CSV columns
- [CSV Cleaner](/en/tools/csv-cleaner.html) — Clean CSV data quality issues
- [CSV Deduplicator](/en/tools/csv-dedupe.html) — Remove duplicate CSV rows
- [CSV Editor](/en/tools/csv-editor.html) — Edit CSV data online
- [Text Replace](/en/tools/text-replace.html) — Batch replace text content
- [Remove Lines](/en/tools/remove-lines.html) — Remove lines by number or blank lines

---

Try it now: [Text Filter](/en/tools/text-filter.html) | [CSV Row Filter](/en/tools/csv-row-filter.html)