# AI Toolbox 新工具开发规范

## 概述
本文档定义了在 AI Toolbox 项目中添加新工具的完整流程和规范，确保代码质量、一致性和可维护性。

## 开发流程

### 阶段 1: 规划和设计 (1-2小时)

#### 1.1 需求分析
- [ ] 确定工具要解决的问题
- [ ] 调研现有类似工具
- [ ] 定义核心功能点
- [ ] 确定目标用户群体

#### 1.2 功能设计
-i [ ] 设计用户界面布局
- [ ] 定义输入/输出格式
- [ ] 规划交互流程
- [ ] 考虑边缘情况和错误处理

#### 1.3 SEO 规划
- [ ] 确定主要关键词
- [ ] 编写中英文标题和描述
- [ ] 规划结构化数据
- [ ] 设计常见问题 (FAQ)

### 阶段 2: 开发实现 (2-4小时)

#### 2.1 创建工具配置
在 `tools.json` 中添加新工具配置：

```json
{
  "slug": "new-tool-name",
  "category": "appropriate-category",
  "icon": "🔧",
  "name_zh": "工具中文名称",
  "name_en": "Tool English Name",
  "short_zh": "简短中文描述（用于列表和卡片）",
  "short_en": "Short English description (for lists and cards)",
  "keywords_zh": "关键词1,关键词2,关键词3",
  "keywords_en": "keyword1,keyword2,keyword3",
  "long_zh": "<p>详细中文描述，说明工具用途、特点和优势。</p><p>可以多段落，使用简单的 HTML 标签。</p>",
  "long_en": "<p>Detailed English description explaining tool purpose, features, and benefits.</p><p>Multiple paragraphs allowed with simple HTML tags.</p>",
  "ui_zh": "<div class=\"tool-panel\">\n  <!-- 中文 UI 元素 -->\n</div>",
  "ui_en": "<div class=\"tool-panel\">\n  <!-- English UI elements -->\n</div>",
  "related": ["related-tool-1", "related-tool-2"],
  "seo_title_zh": "工具名称 - 功能描述 | AI 工具盒子",
  "seo_title_en": "Tool Name - Function Description | AI Toolbox",
  "features_zh": [
    "功能点 1",
    "功能点 2",
    "功能点 3"
  ],
  "features_en": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "faq_zh": [
    ["常见问题 1?", "详细答案 1。"],
    ["常见问题 2?", "详细答案 2。"]
  ],
  "faq_en": [
    ["FAQ 1?", "Detailed answer 1."],
    ["FAQ 2?", "Detailed answer 2."]
  ]
}
```

#### 2.2 实现 JavaScript 逻辑
在 `assets/tools/new-tool-name.js` 中实现功能：

```javascript
// new-tool-name.js
// 工具: 工具中文名称
// 作者: [你的名字]
// 日期: YYYY-MM-DD

(function() {
    'use strict';
    
    // DOM 元素引用
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    // 工具核心逻辑
    function processTool(input) {
        // 实现工具的核心功能
        // 返回处理结果
        try {
            // 处理逻辑
            const result = input; // 替换为实际处理逻辑
            return {
                success: true,
                data: result,
                message: '处理成功'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: `处理失败: ${error.message}`
            };
        }
    }
    
    // 事件处理
    function handleProcess() {
        const input = inputEl.value.trim();
        if (!input) {
            toast('请输入内容');
            return;
        }
        
        const result = processTool(input);
        if (result.success) {
            outputEl.value = result.data;
            toast(result.message);
        } else {
            outputEl.value = '';
            toast(result.message, 'error');
        }
    }
    
    function handleClear() {
        inputEl.value = '';
        outputEl.value = '';
        toast('已清空');
    }
    
    function handleCopy() {
        if (!outputEl.value) {
            toast('没有内容可复制');
            return;
        }
        
        navigator.clipboard.writeText(outputEl.value)
            .then(() => toast('已复制到剪贴板'))
            .catch(err => toast('复制失败: ' + err.message, 'error'));
    }
    
    // 初始化事件监听
    function init() {
        if (processBtn) processBtn.addEventListener('click', handleProcess);
        if (clearBtn) clearBtn.addEventListener('click', handleClear);
        if (copyBtn) copyBtn.addEventListener('click', handleCopy);
        
        // 回车键触发处理
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleProcess();
            }
        });
        
        console.log('工具初始化完成: new-tool-name');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

#### 2.3 代码规范要求

##### JavaScript 规范
- 使用严格模式 `'use strict'`
- 所有函数和变量使用驼峰命名
- 常量使用大写字母和下划线
- 添加适当的错误处理
- 避免全局变量污染
- 使用 `_utils.js` 中的共享函数

##### UI 规范
- 使用现有的 CSS 类名保持一致性
- 响应式设计，支持移动端
- 清晰的视觉层次
- 适当的间距和排版
- 可访问性考虑 (ARIA 标签)

##### 性能规范
- 避免阻塞主线程的长时间操作
- 使用事件委托处理动态元素
- 合理使用防抖/节流
- 内存管理，避免内存泄漏

### 阶段 3: 测试和验证 (1-2小时)

#### 3.1 功能测试
- [ ] 测试正常用例
- [ ] 测试边界条件
- [ ] 测试错误处理
- [ ] 测试空输入/无效输入

#### 3.2 兼容性测试
- [ ] Chrome/Edge 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版
- [ ] 移动端浏览器

#### 3.3 性能测试
- [ ] 页面加载时间
- [ ] 工具响应时间
- [ ] 内存使用情况
- [ ] 大文件/大数据处理

#### 3.4 代码检查
```bash
# 运行构建脚本
python3 build.py

