---
title: JSONPath 完全教程：从入门到精通
slug: jsonpath-tutorial
date: 2026-05-14
category: data
lang: zh-CN
description: JSONPath 是 JSON 数据的 XPath，本文从基础语法到高级应用，配合大量实例，教你如何从复杂 JSON 中快速提取所需数据。
keywords: jsonpath教程,jsonpath语法,json提取数据,jsonpath实例
---

# JSONPath 完全教程：从入门到精通

JSONPath 是一种用于从 JSON 文档中提取数据的查询语言，相当于 XML 领域的 XPath。如果你经常需要处理 API 返回的 JSON 数据，JSONPath 能帮你节省大量手动解析的时间。

## 为什么需要 JSONPath？

假设你有这样一个 API 响应：

```json
{
  "store": {
    "book": [
      {"category": "编程", "author": "张三", "title": "Python 入门", "price": 89},
      {"category": "编程", "author": "李四", "title": "Go 语言实战", "price": 99},
      {"category": "文学", "author": "王五", "title": "人生海海", "price": 45}
    ],
    "bicycle": {"color": "红色", "price": 299}
  }
}
```

问题：如何**快速提取所有价格小于 90 的书名**？

用 Python 写循环需要 5 行代码。用 JSONPath，只需要一句话：

```
$.store.book[?(@.price < 90)].title
```

## JSONPath 语法速查表

| 语法 | 含义 | 示例 |
|---|---|---|
| `$` | 根节点 | `$` - 整个 JSON 对象 |
| `@` | 当前节点 | `@.price` - 当前对象的 price 字段 |
| `.key` | 取子字段 | `$.store` - store 字段的值 |
| `..key` | 递归查找 | `$..price` - 所有层级中的 price 字段 |
| `[index]` | 取数组下标 | `$.store.book[0]` - 第一本书 |
| `[start:end]` | 数组切片 | `$.store.book[0:2]` - 前两本书 |
| `[*]` | 所有元素 | `$.store.book[*]` - 所有书 |
| `[?(condition)]` | 条件过滤 | `$.[?(@.price > 50)]` - 价格大于 50 的 |

## 常用场景举例

### 场景 1：提取嵌套字段

```
JSONPath: $.store.bicycle.color
结果: "红色"
```

### 场景 2：提取数组所有元素的某字段

```
JSONPath: $..author
结果: ["张三", "李四", "王五"]
```

### 场景 3：条件过滤

```
JSONPath: $.store.book[?(@.category == '编程')].title
结果: ["Python 入门", "Go 语言实战"]
```

### 场景 4：多条件组合

```
JSONPath: $.store.book[?(@.price < 100 && @.category == '编程')]
结果: 两本编程书的完整对象
```

## 常见陷阱

**陷阱 1：根节点容易忘写**

❌ 错误：`store.book[0].title`  
✅ 正确：`$.store.book[0].title`

**陷阱 2：过滤条件的括号**

❌ 错误：`$.[@.price > 50]`  
✅ 正确：`$.[?(@.price > 50)]`

**陷阱 3：字符串必须用引号**

❌ 错误：`?(@.category == 编程)`  
✅ 正确：`?(@.category == '编程')`

## 在线工具推荐

使用我们的 [JSONPath 提取工具](/tools/jsonpath)，可以实时输入 JSON 和路径，立即看到提取结果，是学习和调试的最佳伴侣。

## 进阶技巧

### 多值选择

```
JSONPath: $.store.book[0]['author', 'title']
结果: {"author": "张三", "title": "Python 入门"}
```

### 否定条件

```
JSONPath: $.store.book[?(@.category != '文学')]
```

### 存在性检查

```
JSONPath: $.store.book[?(@.isbn)]
```

---

JSONPath 是数据处理工程师、后端开发者、API 测试工程师的必备技能。掌握它，能让你处理 JSON 数据的效率提升数倍。
