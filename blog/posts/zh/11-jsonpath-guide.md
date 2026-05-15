---
title: JSONPath 完全指南：从入门到精通
slug: jsonpath-complete-guide
date: 2026-05-15
category: dev
lang: zh-CN
description: JSONPath 是 JSON 数据的 XPath。本文从基础语法到高级应用，配合大量实例，教你如何从复杂 JSON 中快速提取所需数据。
keywords: jsonpath教程,jsonpath语法,json提取数据,jsonpath实例,jsonpath在线
---

# JSONPath 完全指南：从入门到精通

JSONPath 是一种用于从 JSON 文档中提取数据的查询语言，相当于 XML 领域的 XPath。如果你是后端开发者、测试工程师、数据分析师，或者经常需要处理 API 返回的 JSON 数据，JSONPath 能帮你节省大量手动解析的时间。

## 为什么需要 JSONPath？

假设你有这样一个 API 响应：

```json
{
  "store": {
    "book": [
      {
        "category": "编程",
        "author": "张三",
        "title": "Python 入门教程",
        "price": 89.99
      },
      {
        "category": "编程",
        "author": "李四",
        "title": "Go 语言实战",
        "price": 99.00
      },
      {
        "category": "文学",
        "author": "王五",
        "title": "人生海海",
        "price": 45.00
      }
    ],
    "bicycle": {
      "color": "红色",
      "price": 299.00
    }
  }
}
```

**问题：如何快速提取所有价格小于 90 的书名？**

用 Python 写循环需要 5 行代码。用 JSONPath，只需要一句话：

```
$.store.book[?(@.price < 90)].title
```

这就是 JSONPath 的威力——用简洁的路径表达式，从复杂的嵌套结构中精确提取数据。

---

## JSONPath 语法速查表

### 核心操作符

| 语法 | 含义 | 示例 |
|---|---|---|
| `$` | 根节点（Root Object） | `$` - 整个 JSON 对象 |
| `@` | 当前节点（Current Object） | `@.price` - 当前对象的 price 字段 |
| `.key` | 取子字段（Dot Notation） | `$.store` - store 字段的值 |
| `['key']` | 取子字段（Bracket Notation） | `$['store']` - 同上，支持特殊字符键名 |
| `..key` | 递归查找（Recursive Descent） | `$..price` - 所有层级中的 price 字段 |
| `[index]` | 数组索引 | `$.store.book[0]` - 第一本书 |
| `[start:end]` | 数组切片 | `$.store.book[0:2]` - 前两本书 |
| `[start:end:step]` | 带步长的切片 | `$.store.book[0:3:2]` - 第 1、3 本书 |
| `[*]` | 所有元素（Wildcard） | `$.store.book[*]` - 所有书 |
| `[?(condition)]` | 条件过滤（Filter Expression） | `$.[?(@.price > 50)]` - 价格大于 50 的所有元素 |

---

## 常用场景实例详解

### 场景 1：提取嵌套字段

**问题：获取自行车的颜色**

```json
JSONPath: $.store.bicycle.color
结果: "红色"
```

### 场景 2：提取数组所有元素的某字段

**问题：获取所有书的作者名**

```json
JSONPath: $..author
结果: ["张三", "李四", "王五"]
```

`..` 会递归查找所有层级，非常实用。

### 场景 3：数组索引访问

**问题：获取第一本书的完整信息**

```json
JSONPath: $.store.book[0]
结果: {"category": "编程", "author": "张三", "title": "Python 入门教程", "price": 89.99}
```

**问题：获取最后一本书**

```json
JSONPath: $.store.book[-1:]
结果: [{"category": "文学", "author": "王五", ...}]
```

### 场景 4：条件过滤

**问题：找出所有价格小于 90 的书**

```json
JSONPath: $.store.book[?(@.price < 90)]
结果: [{"category": "编程", "author": "张三", ...}]
```

**问题：找出所有编程类的书**

```json
JSONPath: $.store.book[?(@.category == '编程')]
结果: 前两本书的完整对象
```

### 场景 5：组合条件

**问题：找出编程类且价格小于 95 的书**

```json
JSONPath: $.store.book[?(@.price < 95 && @.category == '编程')]
结果: 第一本书（Python 入门教程）
```

支持的比较运算符：`==`, `!=`, `<`, `<=`, `>`, `>=`

支持的逻辑运算符：`&&`（与）, `||`（或）

### 场景 6：存在性检查

**问题：找出所有有 isbn 字段的书**

```json
JSONPath: $.store.book[?(@.isbn)]
```

### 场景 7：多值选择

**问题：提取第一本书的作者和书名**

```json
JSONPath: $.store.book[0]['author', 'title']
结果: {"author": "张三", "title": "Python 入门教程"}
```

---

## 常见陷阱与注意事项

