#!/usr/bin/env python3
"""
AI Toolbox - 静态站点生成器
读取 tools.json 配置，生成所有中英文页面 + sitemap。
零依赖，纯 Python 标准库。
"""
import json
import os
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent
SITE_URL = "https://tools.talang.fun"
SITE_NAME_ZH = "AI 工具盒子"
SITE_NAME_EN = "AI Toolbox"

# 加载工具配置
with open(ROOT / "tools.json", encoding="utf-8") as f:
    DATA = json.load(f)

TOOLS = DATA["tools"]
CATEGORIES = DATA["categories"]


def base_layout(*, lang, title, description, keywords, canonical, body, extra_head=""):
    """统一页面布局 (HTML5 + SEO)"""
    is_en = lang == "en"
    site_name = SITE_NAME_EN if is_en else SITE_NAME_ZH
    nav_home = "Home" if is_en else "首页"
    nav_tools = "All Tools" if is_en else "所有工具"
    nav_about = "About" if is_en else "关于"
    lang_label = "中文" if is_en else "EN"
    lang_href = canonical.replace(f"{SITE_URL}/en", SITE_URL) if is_en else canonical.replace(SITE_URL, f"{SITE_URL}/en")
    if is_en and "/en/" not in canonical and not canonical.endswith("/en"):
        lang_href = canonical
    home_href = "/en/" if is_en else "/"
    tools_href = "/en/#tools" if is_en else "/#tools"
    about_href = "/en/about.html" if is_en else "/about.html"
    footer_text = (
        f"© {datetime.now().year} {site_name} · Free online AI & developer tools · "
        f"<a href='{about_href}'>About</a> · "
        f"<a href='https://github.com/talang-tech/ai-toolbox'>GitHub</a>"
        if is_en else
        f"© {datetime.now().year} {site_name} · 免费在线 AI 与开发者工具 · "
        f"<a href='{about_href}'>关于</a> · "
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
{extra_head}
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="{home_href}" class="logo"><span class="logo-icon">🛠️</span>{site_name}</a>
    <nav class="nav">
      <a href="{home_href}">{nav_home}</a>
      <a href="{tools_href}">{nav_tools}</a>
      <a href="{about_href}">{nav_about}</a>
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
            url = f"/en/tools/{t['slug']}.html" if is_en else f"/tools/{t['slug']}.html"
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
    canonical = f"{SITE_URL}/en/about.html" if is_en else f"{SITE_URL}/about.html"
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


def tool_page(tool, lang):
    is_en = lang == "en"
    slug = tool["slug"]
    canonical = f"{SITE_URL}/en/tools/{slug}.html" if is_en else f"{SITE_URL}/tools/{slug}.html"
    name = tool["name_en"] if is_en else tool["name_zh"]
    short = tool["short_en"] if is_en else tool["short_zh"]
    long_desc = tool["long_en"] if is_en else tool["long_zh"]
    # SEO 标题模板
    title = f"{name} - Free Online Tool | {SITE_NAME_EN}" if is_en else f"{name} - 免费在线工具 | {SITE_NAME_ZH}"
    keywords = tool["keywords_en"] if is_en else tool["keywords_zh"]

    # 工具 UI
    ui = tool["ui_en"] if is_en else tool["ui_zh"]
    related = []
    for tid in tool.get("related", []):
        rt = next((x for x in TOOLS if x["slug"] == tid), None)
        if rt:
            url = f"/en/tools/{rt['slug']}.html" if is_en else f"/tools/{rt['slug']}.html"
            rname = rt["name_en"] if is_en else rt["name_zh"]
            related.append(f'<a href="{url}" class="tool-card"><div class="icon">{rt["icon"]}</div><h3>{rname}</h3><p>{rt["short_en"] if is_en else rt["short_zh"]}</p></a>')
    related_html = ""
    if related:
        title_rel = "Related Tools" if is_en else "相关工具"
        related_html = f'<section class="related"><h3>{title_rel}</h3><div class="tools-grid">{"".join(related)}</div></section>'

    # JSON-LD 结构化数据
    schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "description": short,
        "url": canonical,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
    }
    extra_head = f'<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'

    body = f"""<div class="tool-header">
  <div class="icon">{tool['icon']}</div>
  <h1>{name}</h1>
  <p>{short}</p>
</div>
<div class="tool-panel">
{ui}
</div>
<article class="article" style="margin-top:32px">
  <h2>{'About this tool' if is_en else '关于这个工具'}</h2>
  {long_desc}
</article>
{related_html}
<script src="/assets/js/{slug}.js" defer></script>"""

    return base_layout(
        lang=lang, title=title, description=short, keywords=keywords,
        canonical=canonical, body=body, extra_head=extra_head
    )


def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print(f"  ✓ {path}")


def generate_sitemap():
    """生成 sitemap.xml"""
    today = datetime.now().strftime("%Y-%m-%d")
    urls = [
        (f"{SITE_URL}/", "1.0"),
        (f"{SITE_URL}/en/", "1.0"),
        (f"{SITE_URL}/about.html", "0.5"),
        (f"{SITE_URL}/en/about.html", "0.5"),
    ]
    for t in TOOLS:
        urls.append((f"{SITE_URL}/tools/{t['slug']}.html", "0.8"))
        urls.append((f"{SITE_URL}/en/tools/{t['slug']}.html", "0.8"))

    body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url, prio in urls:
        body += f"  <url><loc>{url}</loc><lastmod>{today}</lastmod><priority>{prio}</priority></url>\n"
    body += "</urlset>\n"
    write("sitemap.xml", body)


def generate_robots():
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n")


def main():
    print("🚀 Building AI Toolbox...")
    # Home pages
    write("index.html", home_page("zh"))
    write("en/index.html", home_page("en"))
    # About pages
    write("about.html", about_page("zh"))
    write("en/about.html", about_page("en"))
    # Tool pages
    for t in TOOLS:
        write(f"tools/{t['slug']}.html", tool_page(t, "zh"))
        write(f"en/tools/{t['slug']}.html", tool_page(t, "en"))
    # SEO files
    generate_sitemap()
    generate_robots()
    print(f"\n✅ Generated {2 + 2 + len(TOOLS) * 2} HTML pages + sitemap + robots.")
    print(f"   {len(TOOLS)} tools × 2 languages")


if __name__ == "__main__":
    main()
