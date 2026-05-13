# 🛠️ AI Toolbox

> 免费、极速、隐私优先的在线工具集 · Free, fast, privacy-first online tools

🌐 **Live**: <https://tools.talang.fun>

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 特色

- 🔒 **隐私优先** —— 所有处理在浏览器本地完成，零数据上传
- ⚡ **极速** —— 纯静态 HTML，无框架，页面加载 < 200ms
- 🌍 **中英双语** —— 全站完整 i18n
- 📱 **响应式** —— 适配桌面和移动端
- 🚀 **SEO 友好** —— 每个工具独立页面 + JSON-LD + sitemap + hreflang
- 🆓 **完全免费** —— 无注册、无广告、无追踪

## 🧰 当前工具（11 个）

| 分类 | 工具 |
|------|------|
| 📝 文本工具 | 字数统计、大小写转换、文本对比 |
| 💻 开发者工具 | JSON 格式化、正则表达式测试 |
| 🔐 编码与转换 | Base64、URL 编解码、哈希生成（MD5/SHA） |
| ✨ 生成器 | 密码生成、UUID 生成、二维码生成 |

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
│   └── js/<tool>.js        # 每个工具的逻辑
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
2. 在 `assets/js/<slug>.js` 写工具逻辑
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

| 流量级别 | 推荐变现 |
|---------|---------|
| 日 IP < 500 | 啥也别加，专心做内容和 SEO |
| 日 IP 500-3000 | Google AdSense 申请、淘宝/京东联盟 |
| 日 IP 3000+ | 加自托管广告位、Pro 订阅功能 |

## 📝 License

MIT © 2026 talang-tech
