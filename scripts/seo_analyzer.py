#!/usr/bin/env python3
"""
AI Toolbox SEO 和性能监控脚本
检查 SEO 优化状态和性能指标
"""

import os
import json
import re
import subprocess
import sys
from pathlib import Path
from datetime import datetime
import urllib.request
import urllib.parse

ROOT = Path(__file__).parent.parent

class SEOAnalyzer:
    """SEO 分析器"""
    
    def __init__(self):
        self.results = {
            'seo': {'checks': [], 'score': 0, 'total': 0},
            'performance': {'checks': [], 'score': 0, 'total': 0},
            'accessibility': {'checks': [], 'score': 0, 'total': 0},
            'best_practices': {'checks': [], 'score': 0, 'total': 0}
        }
    
    def add_check(self, category, name, status, message, weight=1):
        """添加检查结果"""
        check = {
            'name': name,
            'status': status,  # 'pass', 'fail', 'warning'
            'message': message,
            'weight': weight
        }
        self.results[category]['checks'].append(check)
        self.results[category]['total'] += weight
        if status == 'pass':
            self.results[category]['score'] += weight
    
    def check_seo_tags(self):
        """检查 SEO 标签"""
        print("🔍 检查 SEO 标签...")
        
        # 检查首页
        index_path = ROOT / "index.html"
        if index_path.exists():
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            checks = [
                ('标题标签', r'<title>.*?</title>', 'pass', '有标题标签'),
                ('描述标签', r'<meta name="description"', 'pass', '有描述标签'),
                ('关键词标签', r'<meta name="keywords"', 'warning', '关键词标签可选'),
                ('视口标签', r'<meta name="viewport"', 'pass', '有响应式视口标签'),
                ('规范链接', r'<link rel="canonical"', 'pass', '有规范链接'),
                ('Open Graph', r'<meta property="og:', 'pass', '有 Open Graph 标签'),
                ('Twitter Card', r'<meta name="twitter:card"', 'pass', '有 Twitter Card 标签'),
                ('hreflang', r'<link rel="alternate" hreflang=', 'pass', '有多语言链接'),
                ('JSON-LD', r'<script type="application/ld\+json">', 'pass', '有结构化数据')
            ]
            
            for name, pattern, default_status, message in checks:
                if re.search(pattern, content):
                    self.add_check('seo', name, 'pass', message)
                else:
                    self.add_check('seo', name, default_status, f'缺少{name}')
        
        # 检查工具页面示例
        tools_dir = ROOT / "tools"
        if tools_dir.exists():
            html_files = list(tools_dir.glob("*.html"))
            if html_files:
                sample_file = html_files[0]
                with open(sample_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if '<title>' in content and '</title>' in content:
                    self.add_check('seo', '工具页面标题', 'pass', '工具页面有标题')
                else:
                    self.add_check('seo', '工具页面标题', 'fail', '工具页面缺少标题')
    
    def check_sitemap(self):
        """检查站点地图"""
        print("🗺️  检查站点地图...")
        
        sitemap_path = ROOT / "sitemap.xml"
        if sitemap_path.exists():
            with open(sitemap_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查基本结构
            if '<?xml' in content and '<urlset' in content:
                self.add_check('seo', '站点地图格式', 'pass', '站点地图格式正确')
                
                # 统计 URL 数量
                url_count = content.count('<url>')
                self.add_check('seo', '站点地图URL数量', 'pass' if url_count > 0 else 'fail',
                             f'站点地图包含 {url_count} 个URL')
                
                # 检查最后修改时间
                if '<lastmod>' in content:
                    self.add_check('seo', '最后修改时间', 'pass', '有最后修改时间')
                else:
                    self.add_check('seo', '最后修改时间', 'warning', '缺少最后修改时间')
            else:
                self.add_check('seo', '站点地图格式', 'fail', '站点地图格式错误')
        else:
            self.add_check('seo', '站点地图存在', 'fail', '缺少站点地图')
    
    def check_robots_txt(self):
        """检查 robots.txt"""
        print("🤖 检查 robots.txt...")
        
        robots_path = ROOT / "robots.txt"
        if robots_path.exists():
            with open(robots_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'User-agent:' in content:
                self.add_check('seo', 'robots.txt', 'pass', 'robots.txt 存在且有效')
            else:
                self.add_check('seo', 'robots.txt', 'warning', 'robots.txt 格式可能不正确')
        else:
            self.add_check('seo', 'robots.txt', 'fail', '缺少 robots.txt')
    
    def check_performance_basics(self):
        """检查基本性能指标"""
        print("⚡ 检查性能指标...")
        
        # 检查文件大小
        css_path = ROOT / "assets" / "css" / "style.css"
        if css_path.exists():
            css_size = css_path.stat().st_size
            status = 'pass' if css_size < 100000 else 'warning'  # 小于 100KB
            self.add_check('performance', 'CSS文件大小', status,
                         f'CSS文件大小: {css_size/1024:.1f}KB')
        
        # 检查 JS 文件大小
        js_dir = ROOT / "assets" / "tools"
        if js_dir.exists():
            js_files = list(js_dir.glob("*.js"))
            if js_files:
                total_size = sum(f.stat().st_size for f in js_files)
                avg_size = total_size / len(js_files)
                status = 'pass' if avg_size < 10000 else 'warning'  # 平均小于 10KB
                self.add_check('performance', 'JS文件大小', status,
                             f'平均JS文件大小: {avg_size/1024:.1f}KB ({len(js_files)}个文件)')
        
        # 检查图片优化
        assets_dir = ROOT / "assets"
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
        image_files = []
        for root, dirs, files in os.walk(assets_dir):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_files.append(Path(root) / file)
        
        if image_files:
            self.add_check('performance', '图片文件', 'pass',
                         f'发现 {len(image_files)} 个图片文件')
        else:
            self.add_check('performance', '图片文件', 'pass', '没有发现图片文件（静态工具）')
    
    def check_accessibility(self):
        """检查可访问性"""
        print("♿ 检查可访问性...")
        
        # 检查首页基本可访问性
        index_path = ROOT / "index.html"
        if index_path.exists():
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查语义化标签
            semantic_tags = ['<header', '<nav', '<main', '<footer', '<article', '<section']
            found_tags = [tag for tag in semantic_tags if tag in content]
            
            if len(found_tags) >= 3:
                self.add_check('accessibility', '语义化HTML', 'pass',
                             f'使用语义化标签: {", ".join([t.replace("<", "") for t in found_tags])}')
            else:
                self.add_check('accessibility', '语义化HTML', 'warning',
                             '语义化标签使用不足')
            
            # 检查图片 alt 属性
            if '<img' in content and 'alt=' in content:
                self.add_check('accessibility', '图片alt属性', 'pass', '图片有alt属性')
            else:
                self.add_check('accessibility', '图片alt属性', 'warning', '可能缺少图片alt属性')
    
    def check_best_practices(self):
        """检查最佳实践"""
        print("📋 检查最佳实践...")
        
        # 检查安全头部
        headers_path = ROOT / "_headers"
        if headers_path.exists():
            with open(headers_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            security_headers = [
                'Content-Security-Policy',
                'X-Frame-Options',
                'X-Content-Type-Options',
                'Referrer-Policy',
                'Permissions-Policy'
            ]
            
            found_headers = [h for h in security_headers if h in content]
            if found_headers:
                self.add_check('best_practices', '安全头部', 'pass',
                             f'配置了安全头部: {", ".join(found_headers)}')
            else:
                self.add_check('best_practices', '安全头部', 'warning',
                             '建议配置更多安全头部')
        else:
            self.add_check('best_practices', '安全头部', 'warning', '缺少 _headers 文件')
        
        # 检查 HTTPS 重定向
        if os.path.exists(headers_path):
            with open(headers_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'https://' in content or 'Strict-Transport-Security' in content:
                self.add_check('best_practices', 'HTTPS', 'pass', '配置了HTTPS相关设置')
            else:
                self.add_check('best_practices', 'HTTPS', 'warning', '建议配置HTTPS重定向')
    
    def calculate_scores(self):
        """计算分数"""
        for category in self.results:
            checks = self.results[category]['checks']
            if checks:
                score = self.results[category]['score']
                total = self.results[category]['total']
                self.results[category]['percentage'] = int((score / total) * 100) if total > 0 else 0
    
    def generate_report(self):
        """生成报告"""
        print("\n" + "=" * 60)
        print("📊 SEO 和性能分析报告")
        print("=" * 60)
        
        for category, data in self.results.items():
            if data['checks']:
                print(f"\n{self._get_category_emoji(category)} {category.upper()}: {data['percentage']}%")
                print("-" * 40)
                
                for check in data['checks']:
                    status_emoji = self._get_status_emoji(check['status'])
                    print(f"  {status_emoji} {check['name']}: {check['message']}")
        
        print("\n" + "=" * 60)
        print("📈 总体评分:")
        
        total_score = 0
        total_weight = 0
        
        for category, data in self.results.items():
            if data['checks']:
                percentage = data['percentage']
                print(f"  {self._get_category_emoji(category)} {category.title()}: {percentage}%")
                total_score += data['score']
                total_weight += data['total']
        
        if total_weight > 0:
            overall = int((total_score / total_weight) * 100)
            print(f"\n  🎯 总体评分: {overall}%")
            
            if overall >= 90:
                print("  ✅ 优秀! 继续保持")
            elif overall >= 70:
                print("  ⚠️  良好，但有改进空间")
            else:
                print("  ❌ 需要重点关注和改进")
        
        print("\n" + "=" * 60)
        
        # 生成改进建议
        print("💡 改进建议:")
        improvements = []
        
        for category, data in self.results.items():
            for check in data['checks']:
                if check['status'] == 'fail':
                    improvements.append(f"• 修复: {check['name']} - {check['message']}")
                elif check['status'] == 'warning':
                    improvements.append(f"• 优化: {check['name']} - {check['message']}")
        
        if improvements:
            for imp in improvements[:10]:  # 只显示前10个
                print(f"  {imp}")
            if len(improvements) > 10:
                print(f"  还有 {len(improvements) - 10} 个改进建议...")
        else:
            print("  没有发现需要立即改进的问题")
        
        print("\n" + "=" * 60)
    
    def _get_category_emoji(self, category):
        """获取分类表情"""
        emojis = {
            'seo': '🔍',
            'performance': '⚡',
            'accessibility': '♿',
            'best_practices': '📋'
        }
        return emojis.get(category, '📌')
    
    def _get_status_emoji(self, status):
        """获取状态表情"""
        emojis = {
            'pass': '✅',
            'fail': '❌',
            'warning': '⚠️'
        }
        return emojis.get(status, '❓')
    
    def run_all_checks(self):
        """运行所有检查"""
        print("🚀 开始 SEO 和性能分析")
        print("=" * 60)
        
        self.check_seo_tags()
        self.check_sitemap()
        self.check_robots_txt()
        self.check_performance_basics()
        self.check_accessibility()
        self.check_best_practices()
        
        self.calculate_scores()
        self.generate_report()
        
        # 返回总体评分
        total_score = sum(data['score'] for data in self.results.values())
        total_weight = sum(data['total'] for data in self.results.values())
        
        if total_weight > 0:
            return int((total_score / total_weight) * 100)
        return 0

def main():
    """主函数"""
    analyzer = SEOAnalyzer()
    score = analyzer.run_all_checks()
    
    # 保存报告到文件
    report_path = ROOT / "seo_performance_report.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        # 重定向输出到文件
        import io
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        
        analyzer.generate_report()
        
        output = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        f.write(output)
        f.write(f"\n报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"总体评分: {score}%\n")
    
    print(f"\n📄 详细报告已保存到: {report_path}")
    
    if score >= 80:
        print("✅ SEO 和性能状态良好")
        return 0
    else:
        print("⚠️  SEO 和性能需要改进")
        return 1

if __name__ == "__main__":
    sys.exit(main())