#!/usr/bin/env python3
"""
AI Toolbox 代码检查脚本
检查代码质量、格式和最佳实践
"""

import os
import json
import re
from pathlib import Path
import sys

ROOT = Path(__file__).parent.parent

class CodeLinter:
    """代码检查器"""
    
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.successes = []
    
    def add_issue(self, category, file_path, message, line=None):
        """添加问题"""
        self.issues.append({
            'category': category,
            'file': str(file_path),
            'message': message,
            'line': line
        })
    
    def add_warning(self, category, file_path, message, line=None):
        """添加警告"""
        self.warnings.append({
            'category': category,
            'file': str(file_path),
            'message': message,
            'line': line
        })
    
    def add_success(self, category, file_path, message):
        """添加成功检查项"""
        self.successes.append({
            'category': category,
            'file': str(file_path),
            'message': message
        })
    
    def check_tools_json(self):
        """检查 tools.json 文件"""
        file_path = ROOT / "tools.json"
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 检查基本结构
            if 'tools' not in data:
                self.add_issue('structure', file_path, "缺少 'tools' 部分")
            else:
                self.add_success('structure', file_path, f"包含 {len(data['tools'])} 个工具")
            
            if 'categories' not in data:
                self.add_issue('structure', file_path, "缺少 'categories' 部分")
            else:
                self.add_success('structure', file_path, "包含分类配置")
            
            # 检查每个工具
            if 'tools' in data:
                for i, tool in enumerate(data['tools']):
                    # 检查必要字段
                    required_fields = ['slug', 'name_zh', 'name_en', 'category']
                    for field in required_fields:
                        if field not in tool:
                            self.add_issue('tool_config', file_path, 
                                         f"工具 {i+1} 缺少字段: {field}", i+1)
                    
                    # 检查 slug 格式
                    if 'slug' in tool:
                        slug = tool['slug']
                        if not re.match(r'^[a-z0-9\-]+$', slug):
                            self.add_warning('tool_config', file_path,
                                           f"工具 slug 格式不佳: {slug}", i+1)
                    
                    # 检查 UI 字段
                    if 'ui_zh' not in tool or not tool['ui_zh'].strip():
                        self.add_warning('tool_config', file_path,
                                        f"工具 {tool.get('slug', f'#{i+1}')} 缺少中文 UI", i+1)
                    
        except json.JSONDecodeError as e:
            self.add_issue('syntax', file_path, f"JSON 语法错误: {e}")
        except Exception as e:
            self.add_issue('general', file_path, f"读取文件失败: {e}")
    
    def check_js_files(self):
        """检查 JavaScript 文件"""
        js_dir = ROOT / "assets" / "tools"
        
        if not js_dir.exists():
            self.add_issue('structure', js_dir, "JS 目录不存在")
            return
        
        # 检查 _utils.js
        utils_path = js_dir / "_utils.js"
        if utils_path.exists():
            self.add_success('js', utils_path, "工具函数库存在")
        else:
            self.add_issue('js', utils_path, "缺少工具函数库 _utils.js")
        
        # 加载 tools.json 获取所有工具
        try:
            with open(ROOT / "tools.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            tools = data.get('tools', [])
            tool_slugs = {tool['slug'] for tool in tools if 'slug' in tool}
            
            # 检查每个工具是否有对应的 JS 文件
            for slug in tool_slugs:
                js_path = js_dir / f"{slug}.js"
                if js_path.exists():
                    # 检查文件大小
                    size = js_path.stat().st_size
                    if size == 0:
                        self.add_warning('js', js_path, "JS 文件为空")
                    else:
                        self.add_success('js', js_path, f"JS 文件正常 ({size} bytes)")
                    
                    # 检查文件内容
                    self._check_js_content(js_path, slug)
                else:
                    self.add_issue('js', js_path, f"工具 {slug} 缺少 JS 文件")
            
        except Exception as e:
            self.add_issue('general', ROOT / "tools.json", f"无法检查 JS 文件: {e}")
    
    def _check_js_content(self, file_path, slug):
        """检查 JS 文件内容"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查是否使用严格模式
            if "'use strict'" not in content and '"use strict"' not in content:
                self.add_warning('js_style', file_path, "未使用严格模式")
            
            # 检查是否有基本结构
            if not re.search(r'function\s+\w+', content):
                self.add_warning('js_style', file_path, "可能缺少函数定义")
            
            # 检查事件监听
            if 'addEventListener' not in content:
                self.add_warning('js_style', file_path, "可能缺少事件监听")
            
            # 检查错误处理
            if 'try' not in content and 'catch' not in content:
                self.add_warning('js_style', file_path, "可能缺少错误处理")
                
        except Exception as e:
            self.add_issue('general', file_path, f"读取 JS 文件失败: {e}")
    
    def check_html_files(self):
        """检查 HTML 文件"""
        # 检查首页
        index_path = ROOT / "index.html"
        if index_path.exists():
            self._check_html_file(index_path, "首页")
        else:
            self.add_issue('html', index_path, "首页不存在")
        
        # 检查工具目录
        tools_dir = ROOT / "tools"
        if tools_dir.exists():
            html_files = list(tools_dir.glob("*.html"))
            if html_files:
                self.add_success('html', tools_dir, f"包含 {len(html_files)} 个工具页面")
                
                # 抽样检查几个文件
                sample_files = html_files[:3]  # 检查前3个
                for html_file in sample_files:
                    self._check_html_file(html_file, "工具页面")
            else:
                self.add_issue('html', tools_dir, "没有工具 HTML 文件")
    
    def _check_html_file(self, file_path, file_type):
        """检查单个 HTML 文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            checks = [
                ('<!DOCTYPE html>', 'DOCTYPE 声明'),
                ('<html', 'html 标签'),
                ('<head>', 'head 部分'),
                ('<body>', 'body 部分'),
                ('<title>', '标题标签'),
                ('<meta name="description"', '描述标签'),
                ('<meta name="viewport"', '视口标签'),
                ('</html>', '闭合 html 标签')
            ]
            
            missing = []
            for pattern, description in checks:
                if pattern not in content:
                    missing.append(description)
            
            if missing:
                self.add_warning('html', file_path, 
                               f"{file_type} 缺少: {', '.join(missing)}")
            else:
                self.add_success('html', file_path, f"{file_type} 结构完整")
                
        except Exception as e:
            self.add_issue('general', file_path, f"读取 HTML 文件失败: {e}")
    
    def check_build_script(self):
        """检查构建脚本"""
        build_path = ROOT / "build.py"
        
        if not build_path.exists():
            self.add_issue('build', build_path, "构建脚本不存在")
            return
        
        try:
            with open(build_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查基本结构
            checks = [
                ('#!/usr/bin/env python3', 'shebang 行'),
                ('import json', 'json 模块'),
                ('def ', '函数定义'),
                ('if __name__ == "__main__"', '主程序入口')
            ]
            
            for pattern, description in checks:
                if pattern in content:
                    self.add_success('build', build_path, f"包含 {description}")
                else:
                    self.add_warning('build', build_path, f"缺少 {description}")
                    
        except Exception as e:
            self.add_issue('general', build_path, f"读取构建脚本失败: {e}")
    
    def run_all_checks(self):
        """运行所有检查"""
        print("🔍 运行代码检查...")
        print("=" * 60)
        
        self.check_tools_json()
        self.check_js_files()
        self.check_html_files()
        self.check_build_script()
        
        # 输出结果
        print(f"\n📊 检查结果摘要:")
        print(f"   成功: {len(self.successes)}")
        print(f"   警告: {len(self.warnings)}")
        print(f"   问题: {len(self.issues)}")
        
        # 输出问题
        if self.issues:
            print(f"\n❌ 发现的问题:")
            for issue in self.issues:
                line_info = f" 第 {issue['line']} 行" if issue['line'] else ""
                print(f"  [{issue['category']}] {issue['file']}{line_info}:")
                print(f"      {issue['message']}")
        
        # 输出警告
        if self.warnings:
            print(f"\n⚠️  警告:")
            for warning in self.warnings:
                line_info = f" 第 {warning['line']} 行" if warning['line'] else ""
                print(f"  [{warning['category']}] {warning['file']}{line_info}:")
                print(f"      {warning['message']}")
        
        # 输出成功项
        if self.successes and len(self.issues) == 0:
            print(f"\n✅ 成功检查项 (前10个):")
            for success in self.successes[:10]:
                print(f"  [{success['category']}] {success['file']}:")
                print(f"      {success['message']}")
        
        print("\n" + "=" * 60)
        
        # 返回状态
        if self.issues:
            print("❌ 代码检查失败，请修复上述问题")
            return False
        elif self.warnings:
            print("⚠️  代码检查通过，但有警告需要关注")
            return True
        else:
            print("✅ 代码检查通过，所有检查项正常")
            return True

def main():
    """主函数"""
    linter = CodeLinter()
    success = linter.run_all_checks()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()