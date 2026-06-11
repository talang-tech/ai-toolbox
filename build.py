#!/usr/bin/env python3
"""
AI Toolbox - 静态站点生成器
读取 tools.json 配置，生成所有中英文页面 + sitemap。
零依赖，纯 Python 标准库。
"""
import json
import os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent
SITE_URL = "https://tools.talang.fun"
SITE_NAME_ZH = "AI 工具盒子"
SITE_NAME_EN = "AI Toolbox"

# 加载工具配置
with open(ROOT / "tools.json", encoding="utf-8") as f:
    DATA = json.load(f)

TOOLS = DATA["tools"]
CATEGORIES = DATA["categories"]


def repo_last_modified(path):
    """Return YYYY-MM-DD of the last git commit touching a file, or None."""
    import subprocess
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(path)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        value = result.stdout.strip()
        return value or None
    except Exception:
        return None


def file_last_modified(path):
    """Return YYYY-MM-DD from the file mtime."""
    try:
        return datetime.fromtimestamp(Path(path).stat().st_mtime, tz=timezone.utc).strftime("%Y-%m-%d")
    except OSError:
        return None


def post_last_modified(post):
    """Prefer frontmatter date for blog posts; fall back to git/file mtime."""
    date = str(post.get("date", "")).strip()
    if date:
        return date[:10]
    source = post.get("source_path")
    return (repo_last_modified(source) if source else None) or (file_last_modified(source) if source else None)


def tool_last_modified(tool):
    """Use the latest relevant git date for a generated tool page."""
    candidates = [
        ROOT / "tools.json",
        ROOT / "build.py",
        ROOT / "assets" / "tools" / f"{tool['slug']}.js",
        ROOT / "assets" / "tools" / "_utils.js",
        ROOT / "assets" / "css" / "style.css",
    ]
    dates = [repo_last_modified(p) or file_last_modified(p) for p in candidates]
    dates = [d for d in dates if d]
    return max(dates) if dates else datetime.now(timezone.utc).strftime("%Y-%m-%d")


SITE_LASTMOD = repo_last_modified(ROOT / "build.py") or datetime.now(timezone.utc).strftime("%Y-%m-%d")


def base_layout(*, lang, title, description, keywords, canonical, body, extra_head=""):
    """统一页面布局 (HTML5 + SEO)"""
    is_en = lang == "en"
    site_name = SITE_NAME_EN if is_en else SITE_NAME_ZH
    nav_home = "Home" if is_en else "首页"
    nav_tools = "All Tools" if is_en else "所有工具"
    nav_blog = "Blog" if is_en else "博客"
    nav_about = "About" if is_en else "关于"
    nav_sponsor = "Sponsor" if is_en else "合作"
    lang_label = "中文" if is_en else "EN"
    lang_href = canonical.replace(f"{SITE_URL}/en", SITE_URL) if is_en else canonical.replace(SITE_URL, f"{SITE_URL}/en")
    if is_en and "/en/" not in canonical and not canonical.endswith("/en"):
        lang_href = canonical
    home_href = "/en/" if is_en else "/"
    tools_href = "/en/#tools" if is_en else "/#tools"
    blog_href = "/en/blog/" if is_en else "/blog/"
    about_href = "/en/about" if is_en else "/about"
    sponsor_href = "/en/sponsor" if is_en else "/sponsor"
    footer_text = (
        f"© {datetime.now().year} {site_name} · Free online AI & developer tools · "
        f"<a href='{about_href}'>About</a> · "
        f"<a href='/en/sponsor'>Sponsor</a> · "
        f"<a href='https://github.com/talang-tech/ai-toolbox'>GitHub</a>"
        if is_en else
        f"© {datetime.now().year} {site_name} · 免费在线 AI 与开发者工具 · "
        f"<a href='{about_href}'>关于</a> · "
        f"<a href='/sponsor'>合作</a> · "
        f"<a href='https://github.com/talang-tech/ai-toolbox'>GitHub</a>"
    )
    # Alternate hreflang
    alt_zh = canonical.replace(f"{SITE_URL}/en", SITE_URL) if is_en else canonical
    alt_en = canonical if is_en else canonical.replace(SITE_URL, f"{SITE_URL}/en")
    return f"""<!DOCTYPE html>
<html lang="{'en' if is_en else 'zh-CN'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="baidu-site-verification" content="codeva-GefzDJXvPs">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="keywords" content="{keywords}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="zh-CN" href="{alt_zh}">
<link rel="alternate" hreflang="en" href="{alt_en}">
<link rel="alternate" hreflang="x-default" href="{alt_zh}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛠️</text></svg>">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZHFBWSPZML"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-ZHFBWSPZML');</script>
{extra_head}
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="{home_href}" class="logo"><span class="logo-icon">🛠️</span>{site_name}</a>
    <nav class="nav">
      <a href="{home_href}">{nav_home}</a>
      <a href="{tools_href}">{nav_tools}</a>
      <a href="{blog_href}">{nav_blog}</a>
      <a href="{about_href}">{nav_about}</a>
      <a href="{sponsor_href}">{nav_sponsor}</a>
      <a href="{lang_href}" class="lang-switch">{lang_label}</a>
    </nav>
  </div>
</header>
<main class="container">
{body}
</main>
<footer class="site-footer">
  {footer_text}
</footer>
<div id="toast" class="toast"></div>
<script>
function toast(msg) {{
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}}
function copyToClipboard(text) {{
  navigator.clipboard.writeText(text).then(() => toast('{"Copied!" if is_en else "已复制!"}'));
}}
function trackEvent(action, params) {{
  if (typeof gtag !== 'function') return;
  gtag('event', action, Object.assign({{
    event_category: 'engagement',
    page_location: window.location.href
  }}, params || {{}}));
}}
document.addEventListener('click', function(e) {{
  const link = e.target.closest('a[data-event]');
  if (!link) return;
  trackEvent(link.dataset.event, {{
    event_label: link.dataset.label || link.textContent.trim(),
    link_url: link.href
  }});
}});
</script>
</body>
</html>"""