### 陷阱 1：根节点容易忘写

❌ 错误：`store.book[0].title`  
✅ 正确：`$.store.book[0].title`

### 陷阱 2：字符串必须用引号

❌ 错误：`?(@.category == 编程)`  
✅ 正确：`?(@.category == '编程')`

### 陷阱 3：过滤条件的括号

❌ 错误：`$.[@.price > 50]`  
✅ 正确：`$.[?(@.price > 50)]`

### 陷阱 4：数组索引从 0 开始

和所有编程语言一样，JSONPath 的数组索引从 0 开始。

### 陷阱 5：不同实现的差异

不同语言的 JSONPath 库可能有细微差异，比如：
- Python 的 jsonpath-ng 支持更多语法
- JavaScript 的 JSONPath 可能略有不同
- Postman 内置的 JSONPath 也有自己的特性

使用时建议结合具体库的文档。

---

## 在线工具推荐

使用我们的 [**JSONPath 在线提取工具**](/tools/jsonpath)，可以实时输入 JSON 和路径表达式，立即看到提取结果。

这是学习 JSONPath 和调试复杂表达式的最佳伴侣：
- ✅ 实时预览结果
- ✅ 语法错误提示
- ✅ 所有处理在浏览器本地完成
- ✅ 完全免费，无需注册

---

## 高级技巧

### 技巧 1：使用括号表示法处理特殊字符键名

如果 JSON 的键名包含空格、特殊字符，或者以数字开头，用点表示法会失败，此时需要用括号表示法：

```json
JSONPath: $.store['special-key']
```

### 技巧 2：长度函数

```json
JSONPath: $.store.book.length()
结果: 3
```

### 技巧 3：正则表达式匹配（部分实现支持）

```json
JSONPath: $.store.book[?(@.title =~ /Python/i)]
结果: 标题包含 Python 的书（不区分大小写）
```

---

## 各语言中的 JSONPath 库

| 语言 | 推荐库 |
|---|---|
| **Python** | `jsonpath-ng`, `jsonpath-rw` |
| **JavaScript** | `jsonpath` npm 包 |
| **Java** | `Jayway JsonPath` |
| **Go** | `github.com/oliveagle/jsonpath` |
| **PHP** | `jsonpath` 扩展 |

### Python 示例：

```python
from jsonpath_ng import jsonpath, parse

data = {"store": {"book": [...]}}

# 解析路径表达式
jsonpath_expr = parse('$.store.book[*].author')

# 提取数据
matches = jsonpath_expr.find(data)

# 获取结果
authors = [match.value for match in matches]
print(authors)  # ['张三', '李四', '王五']
```

---

## JSONPath 的替代方案

虽然 JSONPath 是最常用的，但也有一些替代方案：

| 方案 | 特点 |
|---|---|
| **JMESPath** | 语法更强大，AWS 官方使用 |
| **jq** | 命令行 JSON 处理工具，有自己的语法 |
| **JSON Pointer** | RFC 标准，定位单个值，不支持查询 |
| **GraphQL** | 服务端查询语言，适合 API 场景 |

选择建议：
- 简单数据提取 → JSONPath
- 复杂转换 → JMESPath/jq
- API 场景 → GraphQL

---

## 实战练习

用上面的示例 JSON，试试这些练习：

1. 获取自行车的价格
2. 获取所有书的标题
3. 获取第二本书的作者
4. 找出价格大于 50 的书
5. 找出所有作者名包含"李"的书

<details>
<summary>点击查看答案</summary>

1. `$.store.bicycle.price`
2. `$..title`
3. `$.store.book[1].author`
4. `$.store.book[?(@.price > 50)]`
5. `$.store.book[?(@.author contains '李')]`（具体语法取决于实现）

</details>

---

## 总结

JSONPath 是一个简单但强大的工具，掌握它可以让你处理 JSON 数据的效率提升数倍。

### 核心要点回顾：
1. ✅ `$` 表示根节点，不要忘记
2. ✅ `.key` 取子字段，`..key` 递归查找
3. ✅ `[index]` 数组索引，`[*]` 所有元素
4. ✅ `[?(@.condition)]` 条件过滤
5. ✅ 用在线工具调试学习最快

### 下一步：
- 访问我们的 [JSONPath 在线提取工具](/tools/jsonpath) 练习
- 在你的项目中引入 JSONPath 库
- 下次处理 API 响应时，试试用 JSONPath 代替手动循环

---

**相关工具推荐：**
- [JSON 格式化工具](/tools/json-formatter) - 美化和校验 JSON
- [JSON ↔ CSV 转换](/tools/json-csv) - JSON 与 CSV 互转
- [JWT 在线解码](/tools/jwt-decoder) - 解析 JWT Token

*本文使用 AI 工具盒子的 Markdown 预览工具编写*
