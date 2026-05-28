#!/usr/bin/env python3
"""
AI Toolbox 自动化测试框架
运行所有测试：python3 run_tests.py
运行特定测试：python3 run_tests.py --test test_build
"""

import unittest
import os
import json
import subprocess
import sys
import argparse
from pathlib import Path

# 项目根目录
ROOT = Path(__file__).parent

class TestBuildScript(unittest.TestCase):
    """测试构建脚本功能"""
    
    def test_build_script_exists(self):
        """测试构建脚本是否存在"""
        self.assertTrue((ROOT / "build.py").exists(), "build.py 不存在")
    
    def test_build_script_runs(self):
        """测试构建脚本可以正常运行"""
        result = subprocess.run(
            [sys.executable, "build.py"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=30
        )
        self.assertEqual(result.returncode, 0, f"构建脚本失败: {result.stderr}")
        self.assertIn("✅ Generated", result.stdout, "构建输出不正确")
    
    def test_build_output(self):
        """测试构建输出文件"""
        # 运行构建
        subprocess.run([sys.executable, "build.py"], cwd=ROOT, capture_output=True)
        
        # 检查关键文件
        required_files = [
            "index.html",
            "en/index.html",
            "about.html",
            "en/about.html",
            "sitemap.xml",
            "robots.txt"
        ]
        
        for file in required_files:
            self.assertTrue((ROOT / file).exists(), f"文件 {file} 未生成")
        
        # 检查至少有一个工具页面
        tools_dir = ROOT / "tools"
        if tools_dir.exists():
            html_files = list(tools_dir.glob("*.html"))
            self.assertGreater(len(html_files), 0, "没有生成工具页面")

class TestToolsConfig(unittest.TestCase):
    """测试工具配置文件"""
    
    def setUp(self):
        """加载工具配置"""
        self.config_path = ROOT / "tools.json"
        with open(self.config_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
    
    def test_json_format(self):
        """测试 JSON 格式正确性"""
        # 如果能够加载，说明 JSON 格式基本正确
        self.assertIsInstance(self.data, dict, "tools.json 不是有效的 JSON 对象")
    
    def test_required_sections(self):
        """测试必要的配置部分"""
        required_sections = ["categories", "tools"]
        for section in required_sections:
            self.assertIn(section, self.data, f"缺少必要部分: {section}")
    
    def test_categories_structure(self):
        """测试分类结构"""
        categories = self.data["categories"]
        self.assertIn("order", categories, "categories 缺少 order 字段")
        self.assertIn("items", categories, "categories 缺少 items 字段")
        
        # 检查每个分类都有必要字段
        for cat_id, cat_info in categories["items"].items():
            required_fields = ["icon", "name_zh", "name_en"]
            for field in required_fields:
                self.assertIn(field, cat_info, f"分类 {cat_id} 缺少字段: {field}")
    
    def test_tools_structure(self):
        """测试工具结构"""
        tools = self.data["tools"]
        self.assertGreater(len(tools), 0, "没有工具配置")
        
        # 检查每个工具的必要字段
        required_fields = ["slug", "name_zh", "name_en", "category"]
        for tool in tools:
            for field in required_fields:
                self.assertIn(field, tool, f"工具 {tool.get('slug', '未知')} 缺少字段: {field}")
            
            # 检查 slug 唯一性
            slug = tool["slug"]
            all_slugs = [t["slug"] for t in tools]
            self.assertEqual(all_slugs.count(slug), 1, f"slug 重复: {slug}")
    
    def test_js_files_exist(self):
        """测试每个工具都有对应的 JS 文件"""
        tools = self.data["tools"]
        for tool in tools:
            slug = tool["slug"]
            js_path = ROOT / "assets" / "tools" / f"{slug}.js"
            self.assertTrue(js_path.exists(), f"工具 {slug} 缺少 JS 文件: {js_path}")

class TestGeneratedHTML(unittest.TestCase):
    """测试生成的 HTML 文件"""
    
    def setUp(self):
        """确保构建已经运行"""
        if not (ROOT / "index.html").exists():
            subprocess.run([sys.executable, "build.py"], cwd=ROOT, capture_output=True)
    
    def test_html_basic_structure(self):
        """测试 HTML 基本结构"""
        test_files = ["index.html", "about.html"]
        
        for file in test_files:
            file_path = ROOT / file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查基本 HTML 结构
            self.assertIn("<!DOCTYPE html>", content, f"{file} 缺少 DOCTYPE")
            self.assertIn("<html", content, f"{file} 缺少 html 标签")
            self.assertIn("<head>", content, f"{file} 缺少 head 标签")
            self.assertIn("<body>", content, f"{file} 缺少 body 标签")
            self.assertIn("</html>", content, f"{file} 缺少闭合 html 标签")
    
    def test_seo_tags(self):
        """测试 SEO 标签"""
        with open(ROOT / "index.html", 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_tags = [
            "<title>",
            '<meta name="description"',
            '<meta name="viewport"',
            '<link rel="canonical"'
        ]
        
        for tag in required_tags:
            self.assertIn(tag, content, f"首页缺少 SEO 标签: {tag}")

class TestSitemap(unittest.TestCase):
    """测试站点地图"""
    
    def test_sitemap_exists(self):
        """测试站点地图文件存在"""
        sitemap_path = ROOT / "sitemap.xml"
        self.assertTrue(sitemap_path.exists(), "sitemap.xml 不存在")
    
    def test_sitemap_format(self):
        """测试站点地图格式"""
        sitemap_path = ROOT / "sitemap.xml"
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查 XML 声明
        self.assertIn("<?xml", content, "站点地图缺少 XML 声明")
        self.assertIn("<urlset", content, "站点地图缺少 urlset 标签")
        
        # 统计 URL 数量
        url_count = content.count("<url>")
        self.assertGreater(url_count, 0, "站点地图没有 URL")

class TestPerformance(unittest.TestCase):
    """测试性能"""
    
    def test_build_performance(self):
        """测试构建性能"""
        import time
        
        times = []
        for _ in range(3):
            start = time.time()
            result = subprocess.run(
                [sys.executable, "build.py"],
                cwd=ROOT,
                capture_output=True,
                text=True
            )
            end = time.time()
            
            self.assertEqual(result.returncode, 0, "构建失败")
            times.append(end - start)
        
        avg_time = sum(times) / len(times)
        # 构建应该在 5 秒内完成
        self.assertLess(avg_time, 5.0, f"构建时间过长: {avg_time:.2f} 秒")

def run_tests(test_pattern=None):
    """运行测试"""
    # 切换到项目目录
    os.chdir(ROOT)
    
    # 配置测试运行器
    loader = unittest.TestLoader()
    
    if test_pattern:
        # 运行特定测试
        suite = loader.loadTestsFromName(test_pattern)
    else:
        # 运行所有测试
        suite = loader.discover(str(ROOT), pattern="test_*.py")
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="运行 AI Toolbox 测试")
    parser.add_argument("--test", help="运行特定测试 (例如: TestBuildScript)")
    parser.add_argument("--list", action="store_true", help="列出所有测试")
    
    args = parser.parse_args()
    
    if args.list:
        # 列出所有测试用例
        print("可用的测试用例:")
        test_classes = [
            "TestBuildScript",
            "TestToolsConfig", 
            "TestGeneratedHTML",
            "TestSitemap",
            "TestPerformance"
        ]
        for test_class in test_classes:
            print(f"  {test_class}")
        return
    
    # 运行测试
    success = run_tests(args.test)
    
    if success:
        print("\n✅ 所有测试通过!")
        sys.exit(0)
    else:
        print("\n❌ 测试失败!")
        sys.exit(1)

if __name__ == "__main__":
    main()