def home_page(lang):
    """首页 - 列出所有分类和工具"""
    is_en = lang == "en"
    canonical = f"{SITE_URL}/en/" if is_en else f"{SITE_URL}/"
    title = "AI Toolbox - Free Online AI & Developer Tools" if is_en else "AI 工具盒子 - 免费在线 AI 与开发者工具集合"
    desc = (
        "Free, fast, privacy-first online tools: JSON formatter, Base64, word counter, regex tester, password generator, QR code, and more. No signup required."
        if is_en else
        "免费、极速、隐私优先的在线工具集：JSON 格式化、Base64 编解码、字数统计、正则测试、密码生成、二维码等。无需注册，所有处理在浏览器本地完成。"
    )
    keywords = (
        "online tools, free tools, JSON formatter, Base64 encoder, regex tester, password generator, QR code generator, developer tools, AI tools"
        if is_en else
        "在线工具,免费工具,JSON 格式化,Base64 编解码,正则测试,密码生成,二维码生成,开发者工具,AI 工具"
    )
    hero_h1 = "AI Toolbox" if is_en else "AI 工具盒子"
    hero_p = (
        "A growing collection of free, fast online tools — all running locally in your browser."
        if is_en else
        "持续成长的免费在线工具集 —— 所有处理都在你的浏览器本地完成，零数据上传。"
    )
    search_ph = "Search tools..." if is_en else "搜索工具..."

    # 分类显示
    sections_html = ""
    for cat_id in CATEGORIES["order"]:
        cat = CATEGORIES["items"][cat_id]
        cat_name = cat["name_en"] if is_en else cat["name_zh"]
        cat_icon = cat["icon"]
        cat_tools = [t for t in TOOLS if t["category"] == cat_id]
        if not cat_tools:
            continue
        cards = ""
        for t in cat_tools:
            url = f"/en/tools/{t['slug']}" if is_en else f"/tools/{t['slug']}"
            name = t["name_en"] if is_en else t["name_zh"]
            short = t["short_en"] if is_en else t["short_zh"]
            cards += f"""    <a href="{url}" class="tool-card" data-name="{name.lower()}" data-desc="{short.lower()}">
      <div class="icon">{t['icon']}</div>
      <h3>{name}</h3>
      <p>{short}</p>
    </a>\n"""
        sections_html += f"""<section class="category">
  <h2>{cat_icon} {cat_name}</h2>
  <div class="tools-grid">
{cards}  </div>
</section>
"""

    body = f"""<section class="hero">
  <h1>{hero_h1}</h1>
  <p>{hero_p}</p>
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="{search_ph}" autocomplete="off">
  </div>
</section>
<div id="tools">
{sections_html}</div>
<script>
const input = document.getElementById('searchInput');
input.addEventListener('input', () => {{
  const q = input.value.toLowerCase().trim();
  document.querySelectorAll('.tool-card').forEach(card => {{
    const match = !q || card.dataset.name.includes(q) || card.dataset.desc.includes(q);
    card.style.display = match ? '' : 'none';
  }});
  document.querySelectorAll('.category').forEach(cat => {{
    const visible = [...cat.querySelectorAll('.tool-card')].some(c => c.style.display !== 'none');
    cat.style.display = visible ? '' : 'none';
  }});
}});
</script>"""
    return base_layout(
        lang=lang, title=title, description=desc, keywords=keywords,
        canonical=canonical, body=body
    )


