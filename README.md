# 🛠️ AI Toolbox

> 免费、极速、隐私优先的在线开发者与办公工具箱 · Free, fast, privacy-first developer & office tools

🌐 **Live**: <https://tools.talang.fun>

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 特色

- 🔒 **隐私优先** —— 所有处理在浏览器本地完成，零数据上传
- ⚡ **极速** —— 纯静态 HTML，无框架，页面加载 < 200ms
- 🌍 **中英双语** —— 全站完整 i18n
- 📱 **响应式** —— 适配桌面和移动端
- 🚀 **SEO 友好** —— 每个工具独立页面 + JSON-LD + sitemap + hreflang
- 🆓 **完全免费** —— 无注册、无侵入式广告
- 🤝 **开放合作** —— 支持工具建议、赞助合作、私有化/定制工具需求

## 🧰 当前工具（47 个）

| 分类 | 工具 |
|------|------|
| 📝 文本工具 | 字数统计、大小写转换、文本对比、文本去重、中文占位文本生成、空行清理 |
| 💻 开发者工具 | JSON 格式化、正则表达式测试、Unix 时间戳转换、进制转换、JWT 在线解码、JSON ↔ CSV 转换、颜色转换、HTML 实体编解码、JSONPath 提取、URL 参数解析、Markdown 实时预览、二维码解码、Cron 表达式解析、IP 子网计算等 |
| 📋 JSON 工具 | JSON 转 TypeScript、JSON 转 Go Struct、JSON ↔ YAML 互转 |
| 🔐 编码与转换 | Base64 编解码、URL 编解码、哈希生成器 |
| ✨ 生成器 | 密码生成器、UUID 生成器、二维码生成器、随机字符串生成 |
| 🖼️ 图片工具 | 图片压缩、图片格式转换、图片裁剪缩放、图片加水印、图片转 Base64、图片拼接、图片旋转、图片滤镜 |
| 📄 PDF 工具 | PDF 合并、PDF 分割、PDF 转图片、PDF 提取文字、图片转 PDF |

## 🏗️ 项目结构

```
ai-toolbox/
├── tools.json              # 工具配置（添加新工具只需改这里）
├── build.py                # 静态站生成器（无依赖）
├── index.html              # 自动生成
├── about.html
├── tools/*.html            # 自动生成的工具页面
├── en/                     # 英文版（自动生成）
├── assets/
│   ├── css/style.css       # 统一样式
│   └── tools/<tool>.js     # 每个工具的逻辑
├── blog/*.html             # SEO 博客文章
├── sponsor.html            # 赞助、合作和定制需求入口
├── sitemap.xml             # 自动生成
└── robots.txt              # 自动生成
```

## 🚀 本地开发

```bash
# 1. 修改工具配置或样式
# 2. 重新生成所有页面
python3 build.py

# 3. 启动本地服务器预览
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## ➕ 添加新工具

1. 在 `tools.json` 的 `tools` 数组里加一项（含 slug、name、UI、SEO 等元数据）
2. 在 `assets/tools/<slug>.js` 写工具逻辑
3. 跑 `python3 build.py`
4. `git push` 即自动部署

## 🌐 部署到 Cloudflare Pages（免费）

### 一次性配置

1. 登录 [Cloudflare Pages](https://pages.cloudflare.com)
2. **Create a project** → **Connect to Git** → 选择 `talang-tech/ai-toolbox`
3. 构建设置：
   - **Framework preset**: `None`
   - **Build command**: `python3 build.py`
   - **Build output directory**: `/` (项目根目录)
   - **Environment variable**: `PYTHON_VERSION = 3.11`
4. **Save and Deploy** → 等 1-2 分钟上线
5. 在 Cloudflare DNS 把 `tools.talang.fun` 配成 CNAME 指向 Pages 域名

### 后续部署
推 git 即可自动构建发布。

## 📈 SEO 已配置

- ✅ 每个工具独立 HTML 页面（不是 SPA）
- ✅ `<title>`、`<meta description>`、`<meta keywords>` 自动生成
- ✅ Open Graph / Twitter Card meta tags
- ✅ JSON-LD 结构化数据（`WebApplication` schema）
- ✅ `hreflang` 中英互链（避免重复内容惩罚）
- ✅ `sitemap.xml` 含所有页面
- ✅ `robots.txt` 允许全站抓取
- ✅ Canonical URLs

### 上线后必做
1. [Google Search Console](https://search.google.com/search-console) 提交 sitemap
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) 提交 sitemap
3. [百度站长平台](https://ziyuan.baidu.com) 提交（中文 SEO）

## 💰 变现路径（流量起来后）

AI Toolbox 会优先保持核心工具免费、轻量和隐私友好。商业化以不干扰工具使用为原则：赞助展示、工具定制、私有化部署和高价值 Pro 功能优先，避免侵入式广告。

| 流量级别 | 推荐变现 |
|---------|---------|
| 日 IP < 500 | 专心做内容和 SEO；开放工具建议、赞助合作和定制需求收集 |
| 日 IP 500-3000 | 非侵入式赞助位、工具方合作、开发者 SaaS 联盟推荐 |
| 日 IP 3000+ | 自托管广告位、团队/企业工具定制、Pro 功能或私有化部署 |

合作入口：<https://tools.talang.fun/sponsor>

## 🤝 Partnership & Monetization

AI Toolbox is designed to stay useful without blocking the core tool experience. Commercialization should be transparent, relevant, and low-friction.

Primary conversion paths:

- **Sponsor / partnership page**: <https://tools.talang.fun/sponsor>
- **Sponsorship or product collaboration**: [open a partnership issue](https://github.com/talang-tech/ai-toolbox/issues/new?template=sponsorship_partnership.yml)
- **Custom browser tools / private deployment**: [open a custom tool request](https://github.com/talang-tech/ai-toolbox/issues/new?template=custom_tool_private_deploy.yml)
- **Public tool suggestion**: [request a new tool](https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml)

Suitable partnership directions:

- Non-intrusive sponsored placements on relevant tool or category pages.
- Developer SaaS, API, cloud, security, productivity, and AI workflow products.
- Private/internal deployments for teams that handle sensitive data.
- Custom browser-based tools for data conversion, PDF/image processing, validation, and workflow automation.

Principles:

- Core tools remain free and usable.
- Sponsored content should be clearly marked.
- No misleading rankings or fake recommendations.
- No intrusive popups that break the tool experience.

## 📝 License

MIT © 2026 talang-tech
