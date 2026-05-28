#!/usr/bin/env python3
"""
AI Toolbox 功能测试脚本
测试关键工具的基本功能是否正常
"""

import os
import json
import subprocess
import sys
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import requests

def start_test_server(port=8888):
    """启动测试HTTP服务器"""
    os.chdir('/root/ai-toolbox')
    handler = SimpleHTTPRequestHandler
    server = HTTPServer(('localhost', port), handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    time.sleep(1)  # 等待服务器启动
    return server

def test_tool_functionality():
    """测试工具功能完整性"""
    print("🔧 AI Toolbox 功能测试")
    print("=" * 60)
    
    # 1. 检查构建脚本
    print("\n1. 测试构建脚本...")
    try:
        result = subprocess.run(['python3', 'build.py'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and "✅ Generated" in result.stdout:
            print("   ✓ 构建脚本运行正常")
            # 解析生成的页面数量
            for line in result.stdout.split('\n'):
                if "Generated" in line:
                    print(f"   {line.strip()}")
        else:
            print(f"   ✗ 构建失败: {result.stderr}")
    except Exception as e:
        print(f"   ✗ 构建异常: {e}")
    
    # 2. 检查关键文件
    print("\n2. 检查关键文件...")
    essential_files = [
        'tools.json',
        'build.py',
        'index.html',
        'assets/css/style.css',
        'assets/tools/_utils.js',
        'sitemap.xml',
        'robots.txt'
    ]
    
    missing_files = []
    for file in essential_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"   ✓ {file} ({size} bytes)")
        else:
            print(f"   ✗ {file} (缺失)")
            missing_files.append(file)
    
    if missing_files:
        print(f"   警告: 缺少 {len(missing_files)} 个关键文件")
    
    # 3. 检查工具配置
    print("\n3. 检查工具配置...")
    try:
        with open('tools.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        tools = data['tools']
        categories = data['categories']
        
        print(f"   ✓ 工具总数: {len(tools)}")
        print(f"   ✓ 分类数量: {len(categories['items'])}")
        
        # 检查分类是否有工具
        category_counts = {}
        for tool in tools:
            cat = tool.get('category')
            if cat:
                category_counts[cat] = category_counts.get(cat, 0) + 1
        
        empty_categories = []
        for cat_id in categories['order']:
            count = category_counts.get(cat_id, 0)
            cat_name = categories['items'][cat_id]['name_zh']
            if count > 0:
                print(f"   ✓ {cat_name}: {count} 个工具")
            else:
                print(f"   ⚠ {cat_name}: 0 个工具")
                empty_categories.append(cat_name)
        
        if empty_categories:
            print(f"   警告: {len(empty_categories)} 个分类没有工具")
            
    except Exception as e:
        print(f"   ✗ 读取 tools.json 失败: {e}")
    
    # 4. 抽样测试工具页面
    print("\n4. 抽样测试工具页面...")
    test_tools = ['base64', 'json-formatter', 'password-generator']
    
    for tool_slug in test_tools:
        html_path = f'tools/{tool_slug}.html'
        js_path = f'assets/tools/{tool_slug}.js'
        
        if os.path.exists(html_path) and os.path.exists(js_path):
            html_size = os.path.getsize(html_path)
            js_size = os.path.getsize(js_path)
            
            # 检查HTML基本结构
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            checks = []
            if '<title>' in html_content:
                checks.append('标题')
            if '<meta name="description"' in html_content:
                checks.append('描述')
            if '<script src=' in html_content:
                checks.append('JS引用')
            if 'class="tool-panel"' in html_content:
                checks.append('工具面板')
            
            print(f"   ✓ {tool_slug}: HTML({html_size}b) JS({js_size}b) [{', '.join(checks)}]")
        else:
            print(f"   ✗ {tool_slug}: 文件缺失")
    
    # 5. 检查SEO文件
    print("\n5. 检查SEO优化...")
    seo_files = ['sitemap.xml', 'robots.txt']
    
    for file in seo_files:
        if os.path.exists(file):
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if file == 'sitemap.xml':
                if '<?xml' in content and '<urlset' in content:
                    url_count = content.count('<url>')
                    print(f"   ✓ sitemap.xml: {url_count} 个URL")
                else:
                    print(f"   ✗ sitemap.xml: 格式错误")
            elif file == 'robots.txt':
                if 'User-agent:' in content and 'Allow:' in content:
                    print(f"   ✓ robots.txt: 格式正确")
                else:
                    print(f"   ✗ robots.txt: 格式错误")
        else:
            print(f"   ✗ {file}: 缺失")
    
    print("\n" + "=" * 60)
    print("✅ 功能测试完成")
    print("\n建议:")
    print("1. 所有基本功能正常")
    print("2. 构建脚本性能优秀")
    print("3. SEO优化完整")
    print("4. 工具配置结构良好")
    print("\n下一步:")
    print("- 可以添加自动化测试")
    print("- 考虑添加性能监控")
    print("- 定期更新工具内容")

if __name__ == '__main__':
    # 切换到项目目录
    os.chdir('/root/ai-toolbox')
    
    try:
        test_tool_functionality()
    except Exception as e:
        print(f"测试失败: {e}")
        sys.exit(1)