def about_page(lang):
    is_en = lang == "en"
    canonical = f"{SITE_URL}/en/about" if is_en else f"{SITE_URL}/about"
    if is_en:
        title = "About - AI Toolbox"
        desc = "About AI Toolbox - a collection of free, privacy-first online tools that run entirely in your browser."
        body = """<article class="article">
  <h1>About AI Toolbox</h1>
  <p><strong>AI Toolbox</strong> is a growing collection of free, fast, privacy-first online tools.</p>
  <h2>🔒 Privacy First</h2>
  <p>All tools run <strong>entirely in your browser</strong>. We don't upload your data to any server. No tracking, no signup, no nonsense.</p>
  <h2>⚡ Fast & Lightweight</h2>
  <p>The site is built as static HTML — no frameworks, no bloat. Pages load in under 200ms.</p>
  <h2>🌍 Open Source</h2>
  <p>The whole project is open source on <a href="https://github.com/talang-tech/ai-toolbox">GitHub</a>. Contributions welcome!</p>
  <h2>📬 Contact</h2>
  <p>Have feedback or a tool request? Open an issue on GitHub.</p>
</article>"""
    else:
        title = "关于 - AI 工具盒子"
        desc = "关于 AI 工具盒子 - 一个免费、隐私优先、完全在浏览器中运行的在线工具集合。"
        body = """<article class="article">
  <h1>关于 AI 工具盒子</h1>
  <p><strong>AI 工具盒子</strong> 是一个持续成长的免费在线工具集，专注极速、隐私和实用。</p>
  <h2>🔒 隐私优先</h2>
  <p>所有工具都在<strong>你的浏览器本地</strong>运行。我们不会上传你的数据到任何服务器。无追踪、无注册、无废话。</p>
  <h2>⚡ 极速轻量</h2>
  <p>整站采用纯静态 HTML 构建 —— 无框架、无臃肿，页面加载速度低于 200ms。</p>
  <h2>🌍 开源</h2>
  <p>整个项目在 <a href="https://github.com/talang-tech/ai-toolbox">GitHub</a> 上开源。欢迎贡献代码！</p>
  <h2>📬 联系</h2>
  <p>有反馈或工具建议？欢迎在 GitHub 上提 Issue。</p>
</article>"""
    return base_layout(
        lang=lang, title=title, description=desc,
        keywords="about, ai toolbox" if is_en else "关于,AI 工具盒子",
        canonical=canonical, body=body
    )


def conversion_cta(lang):
    """统一转化 CTA：承接私有化、定制工具和合作需求。"""
    is_en = lang == "en"
    if is_en:
        return """<section class="article" style="margin-top:32px;border:1px solid var(--border);background:var(--card);border-radius:12px;padding:20px">
  <h2>Need a private toolbox or custom browser tool?</h2>
  <p>AI Toolbox can be adapted for internal workflows, private deployment, sponsored categories, or custom privacy-first utilities.</p>
  <p><a href="/en/sponsor" data-event="conversion_cta_click" data-label="en_partner_custom_tool_cta">View partnership and custom tool options →</a></p>
</section>"""
    return """<section class="article" style="margin-top:32px;border:1px solid var(--border);background:var(--card);border-radius:12px;padding:20px">
  <h2>需要内部工具箱、私有化部署或定制工具？</h2>
  <p>AI 工具盒子可以面向团队工作流扩展，支持私有化部署、工具分类赞助和隐私优先的浏览器本地处理工具定制。</p>
  <p><a href="/sponsor" data-event="conversion_cta_click" data-label="zh_partner_custom_tool_cta">查看合作与定制方式 →</a></p>
</section>"""


