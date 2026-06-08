# 🛠️ AI Toolbox

> 免费、极速、隐私优先的在线开发者与办公工具箱。<br>
> Free, fast, privacy-first developer & office tools that run locally in your browser.

🌐 **Live**: <https://tools.talang.fun><br>
🤝 **Sponsor / Partnership**: <https://tools.talang.fun/sponsor>

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Privacy First](https://img.shields.io/badge/Privacy-Browser%20Local-brightgreen)](https://tools.talang.fun/about)

---

## Why AI Toolbox?

很多在线工具很好用，但处理 JSON、JWT、PDF、图片、日志、接口返回值时，经常会遇到一个问题：**数据会不会被上传到第三方服务器？**

AI Toolbox 的定位不是 AI 导航站，而是一个 **privacy-first browser toolbox**：

- 🔒 **浏览器本地处理**：尽量使用 Web API / 前端 JS 在本地完成转换、解析、压缩和生成。
- 🚫 **不上传用户输入**：JSON、JWT、文本、图片、PDF、密码等内容不会上传到 AI Toolbox 服务器。
- ⚡ **纯静态站点**：无后端依赖，部署在 Cloudflare Pages，加载快、维护简单。
- 🧰 **高频工具集合**：覆盖开发、办公、文本、图片、PDF、编码转换等日常场景。
- 🌍 **中英双语**：中文 SEO 和英文工具页同时支持。

---

## Popular Tools

| Tool | 中文入口 | English |
|------|---------|---------|
| JSON Formatter | [JSON 格式化](https://tools.talang.fun/tools/json-formatter) | [JSON Formatter](https://tools.talang.fun/en/tools/json-formatter) |
| Base64 Encoder / Decoder | [Base64 编解码](https://tools.talang.fun/tools/base64) | [Base64](https://tools.talang.fun/en/tools/base64) |
| JWT Decoder | [JWT 解码](https://tools.talang.fun/tools/jwt-decoder) | [JWT Decoder](https://tools.talang.fun/en/tools/jwt-decoder) |
| Regex Tester | [正则测试](https://tools.talang.fun/tools/regex-tester) | [Regex Tester](https://tools.talang.fun/en/tools/regex-tester) |
| YAML Formatter / Validator | [YAML 格式化/校验](https://tools.talang.fun/tools/yaml-formatter) | [YAML Formatter](https://tools.talang.fun/en/tools/yaml-formatter) |
| XML Formatter / Minifier | [XML 格式化/压缩](https://tools.talang.fun/tools/xml-formatter) | [XML Formatter](https://tools.talang.fun/en/tools/xml-formatter) |
| Unix Timestamp | [时间戳转换](https://tools.talang.fun/tools/timestamp) | [Timestamp Converter](https://tools.talang.fun/en/tools/timestamp) |
| Hash Generator | [MD5 / SHA 哈希](https://tools.talang.fun/tools/hash-generator) | [Hash Generator](https://tools.talang.fun/en/tools/hash-generator) |
| Password Generator | [密码生成器](https://tools.talang.fun/tools/password-generator) | [Password Generator](https://tools.talang.fun/en/tools/password-generator) |
| Image Compress | [图片压缩](https://tools.talang.fun/tools/image-compress) | [Image Compress](https://tools.talang.fun/en/tools/image-compress) |
| PDF Merge | [PDF 合并](https://tools.talang.fun/tools/pdf-merge) | [PDF Merge](https://tools.talang.fun/en/tools/pdf-merge) |
| PDF Split | [PDF 拆分](https://tools.talang.fun/tools/pdf-split) | [PDF Split](https://tools.talang.fun/en/tools/pdf-split) |

---

## Current Tools: 49+

| Category | Tools |
|----------|-------|
| 📝 Text | Word counter, case converter, text diff, text deduplication, blank-line remover, Chinese lorem ipsum |
| 💻 Developer | JSON formatter, regex tester, timestamp converter, base converter, JWT decoder, JSON ↔ CSV, color converter, HTML entity encoder/decoder, JSONPath, URL parser, YAML formatter/validator, XML formatter/minifier, Markdown preview, QR decoder, Cron parser, IP subnet calculator |
| 📋 JSON | JSON to TypeScript, JSON to Go struct, JSON ↔ YAML |
| 🔐 Encode / Convert | Base64, URL encoder/decoder, hash generator |
| ✨ Generators | Password generator, UUID generator, QR code generator, random string generator |
| 🖼️ Image | Compress, convert, resize, watermark, image to Base64, merge, rotate, filters |
| 📄 PDF | Merge, split, PDF to image, extract text, image to PDF |

---

## Privacy Model

AI Toolbox is designed for sensitive everyday data:

- API responses and JSON snippets
- JWT tokens and headers
- Internal logs and text fragments
- PDF contracts, invoices, reports, and screenshots
- Images that should not be uploaded to random online services
- Passwords, hashes, UUIDs, and random strings

Most tools run entirely in the browser. Basic analytics may record page views and conversion clicks, but **user input and file content are not tracked or uploaded**.

---

## Local Development

```bash
# 1. Edit tools.json, assets, styles, or blog posts

# 2. Generate static pages
python3 build.py

# 3. Preview locally
python3 -m http.server 8000
# Open http://localhost:8000
```

Run tests:

```bash
python3 scripts/run_tests.py
python3 scripts/seo_analyzer.py
```

---

## Add a New Tool

1. Add metadata, UI, SEO fields, related tools, features, and FAQ to `tools.json`.
2. Add frontend logic in `assets/tools/<slug>.js`.
3. Run:

```bash
python3 build.py
python3 scripts/run_tests.py
```

4. Commit and push. Cloudflare Pages will deploy automatically.

---

## Project Structure

```text
ai-toolbox/
├── tools.json                    # Tool metadata and generated UI config
├── build.py                      # Static site generator, no framework required
├── index.html                    # Generated homepage
├── tools/*.html                  # Generated Chinese tool pages
├── en/tools/*.html               # Generated English tool pages
├── blog/*.html                   # Generated SEO blog pages
├── assets/
│   ├── css/style.css             # Shared styles
│   └── tools/<tool>.js           # Tool-specific browser logic
├── scripts/
│   ├── run_tests.py              # Basic test runner
│   ├── seo_analyzer.py           # SEO / performance checks
│   └── baidu_submit.py           # Baidu URL push helper
├── docs/
│   └── BAIDU_SUBMIT.md           # Baidu URL submission automation
├── .github/workflows/
│   └── baidu-submit.yml          # Scheduled Baidu URL submission
├── sponsor.html                  # Sponsorship / partnership / custom tools
├── sitemap.xml                   # Generated sitemap
└── robots.txt                    # Generated robots.txt
```

---

## Deployment

AI Toolbox is deployed as a static site on Cloudflare Pages.

Recommended Cloudflare Pages settings:

- **Framework preset**: `None`
- **Build command**: `python3 build.py`
- **Build output directory**: `/`
- **Environment variable**: `PYTHON_VERSION = 3.11`

After setup, every push to `main` deploys automatically.

---

## SEO Status

Configured:

- ✅ Static HTML pages for every tool, no SPA indexing issue
- ✅ Per-page title, description, keywords, canonical URL
- ✅ Open Graph and Twitter Card metadata
- ✅ JSON-LD `WebApplication` schema on tool pages
- ✅ `hreflang` for Chinese / English pages
- ✅ `sitemap.xml` with all generated pages
- ✅ `robots.txt` allows normal search crawlers
- ✅ Baidu site verification meta tag
- ✅ Baidu URL push helper and scheduled GitHub Actions workflow

Recommended search console submissions:

```text
https://tools.talang.fun/sitemap.xml
```

Submit to:

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Baidu Search Resource Platform](https://ziyuan.baidu.com)

---

## Baidu URL Push

The repository includes a Baidu URL submission script. Keep the token in environment variables or GitHub Secrets only.

```bash
BAIDU_PUSH_TOKEN=*** python3 scripts/baidu_submit.py --limit 10 --mode zh-first
```

GitHub Actions secret:

```text
BAIDU_PUSH_TOKEN
```

See [`docs/BAIDU_SUBMIT.md`](docs/BAIDU_SUBMIT.md) for details.

---

## Partnership & Monetization

AI Toolbox keeps the core tool experience free, lightweight, and privacy-friendly. Commercialization should be transparent, relevant, and non-intrusive.

Primary conversion paths:

- **Sponsor / partnership page**: <https://tools.talang.fun/sponsor>
- **Sponsorship or product collaboration**: [open a partnership issue](https://github.com/talang-tech/ai-toolbox/issues/new?template=sponsorship_partnership.yml)
- **Custom browser tools / private deployment**: [open a custom tool request](https://github.com/talang-tech/ai-toolbox/issues/new?template=custom_tool_private_deploy.yml)
- **Public tool suggestion**: [request a new tool](https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml)

Suitable partnership directions:

- Non-intrusive sponsored placements on relevant tool or category pages
- Developer SaaS, API, cloud, security, productivity, and AI workflow products
- Private/internal deployments for teams that handle sensitive data
- Custom browser-based tools for data conversion, PDF/image processing, validation, and workflow automation

Principles:

- Core tools remain free and usable.
- Sponsored content should be clearly marked.
- No misleading rankings or fake recommendations.
- No intrusive popups that break the tool experience.

---

## Roadmap

- More privacy-first PDF and image tools
- More JSON / YAML / CSV / SQL developer utilities
- More Chinese SEO guides for common tool workflows
- Optional self-hosted/private deployment guide
- Better accessibility checks and UI polish
- More automation for search submission and content publishing

---

## License

MIT © 2026 talang-tech