# 检查生成的 HTML
python3 -c "
import os
html_path = 'tools/new-tool-name.html'
if os.path.exists(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    checks = [
        ('<title>', '标题标签'),
        ('<meta name=\"description\"', '描述标签'),
        ('<script src=\"assets/tools/new-tool-name.js\"', 'JS引用'),
        ('canonical', '规范链接'),
        ('hreflang', '多语言链接')
    ]
    for check, name in checks:
        if check in content:
            print(f'✓ {name}')
        else:
            print(f'✗ {name} 缺失')
else:
    print('HTML 文件未生成')
"
```

### 阶段 4: 文档和发布 (1小时)

#### 4.1 更新文档
- [ ] 在 README.md 中更新工具列表
- [ ] 更新 MAINTENANCE_GUIDE.md 中的统计信息
- [ ] 添加工具使用说明（如果需要）

#### 4.2 提交代码
```bash
# 添加更改
git add tools.json assets/tools/new-tool-name.js

# 提交
git commit -m "feat: 添加新工具 [new-tool-name]

- 实现 [功能描述]
- 支持 [特性1, 特性2]
- 修复/优化 [相关改进]
- 测试通过所有用例"

# 推送到远程仓库
git push origin main
```

#### 4.3 部署验证
- [ ] 检查 Cloudflare Pages 构建状态
- [ ] 验证生产环境工具功能
- [ ] 测试生产环境性能
- [ ] 检查 SEO 标签是否正确

### 阶段 5: 后续维护

#### 5.1 监控和分析
- [ ] 监控工具使用情况
- [ ] 收集用户反馈
- [ ] 分析错误日志
- [ ] 跟踪 SEO 表现

#### 5.2 持续改进
- [ ] 根据反馈优化功能
- [ ] 修复发现的 bug
- [ ] 性能优化
- [ ] 添加新特性

## 模板文件

### 工具配置模板
保存为 `tools/template.json`：

```json
{
  "slug": "template",
  "category": "text",
  "icon": "📝",
  "name_zh": "模板工具",
  "name_en": "Template Tool",
  "short_zh": "简短描述",
  "short_en": "Short description",
  "keywords_zh": "关键词1,关键词2",
  "keywords_en": "keyword1,keyword2",
  "long_zh": "<p>详细描述工具的功能和用途。</p>",
  "long_en": "<p>Detailed description of the tool's functionality and purpose.</p>",
  "ui_zh": "<textarea id=\"input\" placeholder=\"输入内容...\"></textarea>\n<div class=\"btn-group\">\n  <button class=\"btn\" id=\"processBtn\">处理</button>\n  <button class=\"btn btn-secondary\" id=\"clearBtn\">清空</button>\n</div>\n<textarea id=\"output\" readonly placeholder=\"结果...\"></textarea>\n<button class=\"btn btn-secondary\" id=\"copyBtn\">📋 复制</button>",
  "ui_en": "<textarea id=\"input\" placeholder=\"Enter content...\"></textarea>\n<div class=\"btn-group\">\n  <button class=\"btn\" id=\"processBtn\">Process</button>\n  <button class=\"btn btn-secondary\" id=\"clearBtn\">Clear</button>\n</div>\n<textarea id=\"output\" readonly placeholder=\"Result...\"></textarea>\n<button class=\"btn btn-secondary\" id=\"copyBtn\">📋 Copy</button>",
  "related": ["related-tool-1", "related-tool-2"],
  "seo_title_zh": "模板工具 - 功能描述 | AI 工具盒子",
  "seo_title_en": "Template Tool - Function Description | AI Toolbox",
  "features_zh": ["功能1", "功能2", "功能3"],
  "features_en": ["Feature 1", "Feature 2", "Feature 3"],
  "faq_zh": [["问题1?", "答案1"], ["问题2?", "答案2"]],
  "faq_en": [["Question 1?", "Answer 1"], ["Question 2?", "Answer 2"]]
}
```

### JavaScript 模板
保存为 `assets/tools/template.js`：

```javascript
// template.js
// 工具: 模板工具
// 模板文件，复制后修改

(function() {
    'use strict';
    
    // DOM 元素
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    // 核心处理函数
    function process(input) {
        // TODO: 实现具体处理逻辑
        // 返回 { success: boolean, data: any, message: string }
        return {
            success: true,
            data: `处理结果: ${input}`,
            message: '处理完成'
        };
    }
    
    // 事件处理
    function onProcess() {
        const input = inputEl.value.trim();
        if (!input) {
            toast('请输入内容');
            return;
        }
        
        const result = process(input);
        if (result.success) {
            outputEl.value = result.data;
            toast(result.message);
        } else {
            outputEl.value = '';
            toast(result.message, 'error');
        }
    }
    
    function onClear() {
        inputEl.value = '';
        outputEl.value = '';
        toast('已清空');
    }
    
    function onCopy() {
        if (!outputEl.value) {
            toast('没有内容可复制');
            return;
        }
        
        navigator.clipboard.writeText(outputEl.value)
            .then(() => toast('已复制到剪贴板'))
            .catch(err => toast('复制失败: ' + err.message, 'error'));
    }
    
    // 初始化
    function init() {
        if (processBtn) processBtn.addEventListener('click', onProcess);
        if (clearBtn) clearBtn.addEventListener('click', onClear);
        if (copyBtn) copyBtn.addEventListener('click', onCopy);
        
        // Ctrl/Cmd + Enter 快捷键
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onProcess();
            }
        });
        
        console.log('工具初始化完成: template');
    }
    
    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