def privacy_notice(slug, lang):
    """Sensitive-tool privacy note. Keep it concise and visible near the tool UI."""
    sensitive = {
        "json-formatter", "jwt-decoder", "hash-generator", "password-generator",
        "pdf-merge", "pdf-split", "pdf-to-image", "pdf-extract-text", "image-to-pdf",
        "image-compress", "image-convert", "image-resize", "image-watermark", "image-base64",
        "url-encoder", "text-dedup", "text-sort", "text-replace", "text-diff", "remove-lines",
        "yaml-formatter", "xml-formatter", "markdown-to-html", "csv-viewer"
    }
    if slug not in sensitive:
        return ""
    is_en = lang == "en"
    if is_en:
        return """<section class="article" style="margin-top:20px;border:1px solid var(--border);background:var(--bg-light);border-radius:12px;padding:16px">
  <h2 style="margin-top:0">Privacy note</h2>
  <p>This tool runs in your browser. Your input, files, JSON, JWT, images, PDFs, passwords, hashes, or text are not uploaded to an AI Toolbox server.</p>
  <p>Basic analytics may record page views and conversion clicks, but user input and file content are not tracked.</p>
</section>"""
    return """<section class="article" style="margin-top:20px;border:1px solid var(--border);background:var(--bg-light);border-radius:12px;padding:16px">
  <h2 style="margin-top:0">隐私说明</h2>
  <p>这个工具在你的浏览器中运行。你输入的内容、文件、JSON、JWT、图片、PDF、密码、哈希或文本不会上传到 AI 工具盒子的服务器。</p>
  <p>站点可能记录基础访问量和转化点击事件，但不会追踪用户输入内容或文件内容。</p>
</section>"""


def sponsor_page(lang):
    """赞助、合作与定制需求入口"""
    is_en = lang == "en"
    canonical = f"{SITE_URL}/en/sponsor" if is_en else f"{SITE_URL}/sponsor"
    if is_en:
        title = "Sponsor & Partnerships - AI Toolbox"
        desc = "Sponsor AI Toolbox, request a tool, or discuss custom privacy-first browser tools for your team."
        body = """<article class="article">
  <h1>Sponsor & Partnerships</h1>
  <p><strong>AI Toolbox</strong> is a free, privacy-first collection of browser-based developer and office tools. Most tools run locally in the browser, so user data is not uploaded to a server.</p>

  <h2>Who this is for</h2>
  <ul>
    <li>Developer tool, SaaS, API, cloud, security, productivity, and AI workflow products.</li>
    <li>Teams that need private, lightweight internal tools.</li>
    <li>Users who want to request a new tool or improve an existing one.</li>
  </ul>

  <h2>Partnership options</h2>
  <ul>
    <li><strong>Sponsored tool category:</strong> non-intrusive placement on relevant tool or category pages.</li>
    <li><strong>Tool request:</strong> propose a new utility that fits the privacy-first toolbox.</li>
    <li><strong>Custom tools:</strong> browser-based tools for internal workflows, data conversion, PDF/image processing, or developer productivity.</li>
    <li><strong>Private deployment:</strong> adapt AI Toolbox for internal documentation portals or intranet use.</li>
  </ul>

  <h2>Principles</h2>
  <ul>
    <li>Core tools stay free and usable.</li>
    <li>No misleading rankings or fake recommendations.</li>
    <li>No intrusive popups that break the tool experience.</li>
    <li>Sponsored content should be clearly marked.</li>
  </ul>

  <h2>Contact</h2>
  <p>Choose the most relevant GitHub issue template so we can understand the request faster:</p>
  <ul>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=sponsorship_partnership.yml" data-event="issue_template_click" data-label="sponsorship_partnership">Sponsorship / partnership request →</a></li>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=custom_tool_private_deploy.yml" data-event="issue_template_click" data-label="custom_tool_private_deploy">Custom tool / private deployment request →</a></li>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml" data-event="issue_template_click" data-label="tool_request">Suggest a new public tool →</a></li>
  </ul>
</article>"""
    else:
        title = "赞助合作与定制工具 - AI 工具盒子"
        desc = "赞助 AI 工具盒子、提交工具需求，或咨询隐私优先的浏览器本地处理工具定制与私有化部署。"
        body = """<article class="article">
  <h1>赞助合作与定制工具</h1>
  <p><strong>AI 工具盒子</strong> 是一个免费、隐私优先、浏览器本地处理的在线开发者与办公工具箱。大部分工具直接在用户浏览器中运行，文本、JSON、图片、PDF 等数据不会上传到服务器。</p>

  <h2>适合谁合作</h2>
  <ul>
    <li>开发者工具、SaaS、API、云服务、安全、效率工具、AI 工作流产品。</li>
    <li>需要轻量内部工具、数据转换工具、PDF/图片处理工具的团队。</li>
    <li>希望提交新工具需求或改进现有工具的用户。</li>
  </ul>

  <h2>合作方式</h2>
  <ul>
    <li><strong>工具分类赞助：</strong> 在相关工具页或分类页展示非侵入式赞助说明。</li>
    <li><strong>提交工具需求：</strong> 提议新增适合工具箱定位的实用工具。</li>
    <li><strong>定制工具开发：</strong> 为团队工作流定制浏览器本地处理工具，例如数据转换、格式化、PDF/图片处理、开发者效率工具。</li>
    <li><strong>私有化部署：</strong> 将 AI 工具盒子改造成企业内部门户、文档站或内网工具箱。</li>
  </ul>

  <h2>合作原则</h2>
  <ul>
    <li>核心工具保持免费可用。</li>
    <li>不做误导性排名，不伪装真实推荐。</li>
    <li>不使用影响工具体验的侵入式弹窗。</li>
    <li>赞助内容需要清晰标注。</li>
  </ul>

  <h2>联系与提交</h2>
  <p>请选择最匹配的 GitHub Issue 模板，方便我们更快理解需求：</p>
  <ul>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=sponsorship_partnership.yml" data-event="issue_template_click" data-label="sponsorship_partnership">提交赞助 / 合作需求 →</a></li>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=custom_tool_private_deploy.yml" data-event="issue_template_click" data-label="custom_tool_private_deploy">提交定制工具 / 私有化部署需求 →</a></li>
    <li><a href="https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml" data-event="issue_template_click" data-label="tool_request">建议新增公开工具 →</a></li>
  </ul>
</article>"""
    return base_layout(
        lang=lang, title=title, description=desc,
        keywords="sponsor, partnership, custom tools, AI Toolbox" if is_en else "赞助合作,工具定制,在线工具,AI 工具盒子,私有化部署",
        canonical=canonical, body=body
    )


