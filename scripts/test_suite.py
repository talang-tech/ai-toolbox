#!/usr/bin/env python3
"""
AI Toolbox 单元测试
"""

import unittest
import os
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

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

class TestToolsConfig(unittest.TestCase):
    """测试工具配置文件"""
    
    def setUp(self):
        """加载工具配置"""
        self.config_path = ROOT / "tools.json"
        with open(self.config_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
    
    def test_json_format(self):
        """测试 JSON 格式正确性"""
        self.assertIsInstance(self.data, dict, "tools.json 不是有效的 JSON 对象")
    
    def test_required_sections(self):
        """测试必要的配置部分"""
        required_sections = ["categories", "tools"]
        for section in required_sections:
            self.assertIn(section, self.data, f"缺少必要部分: {section}")
    
    def test_tools_count(self):
        """测试工具数量"""
        tools = self.data["tools"]
        self.assertGreater(len(tools), 0, "没有工具配置")
        print(f"工具总数: {len(tools)}")

class TestProjectStructure(unittest.TestCase):
    """测试项目结构"""
    
    def test_essential_directories(self):
        """测试必要的目录"""
        required_dirs = [
            "assets",
            "assets/css",
            "assets/tools",
            "tools",
            "en",
            "en/tools",
            "blog",
            "en/blog"
        ]
        
        for dir_path in required_dirs:
            self.assertTrue((ROOT / dir_path).exists(), f"目录不存在: {dir_path}")
    
    def test_essential_files(self):
        """测试必要的文件"""
        required_files = [
            "tools.json",
            "build.py",
            "README.md",
            "LICENSE",
            "docs/MAINTENANCE_GUIDE.md",
            "docs/TOOL_DEVELOPMENT_GUIDE.md"
        ]
        
        for file_path in required_files:
            self.assertTrue((ROOT / file_path).exists(), f"文件不存在: {file_path}")

class TestGeneratedContent(unittest.TestCase):
    """测试生成的内容"""
    
    def setUp(self):
        """确保构建已经运行"""
        if not (ROOT / "index.html").exists():
            subprocess.run([sys.executable, "build.py"], cwd=ROOT, capture_output=True)
    
    def test_homepage_generated(self):
        """测试首页已生成"""
        self.assertTrue((ROOT / "index.html").exists(), "index.html 未生成")
        self.assertTrue((ROOT / "en" / "index.html").exists(), "en/index.html 未生成")
    
    def test_sitemap_generated(self):
        """测试站点地图已生成"""
        sitemap_path = ROOT / "sitemap.xml"
        self.assertTrue(sitemap_path.exists(), "sitemap.xml 未生成")
        
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        self.assertIn("<?xml", content, "站点地图缺少 XML 声明")
        self.assertIn("<urlset", content, "站点地图缺少 urlset 标签")

def run_all_tests():
    """运行所有测试"""
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # 添加所有测试类
    test_classes = [
        TestBuildScript,
        TestToolsConfig,
        TestProjectStructure,
        TestGeneratedContent
    ]
    
    for test_class in test_classes:
        tests = loader.loadTestsFromTestCase(test_class)
        suite.addTest(tests)
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()

if __name__ == "__main__":
    print("🚀 运行 AI Toolbox 测试套件")
    print("=" * 50)
    
    success = run_all_tests()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ 所有测试通过!")
        sys.exit(0)
    else:
        print("\n" + "=" * 50)
        print("❌ 测试失败!")
        sys.exit(1)