## 质量检查清单

### 开发前检查
- [ ] 工具创意是否独特或有明显改进？
- [ ] 是否已有类似工具？
- [ ] 技术实现是否可行？
- [ ] 预计开发时间是否合理？

### 开发中检查
- [ ] 代码是否符合规范？
- [ ] 是否处理了所有错误情况？
- [ ] UI 是否一致且响应式？
- [ ] 性能是否可接受？

### 发布前检查
- [ ] 所有测试是否通过？
- [ ] SEO 标签是否正确？
- [ ] 多语言支持是否完整？
- [ ] 相关工具链接是否正确？

### 发布后检查
- [ ] 生产环境功能是否正常？
- [ ] 是否有性能问题？
- [ ] 用户反馈如何？
- [ ] SEO 表现如何？

## 常见问题和解决方案

### 问题1: 构建后工具页面不显示
**原因**: tools.json 配置错误或构建失败
**解决**: 
1. 检查 tools.json JSON 语法
2. 运行 `python3 build.py` 查看错误
3. 确认工具 slug 唯一

### 问题2: JavaScript 功能不工作
**原因**: JS 文件路径错误或代码错误
**解决**:
1. 检查浏览器控制台错误
2. 确认 JS 文件在正确位置
3. 验证 JS 代码语法

### 问题3: SEO 标签不正确
**原因**: 构建脚本未正确生成 meta 标签
**解决**:
1. 检查工具配置中的 SEO 字段
2. 重新运行构建脚本
3. 查看生成的 HTML 文件

### 问题4: 多语言支持不完整
**原因**: 缺少某些语言的字段
**解决**:
1. 确保所有工具都有中英文版本
2. 检查 `name_zh`/`name_en`, `short_zh`/`short_en` 等字段
3. 验证 hreflang 标签是否正确

## 最佳实践

### 代码组织
1. **模块化**: 将复杂功能拆分为小函数
2. **可重用**: 提取通用逻辑到 `_utils.js`
3. **可测试**: 编写可测试的纯函数
4. **可维护**: 添加清晰的注释和文档

### 用户体验
1. **即时反馈**: 处理时显示加载状态
2. **错误处理**: 友好的错误提示
3. **快捷键**: 支持常用快捷键
4. **进度指示**: 长时间操作显示进度

### 性能优化
1. **懒加载**: 大资源延迟加载
2. **缓存**: 合理使用缓存
3. **防抖节流**: 高频操作优化
4. **内存管理**: 及时释放资源

### SEO 优化
1. **语义化 HTML**: 使用正确的标签
2. **结构化数据**: 添加 JSON-LD
3. **页面速度**: 优化加载性能
4. **移动友好**: 响应式设计

---

*版本: 1.0*
*更新日期: 2026-05-28*
*维护者: Hermes Agent*