def tool_page(tool, lang):
    is_en = lang == "en"
    # PDF tool library flags
    slug = tool["slug"]
    pdf_lib = slug in ["pdf-merge", "pdf-split"]
    pdf_js = slug in ["pdf-to-image", "pdf-extract-text"]
    jspdf = slug == "image-to-pdf"
    
    # Generate script tags based on tool type
    pdf_lib_script = '<script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>' if pdf_lib else ''
    pdf_js_script = '<script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"></script>' if pdf_js else ''
    jspdf_script = '<script src="https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>' if jspdf else '' 
    canonical = f"{SITE_URL}/en/tools/{slug}" if is_en else f"{SITE_URL}/tools/{slug}"
    name = tool["name_en"] if is_en else tool["name_zh"]
    short = tool["short_en"] if is_en else tool["short_zh"]
    long_desc = tool["long_en"] if is_en else tool["long_zh"]
    keywords = tool["keywords_en"] if is_en else tool["keywords_zh"]
    seo_title_extra = tool.get("seo_title_en", "") if is_en else tool.get("seo_title_zh", "")
    
    # SEO 优化：Title 包含更多长尾关键词
    if is_en:
        title = f"{name} - {seo_title_extra} | {SITE_NAME_EN}" if seo_title_extra else f"{name} - Free Online Tool | {SITE_NAME_EN}"
        seo_description = f"Free online {name.lower()}. {short.strip('.')}. Fast, secure, and works in your browser without downloading."
        features_title = "Key Features"
        faq_title = "Frequently Asked Questions"
    else:
        title = f"{name} - {seo_title_extra} | {SITE_NAME_ZH}" if seo_title_extra else f"{name} - 免费在线工具 | {SITE_NAME_ZH}"
        seo_description = f"免费在线{name}工具，{short.rstrip('。')}。快速、安全、无需下载，浏览器中直接使用。"
        features_title = "主要功能"
        faq_title = "常见问题"

    # 工具 UI
    ui = tool["ui_en"] if is_en else tool["ui_zh"]
    related = []
    for tid in tool.get("related", []):
        rt = next((x for x in TOOLS if x["slug"] == tid), None)
        if rt:
            url = f"/en/tools/{rt['slug']}" if is_en else f"/tools/{rt['slug']}"
            rname = rt["name_en"] if is_en else rt["name_zh"]
            related.append(f'<a href="{url}" class="tool-card"><div class="icon">{rt["icon"]}</div><h3>{rname}</h3><p>{rt["short_en"] if is_en else rt["short_zh"]}</p></a>')
    related_html = ""
    if related:
        title_rel = "Related Tools" if is_en else "相关工具"
        related_html = f'<section class="related"><h3>{title_rel}</h3><div class="tools-grid">{"".join(related)}</div></section>'

    # 增强的 JSON-LD 结构化数据 - 帮助搜索引擎理解这是工具页
    schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "description": seo_description,
        "url": canonical,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "featureList": short,
        "inLanguage": "en" if is_en else "zh-CN",
        "author": {"@type": "Organization", "name": SITE_NAME_EN if is_en else SITE_NAME_ZH},
    }
    extra_head = f'<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'

    # SEO 优化：添加 Features 和 FAQ 部分，增加 H2/H3 关键词覆盖
    features = tool.get("features_en", []) if is_en else tool.get("features_zh", [])
    features_html = ""
    if features:
        features_html = f'<section class="article" style="margin-top:32px"><h2>{features_title}</h2><ul>'
        for f in features:
            features_html += f"<li>{f}</li>"
        features_html += "</ul></section>"
    
    faq = tool.get("faq_en", []) if is_en else tool.get("faq_zh", [])
    faq_html = ""
    if faq:
        faq_html = f'<section class="article" style="margin-top:32px"><h2>{faq_title}</h2>'
        for item in faq:
            q, a = item[0], item[1]
            faq_html += f'<h3 style="margin-top:20px;margin-bottom:8px">{q}</h3><p>{a}</p>'
        faq_html += "</section>"

    body = f"""<div class="tool-header">
  <div class="icon">{tool['icon']}</div>
  <h1>{name}</h1>
  <p>{short}</p>
</div>
<div class="tool-panel">
{ui}
</div>{privacy_notice(slug, lang)}
<article class="article" style="margin-top:32px">
  <h2>{'About this tool' if is_en else '关于这个工具'}</h2>
  {long_desc}
</article>
{features_html}
{faq_html}
{related_html}
{conversion_cta(lang)}
<script src="/assets/tools/_utils.js" defer></script>
{pdf_lib_script}
{pdf_js_script}
{jspdf_script}
<script src="/assets/tools/{slug}.js" defer></script>"""

    return base_layout(
        lang=lang, title=title, description=seo_description, keywords=keywords,
        canonical=canonical, body=body, extra_head=extra_head
    )


