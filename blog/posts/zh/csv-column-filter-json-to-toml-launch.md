---
title: CSV 列选择器 + JSON 转 TOML：数据格式转换工具更新
slug: csv-column-filter-json-to-toml-launch
date: 2026-08-11
category: data
lang: zh-CN
description: AI 工具盒子新增 CSV 列选择器和 JSON 转 TOML 两个实用工具，帮助开发者更高效地处理 CSV 列操作和配置文件格式转换。
keywords: CSV列选择器,JSON转TOML,CSV列操作,TOML格式,数据转换工具,在线工具,CSV工具,TOML工具
---

# CSV 列选择器 + JSON 转 TOML：数据格式转换工具更新

本次更新带来了两个新工具，分别解决数据处理中的两个常见痛点：CSV 列操作和配置文件格式转换。

## CSV 列选择器

处理 CSV 数据时，经常遇到只需要其中几列的情况。虽然可以用 Excel 或者写脚本处理，但都不够快捷。

**CSV 列选择器** 让你可以直接在浏览器中：

- **勾选需要的列** — 可视化界面，勾选即保留
- **拖动调整顺序** — 通过拖拽重新排列列的顺序
- **重命名列名** — 在导出前直接修改列名
- **自定义分隔符** — 支持逗号、制表符、分号等

所有处理在浏览器本地完成，数据不会上传到服务器。

## JSON 转 TOML

TOML 是一种日益流行的配置文件格式，被 Cargo.toml、pyproject.toml、Cargo.lock 等广泛采用。如果你需要从 API 获取 JSON 数据然后转为 TOML 配置，这个工具能帮你节省时间。

**JSON 转 TOML** 支持：

- 嵌套对象自动转为 TOML 节（section）
- 智能识别数组类型：纯值数组转为内联数组，对象数组转为表数组（`[[array]]`）
- 完整的 TOML v1.0 规范输出
- 一键复制结果

## 使用场景

- **数据处理**：从 CSV 报表中提取关键列，调整顺序后导出
- **配置迁移**：将 JSON 格式的配置转为 TOML 格式，用于 Rust 项目或 Python 项目
- **数据清洗**：先用列选择器提取需要的列，再用 CSV 清洗工具处理质量问题

## 隐私优先

所有工具都在浏览器本地运行，数据不会上传到任何服务器。你可以放心处理敏感数据。

## 在线体验

- [CSV 列选择器](/tools/csv-column-filter)
- [JSON 转 TOML](/tools/json-to-toml)
- [全部工具列表](/tools/)