# AI Toolbox 维护指南

## 项目概述

**AI Toolbox** 是一个免费、极速、隐私优先的在线工具集，包含 47 个工具，分为 7 个类别。项目采用纯静态 HTML 技术栈，无框架依赖，所有处理在浏览器本地完成。

- **网站**: https://tools.talang.fun
- **GitHub**: https://github.com/talang-tech/ai-toolbox
- **部署**: Cloudflare Pages
- **构建**: Python 构建脚本 (build.py)

## 技术架构

### 目录结构
```
ai-toolbox/
├── tools.json              # 工具配置（核心文件）
├── build.py                # 静态站生成器
├── index.html              # 首页（自动生成）
├── about.html              # 关于页面
├── tools/*.html            # 工具页面（自动生成）
├── en/                     # 英文版（自动生成）
├── assets/
│   ├── css/style.css       # 统一样式
│   ├── tools/*.js          # 每个工具的 JavaScript 逻辑
│   └── tools/_utils.js     # 共享工具函数
├── sitemap.xml             # 站点地图（自动生成）
└── robots.txt              # 爬虫规则（自动生成）
```

### 构建流程
1. 读取 `tools.json` 配置
2. 为每个工具生成中英文 HTML 页面
3. 生成站点地图和爬虫规则
4. 输出到根目录和 `en/` 目录

## 维护任务

### 1. 日常维护
- [ ] 定期运行 `python3 build.py` 确保页面最新
- [ ] 检查 Cloudflare Pages 部署状态
- [ ] 监控网站访问统计
- [ ] 检查工具功能是否正常

### 2. 代码质量
- [ ] 确保所有工具都有对应的 JS 文件 (`assets/tools/{slug}.js`)
- [ ] 检查 `tools.json` 配置完整性
- [ ] 验证生成的 HTML 页面 SEO 标签
- [ ] 测试工具在移动端的响应式布局

### 3. 性能优化
- [ ] 压缩 CSS 和 JavaScript 文件
- [ ] 优化图片资源加载
- [ ] 实现懒加载策略
- [ ] 监控页面加载速度

### 4. SEO 优化
- [ ] 定期更新 sitemap
- [ ] 检查 meta 标签完整性
- [ ] 验证 JSON-LD 结构化数据
- [ ] 监控搜索引擎收录情况

## 添加新工具流程

### 步骤 1: 更新工具配置
在 `tools.json` 的 `tools` 数组中添加新工具配置：

```json
{
  "slug": "new-tool",
  "category": "text",
  "icon": "✨",
  "name_zh": "新工具名称",
  "name_en": "New Tool Name",
  "short_zh": "简短描述",
  "short_en": "Short description",
  "keywords_zh": "关键词1,关键词2",
  "keywords_en": "keyword1,keyword2",
  "long_zh": "<p>详细描述...</p>",
  "long_en": "<p>Detailed description...</p>",
  "ui_zh": "<div>UI 元素...</div>",
  "ui_en": "<div>UI elements...</div>",
  "related": ["related-tool1", "related-tool2"],
  "seo_title_zh": "SEO 标题",
  "seo_title_en": "SEO Title",
  "features_zh": ["功能1", "功能2"],
  "features_en": ["Feature 1", "Feature 2"],
  "faq_zh": [["问题1", "答案1"], ["问题2", "答案2"]],
  "faq_en": [["Q1", "A1"], ["Q2", "A2"]]
}
```

### 步骤 2: 创建 JavaScript 逻辑
在 `assets/tools/new-tool.js` 中实现工具功能：

```javascript
// 工具逻辑代码
// 使用 _utils.js 中的共享函数
```

### 步骤 3: 构建和测试
```bash
# 重新生成所有页面
python3 build.py

# 启动本地服务器测试
python3 -m http.server 8000
# 访问 http://localhost:8000/tools/new-tool
```

### 步骤 4: 部署
```bash
# 提交更改
git add .
git commit -m "feat: 添加新工具 [new-tool]"
git push origin main
# Cloudflare Pages 会自动构建和部署
```

## 故障排除

### 常见问题

#### 1. 构建失败
- **症状**: `python3 build.py` 报错
- **原因**: `tools.json` 格式错误或缺少必要字段
- **解决**: 检查 JSON 语法，确保所有工具都有 `slug`, `name_zh`, `name_en`, `category` 字段

#### 2. 工具页面 JS 不工作
- **症状**: 工具界面无响应或报错
- **原因**: JS 文件路径错误或代码错误
- **解决**: 
  1. 检查浏览器控制台错误
  2. 确认 `assets/tools/{slug}.js` 文件存在
  3. 验证 JS 代码语法

#### 3. 部署后页面未更新
- **症状**: 代码已推送但网站未更新
- **原因**: Cloudflare Pages 构建失败或缓存
- **解决**:
  1. 检查 Cloudflare Pages 控制台构建日志
  2. 清除浏览器缓存
  3. 等待 Cloudflare CDN 缓存刷新

#### 4. SEO 问题
- **症状**: 搜索引擎不收录或排名下降
- **原因**: meta 标签缺失或错误
- **解决**:
  1. 运行构建脚本确保页面最新
  2. 检查生成的 HTML 中的 `<title>`, `<meta description>` 等标签
  3. 在 Google Search Console 提交 sitemap

### 调试工具

#### 本地开发服务器
```bash
# 启动开发服务器
python3 -m http.server 8000

# 在浏览器中打开
# http://localhost:8000
# http://localhost:8000/tools/{tool-name}
```

#### 构建调试
```bash
# 详细构建输出
python3 build.py --verbose

# 只构建特定工具
# (需要修改 build.py 添加此功能)
```

## 性能监控

### 关键指标
- **页面加载时间**: < 2 秒
- **首次内容绘制 (FCP)**: < 1.5 秒
- **最大内容绘制 (LCP)**: < 2.5 秒
- **累积布局偏移 (CLS)**: < 0.1

### 监控工具
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **Cloudflare Analytics**: 查看访问统计和性能数据
3. **Google Search Console**: 监控收录和搜索表现

## 安全最佳实践

### 代码安全
- [ ] 所有用户输入在客户端验证
- [ ] 避免使用 `eval()` 或 `innerHTML` 处理用户输入
- [ ] 使用 Content Security Policy (CSP) 头部
- [ ] 定期更新第三方库依赖

### 部署安全
- [ ] 启用 Cloudflare WAF 规则
- [ ] 配置 HTTPS 强制重定向
- [ ] 设置安全的响应头
- [ ] 定期备份项目代码

## 版本控制

### 分支策略
- **main**: 生产分支，自动部署到 Cloudflare Pages
- **develop**: 开发分支，新功能开发
- **feature/***: 功能分支，单个功能开发
- **hotfix/***: 热修复分支，紧急 bug 修复

### 提交规范
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加 amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 联系方式

- **项目维护者**: talang-tech
- **问题反馈**: GitHub Issues
- **功能建议**: GitHub Discussions

---

*最后更新: 2026-05-28*
*维护者: Hermes Agent*