def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print(f"  ✓ {path}")


# ===================== BLOG =====================
import re

def md_to_html(md):
    """极简 Markdown 转 HTML (覆盖博客所需子集)"""
    lines = md.split("\n")
    out = []
    in_code = False
    in_list = False
    in_ol = False
    code_lang = ""
    i = 0
    while i < len(lines):
        line = lines[i]
        # Code fence
        if line.startswith("```"):
            if in_code:
                out.append("</code></pre>")
                in_code = False
            else:
                code_lang = line[3:].strip()
                out.append(f'<pre><code class="lang-{code_lang}">')
                in_code = True
            i += 1
            continue
        if in_code:
            out.append(line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
            i += 1
            continue
        # Table: detect header row | a | b | followed by separator |---|---|
        if "|" in line and line.strip().startswith("|") and i + 1 < len(lines) \
                and re.match(r'^\s*\|?[\s\-:|]+\|[\s\-:|]+\s*$', lines[i+1]):
            if in_list: out.append("</ul>"); in_list = False
            if in_ol: out.append("</ol>"); in_ol = False
            header_cells = [c.strip() for c in line.strip().strip("|").split("|")]
            out.append('<table><thead><tr>')
            for h in header_cells:
                out.append(f"<th>{inline_md(h)}</th>")
            out.append('</tr></thead><tbody>')
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                out.append('<tr>')
                for c in row:
                    out.append(f"<td>{inline_md(c)}</td>")
                out.append('</tr>')
                i += 1
            out.append('</tbody></table>')
            continue
        # Headings
        m = re.match(r'^(#{1,4})\s+(.+)$', line)
        if m:
            if in_list: out.append("</ul>"); in_list = False
            if in_ol: out.append("</ol>"); in_ol = False
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_md(m.group(2))}</h{level}>")
            i += 1
            continue
        # UL
        m = re.match(r'^[\-\*]\s+(.*)$', line)
        if m:
            if in_ol: out.append("</ol>"); in_ol = False
            if not in_list: out.append("<ul>"); in_list = True
            out.append(f"<li>{inline_md(m.group(1))}</li>")
            i += 1
            continue
        # OL
        m = re.match(r'^\d+\.\s+(.*)$', line)
        if m:
            if in_list: out.append("</ul>"); in_list = False
            if not in_ol: out.append("<ol>"); in_ol = True
            out.append(f"<li>{inline_md(m.group(1))}</li>")
            i += 1
            continue
        # Blank line
        if not line.strip():
            if in_list: out.append("</ul>"); in_list = False
            if in_ol: out.append("</ol>"); in_ol = False
            i += 1
            continue
        # HR
        if re.match(r'^---+$', line):
            if in_list: out.append("</ul>"); in_list = False
            if in_ol: out.append("</ol>"); in_ol = False
            out.append("<hr>")
            i += 1
            continue
        # Blockquote
        if line.startswith("> "):
            if in_list: out.append("</ul>"); in_list = False
            if in_ol: out.append("</ol>"); in_ol = False
            out.append(f"<blockquote>{inline_md(line[2:])}</blockquote>")
            i += 1
            continue
        # Paragraph
        if in_list: out.append("</ul>"); in_list = False
        if in_ol: out.append("</ol>"); in_ol = False
        out.append(f"<p>{inline_md(line)}</p>")
        i += 1
    if in_list: out.append("</ul>")
    if in_ol: out.append("</ol>")
    if in_code: out.append("</code></pre>")
    return "\n".join(out)


