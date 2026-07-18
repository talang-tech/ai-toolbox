---
title: "CSS 转 SCSS 和 HTML 转 Pug 转换器上线，模板转换更高效"
date: 2026-07-18
tags: [更新, 新工具, CSS, SCSS, SASS, Pug, Jade, 前端开发, Node.js]
---

# 🔄 CSS 转 SCSS/SASS 和 HTML 转 Pug 转换器上线

AI 工具盒子今天新增两款实用的代码转换工具——**CSS 转 SCSS/SASS 转换器**和 **HTML 转 Pug 转换器**，帮助前端开发者更高效地处理样式和模板的格式转换。

## CSS 转 SCSS/SASS 转换器

新的 [CSS 转 SCSS/SASS 转换器](/tools/css-to-scss) 将标准 CSS 样式快速转换为 SCSS 或 SASS 嵌套语法，适合重构旧项目或学习 SCSS 预处理。

**主要功能：**

- **自动嵌套**：智能识别父子选择器关系，自动生成嵌套结构
- **双格式输出**：支持 SCSS（花括号）和 SASS（缩进）两种语法
- **变量提取**：自动提取 CSS 自定义属性（--xxx）为 SCSS 变量（$xxx）
- **一键复制**：Ctrl+Enter 快捷键快速转换

**示例：**

```css
/* 输入 CSS */
.navbar { background: #333; }
.navbar .nav-link { color: white; }
.navbar .nav-link:hover { color: #ddd; }
```

```scss
/* 输出 SCSS */
.navbar {
  background: #333;
  & .nav-link {
    color: white;
    &:hover {
      color: #ddd;
    }
  }
}
```

## HTML 转 Pug 转换器

新的 [HTML 转 Pug 转换器](/tools/html-to-pug) 将 HTML 标签转换为 Pug（原 Jade）模板语法，支持类名/ID 简写、属性、自闭合标签等。

**主要功能：**

- **完整语法转换**：元素、属性、类名、ID、文本内容完整转换
- **智能简写**：自动将 class 和 id 转换为 .class 和 #id 简写形式
- **自闭合标签**：正确识别 img、br、input 等自闭合标签
- **嵌套结构**：保留原 HTML 的嵌套层级关系

**示例：**

```html
<!-- 输入 HTML -->
<div class="container" id="main">
  <h1>Hello World</h1>
  <p class="desc">This is a paragraph.</p>
  <img src="image.jpg" alt="Image">
</div>
```

```pug
/* 输出 Pug */
div.container#main
  h1 Hello World
  p.desc This is a paragraph.
  img(src="image.jpg" alt="Image")
```

## 为什么选择本地处理？

和 AI 工具盒子的所有工具一样，这两款工具完全在浏览器中运行：

1. **隐私保护**：代码不会离开你的设备
2. **即时响应**：无需等待服务器，瞬间出结果
3. **无需安装**：不需要安装 Node.js 或任何预处理工具

## 适用场景

- SCSS 迁移：将旧 CSS 项目重构为 SCSS 风格
- 模板转换：将 HTML 模板迁移到 Express.js 的 Pug 视图
- 前端学习：帮助理解 CSS 嵌套和 Pug 缩进语法
- 代码批量转换：快速处理大量样式和模板文件

立即体验：[CSS 转 SCSS/SASS 转换器](/tools/css-to-scss) 和 [HTML 转 Pug 转换器](/tools/html-to-pug)