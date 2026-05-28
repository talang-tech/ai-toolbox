# AI Toolbox 维护工具套件

这个目录包含为 AI Toolbox 项目开发的维护工具和文档，用于确保项目质量、性能和可维护性。

## 📁 目录结构

```
docs/                          # 项目文档
├── MAINTENANCE_GUIDE.md       # 完整维护指南
├── TOOL_DEVELOPMENT_GUIDE.md  # 新工具开发规范
└── MAINTENANCE_COMPLETE_REPORT.md # 维护完成报告

scripts/                       # 维护脚本
├── test_suite.py              # 单元测试框架
├── code_linter.py             # 代码检查工具
├── seo_analyzer.py            # SEO和性能分析
├── test_functionality.py      # 功能测试脚本
└── run_tests.py               # 测试运行器

tools/maintenance/             # 维护工具输出
└── seo_performance_report.txt # SEO分析报告
```

## 🛠️ 工具使用说明

### 1. 运行测试套件
```bash
# 运行所有测试
cd /root/ai-toolbox
python3 scripts/test_suite.py

# 运行特定测试类
python3 scripts/run_tests.py --test TestBuildScript
```

### 2. 代码检查
```bash
# 运行代码检查
python3 scripts/code_linter.py

# 检查结果说明：
# - ✅ 通过: 符合规范
# - ⚠️  警告: 建议改进
# - ❌ 失败: 需要修复
```

### 3. SEO和性能分析
```bash
# 运行SEO和性能分析
python3 scripts/seo_analyzer.py

# 报告将保存到:
# tools/maintenance/seo_performance_report.txt
```

### 4. 功能测试
```bash
# 运行功能测试
python3 scripts/test_functionality.py
```

## 📋 维护流程

### 日常维护
```bash
# 1. 确保构建正常
python3 build.py

# 2. 运行基础测试
python3 scripts/test_suite.py

# 3. 检查代码质量
python3 scripts/code_linter.py
```

### 月度检查
```bash
# 1. 运行完整测试套件
python3 scripts/run_tests.py

# 2. 进行SEO分析
python3 scripts/seo_analyzer.py

# 3. 检查功能完整性
python3 scripts/test_functionality.py
```

### 新工具开发
1. 阅读 `docs/TOOL_DEVELOPMENT_GUIDE.md`
2. 按照规范添加新工具
3. 运行测试确保质量
4. 提交代码

## 🔧 工具开发说明

### 测试框架 (`test_suite.py`)
- 基于 Python unittest
- 测试构建脚本、配置、项目结构
- 可扩展添加新测试

### 代码检查器 (`code_linter.py`)
- 检查 tools.json 配置完整性
- 验证 JS 文件存在和基本质量
- 检查 HTML 结构完整性

### SEO分析器 (`seo_analyzer.py`)
- 检查 SEO 标签完整性
- 分析性能指标
- 评估可访问性
- 检查最佳实践

## 📊 质量指标

项目维护工具监控以下质量指标：

1. **构建性能**: 构建时间应 < 5秒
2. **代码质量**: 无错误，警告数可控
3. **SEO评分**: 目标 > 90%
4. **性能评分**: 目标 > 90%
5. **测试通过率**: 100%

## 🚨 故障排除

### 常见问题

#### 1. 测试失败
```bash
# 查看详细错误
python3 scripts/test_suite.py -v

# 检查构建脚本
python3 build.py
```

#### 2. 代码检查警告过多
- 检查 tools.json 配置
- 验证 JS 文件格式
- 确保 HTML 结构正确

#### 3. SEO评分下降
- 运行 SEO 分析查看具体问题
- 检查生成的 HTML 文件
- 验证 meta 标签

## 📈 报告生成

每次运行维护工具都会生成报告：

1. **测试报告**: 控制台输出
2. **代码检查报告**: 控制台输出
3. **SEO分析报告**: `tools/maintenance/seo_performance_report.txt`

## 🔄 更新和维护

### 更新测试
1. 在 `test_suite.py` 中添加新测试类
2. 继承 `unittest.TestCase`
3. 添加测试方法

### 更新检查规则
1. 修改 `code_linter.py` 中的检查逻辑
2. 添加新的检查类别
3. 更新权重和评分

### 更新SEO检查
1. 修改 `seo_analyzer.py` 中的检查项
2. 添加新的SEO指标
3. 更新评分算法

## 📞 支持

- **问题反馈**: GitHub Issues
- **功能建议**: GitHub Discussions
- **紧急支持**: 项目维护者

---

**维护工具版本**: 1.0  
**最后更新**: 2026-05-28  
**维护者**: Hermes Agent