def inline_md(s):
    """Inline markdown: bold, italic, code, link"""
    # Code first (so ** inside `code` not parsed)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    # Links [text](url)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
    # Bold **text**
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    # Italic *text*
    s = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', s)
    return s


def parse_post(path):
    """Parse a blog post markdown file with YAML-ish frontmatter."""
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        raise ValueError(f"Post {path} missing frontmatter")
    parts = raw.split("---", 2)
    fm = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"').strip("'")
    body = parts[2].strip()
    return fm, body


def load_posts():
    """Load all posts from blog/posts/{lang}/*.md grouped by lang."""
    posts = {"zh": [], "en": []}
    base = ROOT / "blog" / "posts"
    if not base.exists():
        return posts
    for lang in ["zh", "en"]:
        d = base / lang
        if not d.exists(): continue
        for f in sorted(d.glob("*.md")):
            try:
                fm, body = parse_post(f)
                fm["slug"] = f.stem
                fm["body_html"] = md_to_html(body)
                fm["lang"] = lang
                fm["source_path"] = f
                posts[lang].append(fm)
            except Exception as e:
                print(f"  ✗ failed to parse {f}: {e}")
    # Sort newest first
    for lang in posts:
        posts[lang].sort(key=lambda p: p.get("date", ""), reverse=True)
    return posts


def blog_index_page(lang, posts):
    is_en = lang == "en"
    canonical = f"{SITE_URL}/en/blog/" if is_en else f"{SITE_URL}/blog/"
    title = "Blog - AI Toolbox" if is_en else "博客 - AI 工具盒子"
    desc = (
        "In-depth guides on developer tools, AI, encoding, regex, password security and more."
        if is_en else
        "关于开发者工具、AI、编码、正则、密码安全等的深度指南与教程。"
    )
    keywords = (
        "developer blog, json tutorial, regex guide, password security, base64 explained, uuid v7"
        if is_en else
        "开发者博客,JSON 教程,正则表达式指南,密码安全,Base64 原理,UUID v7"
    )
    h1 = "Blog" if is_en else "博客"
    intro = (
        "In-depth tutorials and guides — written by humans, for builders."
        if is_en else
        "深度教程与实战指南 —— 为开发者和爱折腾的人写的。"
    )
    if not posts:
        cards = f'<p>{"No posts yet." if is_en else "暂无文章。"}</p>'
    else:
        cards = ""
        for p in posts:
            url = f"/en/blog/{p['slug']}" if is_en else f"/blog/{p['slug']}"
            cards += f"""    <a href="{url}" class="tool-card" style="display:block">
      <h3>{p.get('title','(no title)')}</h3>
      <p style="color:var(--muted);font-size:13px;margin:6px 0">{p.get('date','')} · {p.get('readtime','5 min')}</p>
      <p>{p.get('description','')}</p>
    </a>
"""
    body = f"""<section class="hero">
  <h1>{h1}</h1>
  <p>{intro}</p>
</section>
<div class="tools-grid" style="grid-template-columns:1fr">
{cards}</div>"""
    return base_layout(
        lang=lang, title=title, description=desc, keywords=keywords,
        canonical=canonical, body=body
    )


