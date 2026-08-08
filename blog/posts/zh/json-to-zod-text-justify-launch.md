---
title: "新工具发布：JSON 转 Zod Schema 生成器与文本对齐工具"
date: 2026-08-08
readtime: 3 分钟
description: "新增两个浏览器本地工具：从 JSON 自动生成 Zod 验证 Schema，以及将文本按指定宽度两端对齐排版。隐私优先，数据不上传。"
keywords: "JSON转Zod,Zod Schema生成,文本对齐,文本两端对齐,新工具,AI工具盒子,浏览器本地,typescript验证"
---

今天 AI 工具盒子新增两个实用工具：

## 🔮 JSON 转 Zod Schema 生成器

TypeScript 开发者看过来。[JSON 转 Zod](/tools/json-to-zod) 可以从你的 JSON 数据自动生成 [Zod](https://zod.dev) 验证 Schema。

**为什么是 Zod？** Zod 是 TypeScript 生态中最流行的 Schema 验证库，被 Next.js、tRPC、Remix 等无数项目使用。手动写 Schema 既繁琐又容易出错——这个工具帮你一步到位。

**支持的特性：**
- 嵌套对象和数组（任意深度）
- 类型推断：`string`、`number`、`boolean`、`array`、`object`
- 可选字段检测（通过 `null` 值）
- 枚举值自动推断
- 特殊格式检测：`.email()`、`.url()`、`.uuid()`、`.datetime()`
- 严格模式 `.strict()`

**示例：** 粘贴以下 JSON：

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30,
  "role": "admin",
  "tags": ["dev", "design"]
}
```

即可生成：

```typescript
import { z } from 'zod';

export const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int(),
  role: z.string(),
  tags: z.array(z.string()),
}).strict();
```

## 📐 文本对齐工具

[文本对齐](/tools/text-justify) 将普通文本按指定宽度进行两端对齐排版，支持多种对齐方式和自定义选项。

**适用场景：**
- 代码注释对齐
- ASCII 艺术表格
- 邮件正文格式化
- 纯文本文档排版
- 终端输出格式化

**功能特点：**
- 两端对齐、左对齐、右对齐、居中
- 自定义填充字符（空格、点、横线等）
- 首行缩进
- 段落间距调整
- 保留或自动合并段落换行
- 实时统计行数/词数/字符数

## 为什么两个工具都是浏览器本地处理

和 AI 工具盒子的所有工具一样，两者完全在浏览器中运行。你的 JSON 数据和文本不会离开你的设备。无需上传、无需注册、无需追踪。

## 下一步计划

我们正在开发更多 JSON 相关工具（JSON 转 Yup、JSON 转 Joi）和文本格式化工具。有想法？[在 GitHub 上提 Issue](https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml)。