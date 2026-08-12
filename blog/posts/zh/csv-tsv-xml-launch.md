---
title: "CSV ↔ TSV 互转与 CSV 转 XML 工具上线"
date: 2026-08-13
author: "AI Toolbox 团队"
category: "产品更新"
tags: ["CSV", "TSV", "XML", "数据转换", "新工具上线", "数据格式"]
description: "AI Toolbox 新增 CSV ↔ TSV 互转和 CSV 转 XML 工具，填补数据格式转换的关键缺口，助力数据处理工作流。"
---

# CSV ↔ TSV 互转与 CSV 转 XML 工具上线

今天，AI Toolbox 新增两个数据格式转换工具：**CSV ↔ TSV 互转**和 **CSV 转 XML**，完善了表格数据转换工具链。

## 🔀 CSV ↔ TSV 互转

CSV（逗号分隔值）和 TSV（制表符分隔值）是数据处理中最常用的两种表格格式。但不同工具、数据库和平台对它们的偏好各不相同——Excel 默认导出 CSV，PostgreSQL 的 `COPY` 命令偏爱 TSV，而一些老旧系统只认制表符分隔。

我们的 **CSV ↔ TSV 互转工具** 解决了这个痛点：

- **双向转换**：CSV → TSV 或 TSV → CSV，一键切换方向
- **自定义分隔符**：CSV 侧支持逗号、制表符、分号、竖线等
- **引号转义**：完整保留 CSV 的双引号转义逻辑，智能重新加引号
- **首行表头**：支持保留表头行
- **互换功能**：输出结果可直接放回输入端，快速迭代反方向转换

### 典型场景

**SQL 导入准备：** 从 Excel 导出 CSV 后，转成 TSV 供 MySQL 的 `LOAD DATA INFILE` 或 PostgreSQL 的 `COPY` 命令使用：

```
输入 CSV:
name,age,city
Alice,30,Beijing
Bob,25,Shanghai

输出 TSV:
name	age	city
Alice	30	Beijing
Bob	25	Shanghai
```

**数据格式桥接：** 在不同开发工具之间传递数据时，统一转换为目标工具期望的分隔符格式。

## 📄 CSV 转 XML

XML 仍然是许多企业系统、配置文件和 API 的标准数据交换格式。我们的 **CSV 转 XML 工具** 让表格数据到 XML 文档的转换变得简单直观：

- **自定义元素名称**：可配置根元素（默认 root）和行元素（默认 row）
- **自动字段名**：首行作表头时自动生成 XML 元素名
- **无表头模式**：自动生成 col1, col2, ... 序列名
- **XML 安全转义**：`&`、`<`、`>`、`"`、`'` 自动转义
- **缩进控制**：2 空格、4 空格或紧凑输出

### 典型场景

**系统集成：** 将数据库导出的 CSV 数据转换为 XML 供企业级 API 消费：

```
输入 CSV:
id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com

输出 XML:
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <row>
    <id>1</id>
    <name>Alice</name>
    <email>alice@example.com</email>
  </row>
  <row>
    <id>2</id>
    <name>Bob</name>
    <email>bob@example.com</email>
  </row>
</root>
```

**数据迁移：** 老旧系统的 XML 数据交换格式标准化，将 CSV 数据快速转换为目标格式。

## 🌐 隐私优先

两个工具的核心原则：**所有处理在浏览器本地完成，数据不会离开你的设备。** 无需上传文件到服务器，适合处理敏感数据。

## 🔗 立即使用

- [CSV ↔ TSV 互转工具](/tools/csv-to-tsv.html)
- [CSV 转 XML 工具](/tools/csv-to-xml.html)

更多表格数据处理工具请查看 [CSV 工具集](/text/) 和 [JSON 工具集](/json/)。