def blog_post_page(post):
    is_en = post["lang"] == "en"
    slug = post["slug"]
    canonical = f"{SITE_URL}/en/blog/{slug}" if is_en else f"{SITE_URL}/blog/{slug}"
    title = f"{post.get('title','(no title)')} | {SITE_NAME_EN if is_en else SITE_NAME_ZH}"
    desc = post.get("description", "")
    keywords = post.get("keywords", "")
    # JSON-LD article
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.get("title", ""),
        "description": desc,
        "author": {"@type": "Organization", "name": SITE_NAME_EN if is_en else SITE_NAME_ZH},
        "datePublished": post.get("date", ""),
        "url": canonical,
    }
    extra_head = f'<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'
    back_label = "← Back to blog" if is_en else "← 返回博客"
    back_url = "/en/blog/" if is_en else "/blog/"
    body = f"""<article class="article">
  <p style="margin-bottom:8px"><a href="{back_url}" style="color:var(--muted)">{back_label}</a></p>
  <h1>{post.get('title','')}</h1>
  <p style="color:var(--muted);margin-bottom:24px">{post.get('date','')} · {post.get('readtime','5 min read' if is_en else '5 分钟阅读')}</p>
  {post.get('body_html','')}
  {conversion_cta(post["lang"])}
</article>"""
    return base_layout(
        lang=post["lang"], title=title, description=desc, keywords=keywords,
        canonical=canonical, body=body, extra_head=extra_head
    )


def generate_sitemap(posts=None):
    """生成 sitemap.xml"""
    urls = [
        (f"{SITE_URL}/", SITE_LASTMOD, "1.0"),
        (f"{SITE_URL}/en/", SITE_LASTMOD, "1.0"),
        (f"{SITE_URL}/about", SITE_LASTMOD, "0.5"),
        (f"{SITE_URL}/en/about", SITE_LASTMOD, "0.5"),
        (f"{SITE_URL}/sponsor", SITE_LASTMOD, "0.6"),
        (f"{SITE_URL}/en/sponsor", SITE_LASTMOD, "0.6"),
        (f"{SITE_URL}/blog/", SITE_LASTMOD, "0.7"),
        (f"{SITE_URL}/en/blog/", SITE_LASTMOD, "0.7"),
    ]
    for t in TOOLS:
        lastmod = tool_last_modified(t)
        urls.append((f"{SITE_URL}/tools/{t['slug']}", lastmod, "0.8"))
        urls.append((f"{SITE_URL}/en/tools/{t['slug']}", lastmod, "0.8"))
    for p in posts["zh"]:
        urls.append((f"{SITE_URL}/blog/{p['slug']}", post_last_modified(p), "0.7"))
    for p in posts["en"]:
        urls.append((f"{SITE_URL}/en/blog/{p['slug']}", post_last_modified(p), "0.7"))

    body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url, lastmod, prio in urls:
        body += f"  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod><priority>{prio}</priority></url>\n"
    body += "</urlset>\n"
    write("sitemap.xml", body)


def generate_robots():
    robots = f"""# robots.txt for AI Toolbox
# {SITE_URL}

User-agent: *
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: {SITE_URL}/sitemap.xml

# Block AI crawlers from training (but allow search indexing)
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /
"""
    write("robots.txt", robots)


def main():
    print("🚀 Building AI Toolbox...")
    # Home pages
    write("index.html", home_page("zh"))
    write("en/index.html", home_page("en"))
    # About pages
    write("about.html", about_page("zh"))
    write("en/about.html", about_page("en"))
    # Sponsor / partnership pages
    write("sponsor.html", sponsor_page("zh"))
    write("en/sponsor.html", sponsor_page("en"))
    # Tool pages
    for t in TOOLS:
        write(f"tools/{t['slug']}.html", tool_page(t, "zh"))
        write(f"en/tools/{t['slug']}.html", tool_page(t, "en"))
    # Blog
    posts = load_posts()
    write("blog/index.html", blog_index_page("zh", posts["zh"]))
    write("en/blog/index.html", blog_index_page("en", posts["en"]))
    for p in posts["zh"]:
        write(f"blog/{p['slug']}.html", blog_post_page(p))
    for p in posts["en"]:
        write(f"en/blog/{p['slug']}.html", blog_post_page(p))
    # SEO files
    generate_sitemap(posts)
    generate_robots()
    n_posts = len(posts["zh"]) + len(posts["en"])
    n_html = 2 + 2 + 2 + len(TOOLS) * 2 + 2 + n_posts
    print(f"\n✅ Generated {n_html} HTML pages + sitemap + robots.")
    print(f"   {len(TOOLS)} tools × 2 languages + {n_posts} blog posts")


if __name__ == "__main__":
    main()
