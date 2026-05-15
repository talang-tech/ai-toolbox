#!/usr/bin/env python3
"""
工具站开发前置检查脚本
在开发新工具或编写新文章前运行此脚本，避免重复开发
"""

import json
import os
import sys

def load_tools():
    """加载所有工具配置"""
    with open('tools.json') as f:
        return json.load(f)['tools']

def get_existing_slugs():
    """获取所有已存在的工具 slug"""
    tools = load_tools()
    return set(t['slug'] for t in tools)

def get_existing_names():
    """获取所有已存在的工具名称"""
    tools = load_tools()
    names_zh = set(t['name_zh'] for t in tools)
    names_en = set(t['name_en'] for t in tools)
    return names_zh, names_en

def get_existing_keywords():
    """获取所有工具的关键词（用于检查是否主题重复）"""
    tools = load_tools()
    keywords_zh = set()
    keywords_en = set()
    for t in tools:
        for kw in t.get('keywords_zh', '').split(','):
            if kw.strip():
                keywords_zh.add(kw.strip())
        for kw in t.get('keywords_en', '').split(','):
            if kw.strip():
                keywords_en.add(kw.strip())
    return keywords_zh, keywords_en

def get_existing_articles():
    """获取所有已存在的博客文章"""
    articles = {'zh': [], 'en': []}
    for lang in ['zh', 'en']:
        dir_path = f'blog/posts/{lang}'
        if os.path.exists(dir_path):
            for f in os.listdir(dir_path):
                if f.endswith('.md'):
                    articles[lang].append(f)
    return articles

def check_new_tool(slug, name_zh='', name_en=''):
    """检查新工具是否已存在"""
    print("="*80)
    print("🔍 新工具前置检查")
    print("="*80)
    
    slugs = get_existing_slugs()
    names_zh, names_en = get_existing_names()
    kw_zh, kw_en = get_existing_keywords()
    
    print(f"\n当前工具总数: {len(slugs)}")
    print(f"当前工具 slug 列表:")
    for i, s in enumerate(sorted(slugs), 1):
        print(f"  {i:2d}. {s}")
    
    print("\n" + "-"*80)
    print(f"检查: {slug} / {name_zh} / {name_en}")
    print("-"*80)
    
    has_error = False
    
    # 检查 slug
    if slug in slugs:
        print(f"❌ SLUG 已存在: {slug}")
        has_error = True
    else:
        print(f"✅ SLUG 可用: {slug}")
    
    # 检查中文名称
    if name_zh and name_zh in names_zh:
        print(f"❌ 中文名称已存在: {name_zh}")
        has_error = True
    elif name_zh:
        print(f"✅ 中文名称可用: {name_zh}")
    
    # 检查英文名称
    if name_en and name_en in names_en:
        print(f"❌ 英文名称已存在: {name_en}")
        has_error = True
    elif name_en:
        print(f"✅ 英文名称可用: {name_en}")
    
    if has_error:
        print("\n" + "="*80)
        print("❌ 存在重复，建议换个名称或调整方向！")
        print("="*80)
        return False
    else:
        print("\n" + "="*80)
        print("✅ 检查通过！可以开始开发！")
        print("="*80)
        return True

def check_new_article(title, lang='zh'):
    """检查新文章是否已存在"""
    print("="*80)
    print("🔍 新文章前置检查")
    print("="*80)
    
    articles = get_existing_articles()
    
    print(f"\n当前中文文章: {len(articles['zh'])} 篇")
    print(f"当前英文文章: {len(articles['en'])} 篇")
    
    print(f"\n文章列表 ({lang}):")
    for i, a in enumerate(sorted(articles[lang]), 1):
        print(f"  {i:2d}. {a}")
    
    # 简单的标题匹配检查
    title_simple = title.lower().replace(' ', '')
    for a in articles[lang]:
        a_simple = a.lower().replace(' ', '').replace('.md', '')
        if title_simple in a_simple or a_simple in title_simple:
            print(f"\n⚠️ 可能重复: {a}")
            print(f"   新标题: {title}")
            return False
    
    print("\n" + "="*80)
    print("✅ 检查通过！可以开始写作！")
    print("="*80)
    return True

def show_all_tools():
    """显示所有工具概览"""
    tools = load_tools()
    print("="*80)
    print("📋 所有工具概览 (共 {} 个)".format(len(tools)))
    print("="*80)
    
    categories = {}
    for t in tools:
        cat = t.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(t)
    
    for cat, items in sorted(categories.items()):
        print(f"\n【{cat}】({len(items)} 个):")
        for t in items:
            print(f"  - {t['slug']:25s} {t['name_zh']} / {t['name_en']}")
    
    print("\n" + "="*80)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='工具站开发前置检查')
    parser.add_argument('action', choices=['tools', 'articles', 'check-tool', 'check-article'], 
                        help='显示所有工具 / 显示所有文章 / 检查新工具 / 检查新文章')
    parser.add_argument('--slug', help='工具 slug')
    parser.add_argument('--name-zh', help='中文名称')
    parser.add_argument('--name-en', help='英文名称')
    parser.add_argument('--title', help='文章标题')
    parser.add_argument('--lang', default='zh', help='语言')
    
    args = parser.parse_args()
    
    os.chdir('/opt/data/claude_code/ai-toolbox')
    
    if args.action == 'tools':
        show_all_tools()
    elif args.action == 'articles':
        articles = get_existing_articles()
        print("中文文章:")
        for a in sorted(articles['zh']):
            print(f"  - {a}")
        print("\n英文文章:")
        for a in sorted(articles['en']):
            print(f"  - {a}")
    elif args.action == 'check-tool':
        check_new_tool(args.slug, args.name_zh, args.name_en)
    elif args.action == 'check-article':
        check_new_article(args.title, args.lang)

if __name__ == '__main__':
    main()
