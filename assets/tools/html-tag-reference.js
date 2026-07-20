/**
 * HTML Tag Reference - Searchable HTML5 tag reference with attributes and examples
 * Pure JS, zero dependencies, runs entirely in browser.
 * Covers all standard HTML5 elements with descriptions, attributes, and usage.
 */
(function() {
'use strict';

function init() {
    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    const searchInput = document.getElementById('htr-search');
    const filterSelect = document.getElementById('htr-filter');
    const resultsEl = document.getElementById('htr-results');
    const countEl = document.getElementById('htr-count');

    if (!searchInput || !filterSelect || !resultsEl || !countEl) return;

    const TAGS = [
        { tag: 'a', category: 'inline', zh: '定义超链接', en: 'Defines a hyperlink', attrs: 'href, target, rel, download, hreflang', example: '<a href="https://example.com">Visit</a>', deprecated: false },
        { tag: 'abbr', category: 'inline', zh: '定义缩写', en: 'Defines an abbreviation', attrs: 'title', example: '<abbr title="HTML">HTML</abbr>', deprecated: false },
        { tag: 'address', category: 'section', zh: '定义联系信息', en: 'Defines contact information', attrs: '', example: '<address>Contact: <a href="mailto:hi@example.com">hi@example.com</a></address>', deprecated: false },
        { tag: 'area', category: 'media', zh: '定义图像映射可点击区域', en: 'Defines a clickable area inside an image map', attrs: 'shape, coords, href, alt, target', example: '<area shape="rect" coords="0,0,100,100" href="page.html" alt="Page">', deprecated: false },
        { tag: 'article', category: 'section', zh: '定义独立内容区块', en: 'Defines independent, self-contained content', attrs: '', example: '<article><h2>Blog Post</h2><p>Content...</p></article>', deprecated: false },
        { tag: 'aside', category: 'section', zh: '定义侧边栏内容', en: 'Defines content aside from the page content', attrs: '', example: '<aside><p>Related links...</p></aside>', deprecated: false },
        { tag: 'audio', category: 'media', zh: '定义音频内容', en: 'Defines embedded sound content', attrs: 'src, controls, autoplay, loop, muted, preload', example: '<audio controls src="audio.mp3"></audio>', deprecated: false },
        { tag: 'b', category: 'inline', zh: '定义粗体文本', en: 'Defines bold text', attrs: '', example: '<b>Bold text</b>', deprecated: false },
        { tag: 'base', category: 'head', zh: '定义基准 URL', en: 'Defines the base URL for all relative URLs', attrs: 'href, target', example: '<base href="https://example.com/">', deprecated: false },
        { tag: 'bdi', category: 'inline', zh: '定义文本方向隔离', en: 'Isolates text with different direction', attrs: 'dir', example: '<bdi>Arabic text</bdi>', deprecated: false },
        { tag: 'bdo', category: 'inline', zh: '覆盖文本方向', en: 'Overrides the current text direction', attrs: 'dir', example: '<bdo dir="rtl">RTL text</bdo>', deprecated: false },
        { tag: 'blockquote', category: 'section', zh: '定义块引用', en: 'Defines a block quotation', attrs: 'cite', example: '<blockquote cite="https://source.com">Quote text here.</blockquote>', deprecated: false },
        { tag: 'body', category: 'structure', zh: '定义文档主体', en: 'Defines the document\'s body', attrs: '', example: '<body>Page content</body>', deprecated: false },
        { tag: 'br', category: 'inline', zh: '定义换行', en: 'Defines a single line break', attrs: '', example: 'Line 1<br>Line 2', deprecated: false },
        { tag: 'button', category: 'form', zh: '定义可点击按钮', en: 'Defines a clickable button', attrs: 'type, disabled, form, name, value', example: '<button type="submit">Submit</button>', deprecated: false },
        { tag: 'canvas', category: 'media', zh: '定义图形绘制区域', en: 'Defines a drawing area for graphics', attrs: 'width, height', example: '<canvas id="myCanvas" width="200" height="100"></canvas>', deprecated: false },
        { tag: 'caption', category: 'table', zh: '定义表格标题', en: 'Defines a table caption', attrs: '', example: '<table><caption>Monthly Sales</caption>...</table>', deprecated: false },
        { tag: 'cite', category: 'inline', zh: '定义作品标题', en: 'Defines the title of a work', attrs: '', example: '<cite>Mona Lisa</cite>', deprecated: false },
        { tag: 'code', category: 'inline', zh: '定义代码片段', en: 'Defines a piece of computer code', attrs: '', example: '<code>console.log("hello")</code>', deprecated: false },
        { tag: 'col', category: 'table', zh: '定义表格列属性', en: 'Defines column properties', attrs: 'span, width', example: '<colgroup><col span="2" style="background:red"></colgroup>', deprecated: false },
        { tag: 'colgroup', category: 'table', zh: '定义表格列组', en: 'Defines a group of columns', attrs: 'span', example: '<colgroup><col><col></colgroup>', deprecated: false },
        { tag: 'data', category: 'inline', zh: '定义机器可读数据', en: 'Links content with a machine-readable value', attrs: 'value', example: '<data value="42">Answer</data>', deprecated: false },
        { tag: 'datalist', category: 'form', zh: '定义输入选项列表', en: 'Defines a list of pre-defined options', attrs: '', example: '<input list="browsers"><datalist id="browsers"><option value="Chrome"></datalist>', deprecated: false },
        { tag: 'dd', category: 'list', zh: '定义定义列表中的描述', en: 'Defines a description in a description list', attrs: '', example: '<dl><dt>HTML</dt><dd>Markup language</dd></dl>', deprecated: false },
        { tag: 'del', category: 'inline', zh: '定义已删除文本', en: 'Defines deleted text', attrs: 'cite, datetime', example: '<del>Old price: $100</del>', deprecated: false },
        { tag: 'details', category: 'interactive', zh: '定义可展开详细信息', en: 'Defines additional details the user can toggle', attrs: 'open', example: '<details><summary>Click me</summary><p>Hidden content</p></details>', deprecated: false },
        { tag: 'dfn', category: 'inline', zh: '定义术语定义', en: 'Defines a definition term', attrs: 'title', example: '<dfn>HTML</dfn> is a markup language.', deprecated: false },
        { tag: 'dialog', category: 'interactive', zh: '定义对话框或窗口', en: 'Defines a dialog box or window', attrs: 'open', example: '<dialog open><p>Hello!</p><button>Close</button></dialog>', deprecated: false },
        { tag: 'div', category: 'section', zh: '定义文档分区', en: 'Defines a division or section', attrs: '', example: '<div class="container">Content</div>', deprecated: false },
        { tag: 'dl', category: 'list', zh: '定义定义列表', en: 'Defines a description list', attrs: '', example: '<dl><dt>Term</dt><dd>Description</dd></dl>', deprecated: false },
        { tag: 'dt', category: 'list', zh: '定义定义列表中的术语', en: 'Defines a term in a description list', attrs: '', example: '<dt>HTML</dt>', deprecated: false },
        { tag: 'em', category: 'inline', zh: '定义强调文本', en: 'Defines emphasized text', attrs: '', example: '<em>Important!</em>', deprecated: false },
        { tag: 'embed', category: 'media', zh: '定义嵌入内容', en: 'Defines embedded content', attrs: 'src, type, width, height', example: '<embed src="file.pdf" type="application/pdf" width="400" height="300">', deprecated: false },
        { tag: 'fieldset', category: 'form', zh: '定义表单元素分组', en: 'Groups related form elements', attrs: 'disabled, form, name', example: '<fieldset><legend>Personal Info</legend>...</fieldset>', deprecated: false },
        { tag: 'figcaption', category: 'section', zh: '定义 figure 的标题', en: 'Defines a caption for a <figure>', attrs: '', example: '<figure><img src="photo.jpg"><figcaption>Photo</figcaption></figure>', deprecated: false },
        { tag: 'figure', category: 'section', zh: '定义独立内容', en: 'Defines self-contained content', attrs: '', example: '<figure><img src="chart.png"><figcaption>Chart</figcaption></figure>', deprecated: false },
        { tag: 'footer', category: 'section', zh: '定义页脚', en: 'Defines a footer for a document or section', attrs: '', example: '<footer><p>&copy; 2025</p></footer>', deprecated: false },
        { tag: 'form', category: 'form', zh: '定义 HTML 表单', en: 'Defines an HTML form for user input', attrs: 'action, method, enctype, novalidate, target', example: '<form action="/submit" method="post">...</form>', deprecated: false },
        { tag: 'h1 to h6', category: 'section', zh: '定义 HTML 标题', en: 'Defines HTML headings', attrs: '', example: '<h1>Main heading</h1><h2>Sub heading</h2>', deprecated: false },
        { tag: 'head', category: 'structure', zh: '定义文档元数据容器', en: 'Defines the container for metadata', attrs: '', example: '<head><title>Page Title</title></head>', deprecated: false },
        { tag: 'header', category: 'section', zh: '定义页眉', en: 'Defines a header for a document or section', attrs: '', example: '<header><h1>Site Title</h1><nav>...</nav></header>', deprecated: false },
        { tag: 'hgroup', category: 'section', zh: '定义标题组', en: 'Defines a group of headings', attrs: '', example: '<hgroup><h1>Main</h1><h2>Sub</h2></hgroup>', deprecated: false },
        { tag: 'hr', category: 'section', zh: '定义主题分隔线', en: 'Defines a thematic break', attrs: '', example: '<hr>', deprecated: false },
        { tag: 'html', category: 'structure', zh: '定义 HTML 文档根元素', en: 'Defines the root of an HTML document', attrs: 'lang', example: '<html lang="en">...</html>', deprecated: false },
        { tag: 'i', category: 'inline', zh: '定义斜体文本', en: 'Defines italic text', attrs: '', example: '<i>Italic text</i>', deprecated: false },
        { tag: 'iframe', category: 'media', zh: '定义内联框架', en: 'Defines an inline frame', attrs: 'src, srcdoc, name, width, height, allow, sandbox, loading', example: '<iframe src="page.html" width="400" height="300"></iframe>', deprecated: false },
        { tag: 'img', category: 'media', zh: '定义图像', en: 'Defines an image', attrs: 'src, alt, width, height, loading, srcset, sizes', example: '<img src="photo.jpg" alt="Description" width="200">', deprecated: false },
        { tag: 'input', category: 'form', zh: '定义输入控件', en: 'Defines an input control', attrs: 'type, name, value, placeholder, required, disabled, readonly, min, max, pattern', example: '<input type="text" name="username" placeholder="Enter name">', deprecated: false },
        { tag: 'ins', category: 'inline', zh: '定义插入的文本', en: 'Defines inserted text', attrs: 'cite, datetime', example: '<ins>New content</ins>', deprecated: false },
        { tag: 'kbd', category: 'inline', zh: '定义键盘输入', en: 'Defines keyboard input', attrs: '', example: '<kbd>Ctrl + C</kbd>', deprecated: false },
        { tag: 'label', category: 'form', zh: '定义 input 标签', en: 'Defines a label for an <input>', attrs: 'for', example: '<label for="email">Email:</label><input id="email" type="email">', deprecated: false },
        { tag: 'legend', category: 'form', zh: '定义 fieldset 标题', en: 'Defines a caption for a <fieldset>', attrs: '', example: '<fieldset><legend>Contact Info</legend>...</fieldset>', deprecated: false },
        { tag: 'li', category: 'list', zh: '定义列表项', en: 'Defines a list item', attrs: 'value', example: '<li>Item 1</li>', deprecated: false },
        { tag: 'link', category: 'head', zh: '定义外部资源链接', en: 'Defines the relationship between document and external resource', attrs: 'rel, href, type, media, crossorigin, integrity', example: '<link rel="stylesheet" href="styles.css">', deprecated: false },
        { tag: 'main', category: 'section', zh: '定义文档主要内容', en: 'Defines the main content of a document', attrs: '', example: '<main><article>...</article></main>', deprecated: false },
        { tag: 'map', category: 'media', zh: '定义图像映射', en: 'Defines an image map', attrs: 'name', example: '<map name="map1"><area ...></map>', deprecated: false },
        { tag: 'mark', category: 'inline', zh: '定义高亮文本', en: 'Defines highlighted/marked text', attrs: '', example: '<mark>Important</mark> text', deprecated: false },
        { tag: 'menu', category: 'interactive', zh: '定义菜单列表', en: 'Defines a list/menu of commands', attrs: '', example: '<menu><li>Item</li></menu>', deprecated: false },
        { tag: 'meta', category: 'head', zh: '定义文档元数据', en: 'Defines metadata about an HTML document', attrs: 'charset, name, content, http-equiv', example: '<meta charset="UTF-8"><meta name="viewport" content="width=device-width">', deprecated: false },
        { tag: 'meter', category: 'form', zh: '定义度量衡', en: 'Defines a scalar measurement within a range', attrs: 'value, min, max, low, high, optimum', example: '<meter value="0.7" min="0" max="1">70%</meter>', deprecated: false },
        { tag: 'nav', category: 'section', zh: '定义导航链接', en: 'Defines navigation links', attrs: '', example: '<nav><a href="/">Home</a><a href="/about">About</a></nav>', deprecated: false },
        { tag: 'noscript', category: 'structure', zh: '定义无脚本替代内容', en: 'Defines alternate content for users without scripts', attrs: '', example: '<noscript>JavaScript is disabled.</noscript>', deprecated: false },
        { tag: 'object', category: 'media', zh: '定义嵌入对象', en: 'Defines an embedded object', attrs: 'data, type, width, height, name', example: '<object data="flash.swf" width="400" height="300"></object>', deprecated: false },
        { tag: 'ol', category: 'list', zh: '定义有序列表', en: 'Defines an ordered list', attrs: 'type, start, reversed', example: '<ol><li>First</li><li>Second</li></ol>', deprecated: false },
        { tag: 'optgroup', category: 'form', zh: '定义选项组', en: 'Defines a group of options in a select', attrs: 'label, disabled', example: '<select><optgroup label="Fruits"><option>Apple</option></optgroup></select>', deprecated: false },
        { tag: 'option', category: 'form', zh: '定义下拉选项', en: 'Defines an option in a select list', attrs: 'value, selected, disabled, label', example: '<option value="1">Option 1</option>', deprecated: false },
        { tag: 'output', category: 'form', zh: '定义计算结果', en: 'Defines the result of a calculation', attrs: 'for, form, name', example: '<output name="result">42</output>', deprecated: false },
        { tag: 'p', category: 'section', zh: '定义段落', en: 'Defines a paragraph', attrs: '', example: '<p>This is a paragraph of text.</p>', deprecated: false },
        { tag: 'picture', category: 'media', zh: '定义响应式图片容器', en: 'Defines a container for responsive images', attrs: '', example: '<picture><source srcset="img.webp" type="image/webp"><img src="img.jpg" alt=""></picture>', deprecated: false },
        { tag: 'pre', category: 'section', zh: '定义预格式化文本', en: 'Defines preformatted text', attrs: '', example: '<pre>  Code block  with formatting</pre>', deprecated: false },
        { tag: 'progress', category: 'form', zh: '定义进度条', en: 'Defines a progress bar', attrs: 'value, max', example: '<progress value="70" max="100">70%</progress>', deprecated: false },
        { tag: 'q', category: 'inline', zh: '定义短引用', en: 'Defines a short inline quotation', attrs: 'cite', example: '<q>Short quote</q>', deprecated: false },
        { tag: 'rp', category: 'ruby', zh: '定义 ruby 括号', en: 'Defines parentheses for ruby annotations', attrs: '', example: '<ruby>\u6f22<rp>(</rp><rt>kan</rt><rp>)</rp></ruby>', deprecated: false },
        { tag: 'rt', category: 'ruby', zh: '定义 ruby 发音注释', en: 'Defines pronunciation for ruby annotations', attrs: '', example: '<ruby>\u6f22<rt>kan</rt></ruby>', deprecated: false },
        { tag: 'ruby', category: 'ruby', zh: '定义 ruby 注释容器', en: 'Defines a ruby annotation container', attrs: '', example: '<ruby>\u6f22<rt>kan</rt></ruby>', deprecated: false },
        { tag: 's', category: 'inline', zh: '定义删除线文本', en: 'Defines strikethrough text', attrs: '', example: '<s>Old information</s>', deprecated: false },
        { tag: 'samp', category: 'inline', zh: '定义计算机输出示例', en: 'Defines sample output from a computer program', attrs: '', example: '<samp>Error: 404</samp>', deprecated: false },
        { tag: 'script', category: 'head', zh: '定义客户端脚本', en: 'Defines a client-side script', attrs: 'src, type, async, defer, crossorigin, integrity', example: '<script src="app.js"></script>', deprecated: false },
        { tag: 'search', category: 'section', zh: '定义搜索区域', en: 'Defines a search area', attrs: '', example: '<search><input type="search"><button>Search</button></search>', deprecated: false },
        { tag: 'section', category: 'section', zh: '定义文档节', en: 'Defines a section in a document', attrs: '', example: '<section><h2>Chapter 1</h2><p>Content...</p></section>', deprecated: false },
        { tag: 'select', category: 'form', zh: '定义下拉列表', en: 'Defines a drop-down list', attrs: 'name, multiple, size, required, disabled', example: '<select name="country"><option>China</option></select>', deprecated: false },
        { tag: 'slot', category: 'structure', zh: '定义 Web Component 插槽', en: 'Defines a slot in a Web Component', attrs: 'name', example: '<slot name="header">Default header</slot>', deprecated: false },
        { tag: 'small', category: 'inline', zh: '定义小号文本', en: 'Defines smaller text', attrs: '', example: '<small>Disclaimer text</small>', deprecated: false },
        { tag: 'source', category: 'media', zh: '定义媒体资源', en: 'Defines media resources', attrs: 'src, type, srcset, media, sizes', example: '<source srcset="img.webp" type="image/webp">', deprecated: false },
        { tag: 'span', category: 'inline', zh: '定义行内容器', en: 'Defines an inline container', attrs: '', example: '<span style="color:red">Red text</span>', deprecated: false },
        { tag: 'strong', category: 'inline', zh: '定义重要文本', en: 'Defines important text', attrs: '', example: '<strong>Warning!</strong>', deprecated: false },
        { tag: 'style', category: 'head', zh: '定义样式信息', en: 'Defines style information', attrs: 'type, media', example: '<style>body { font-family: sans-serif; }</style>', deprecated: false },
        { tag: 'sub', category: 'inline', zh: '定义下标文本', en: 'Defines subscripted text', attrs: '', example: 'H<sub>2</sub>O', deprecated: false },
        { tag: 'summary', category: 'interactive', zh: '定义 details 可见标题', en: 'Defines a visible heading for a details element', attrs: '', example: '<details><summary>Click to expand</summary>Content</details>', deprecated: false },
        { tag: 'sup', category: 'inline', zh: '定义上标文本', en: 'Defines superscripted text', attrs: '', example: 'E=mc<sup>2</sup>', deprecated: false },
        { tag: 'table', category: 'table', zh: '定义表格', en: 'Defines a table', attrs: '', example: '<table><tr><td>Cell</td></tr></table>', deprecated: false },
        { tag: 'tbody', category: 'table', zh: '定义表格主体', en: 'Defines the body of a table', attrs: '', example: '<table><tbody><tr><td>Data</td></tr></tbody></table>', deprecated: false },
        { tag: 'td', category: 'table', zh: '定义表格单元格', en: 'Defines a table cell', attrs: 'colspan, rowspan, headers', example: '<td colspan="2">Merged cell</td>', deprecated: false },
        { tag: 'template', category: 'structure', zh: '定义模板内容', en: 'Defines a template for reusable content', attrs: '', example: '<template id="my-template"><p>Reusable content</p></template>', deprecated: false },
        { tag: 'textarea', category: 'form', zh: '定义多行文本输入', en: 'Defines a multiline text input', attrs: 'name, rows, cols, placeholder, required, disabled, readonly', example: '<textarea name="bio" rows="4" cols="50"></textarea>', deprecated: false },
        { tag: 'tfoot', category: 'table', zh: '定义表格页脚', en: 'Defines the footer of a table', attrs: '', example: '<table><tfoot><tr><td>Total</td></tr></tfoot></table>', deprecated: false },
        { tag: 'th', category: 'table', zh: '定义表格表头单元格', en: 'Defines a table header cell', attrs: 'colspan, rowspan, scope, abbr', example: '<th scope="col">Name</th>', deprecated: false },
        { tag: 'thead', category: 'table', zh: '定义表格表头', en: 'Defines the header of a table', attrs: '', example: '<table><thead><tr><th>Name</th></tr></thead></table>', deprecated: false },
        { tag: 'time', category: 'inline', zh: '定义日期/时间', en: 'Defines a date/time value', attrs: 'datetime', example: '<time datetime="2025-01-01">Jan 1, 2025</time>', deprecated: false },
        { tag: 'title', category: 'head', zh: '定义文档标题', en: 'Defines the title of the document', attrs: '', example: '<title>My Page Title</title>', deprecated: false },
        { tag: 'tr', category: 'table', zh: '定义表格行', en: 'Defines a row in a table', attrs: '', example: '<table><tr><td>Cell</td></tr></table>', deprecated: false },
        { tag: 'track', category: 'media', zh: '定义媒体字幕轨道', en: 'Defines text tracks for media elements', attrs: 'src, kind, srclang, label, default', example: '<track src="subtitles.vtt" kind="subtitles" srclang="en">', deprecated: false },
        { tag: 'u', category: 'inline', zh: '定义非文本注释', en: 'Defines unarticulated annotation (underlined)', attrs: '', example: '<u>Misspelled</u> word', deprecated: false },
        { tag: 'ul', category: 'list', zh: '定义无序列表', en: 'Defines an unordered list', attrs: '', example: '<ul><li>Item</li><li>Item</li></ul>', deprecated: false },
        { tag: 'var', category: 'inline', zh: '定义变量', en: 'Defines a variable', attrs: '', example: '<var>x</var> = 10', deprecated: false },
        { tag: 'video', category: 'media', zh: '定义视频内容', en: 'Defines embedded video content', attrs: 'src, controls, autoplay, loop, muted, poster, width, height', example: '<video controls width="400" src="video.mp4"></video>', deprecated: false },
        { tag: 'wbr', category: 'inline', zh: '定义可选换行点', en: 'Defines a possible line-break point', attrs: '', example: 'Super<wbr>Long<wbr>Word', deprecated: false }
    ];

    const CAT_LABELS = {
        'all':       { zh: '全部', en: 'All' },
        'inline':    { zh: '行内元素', en: 'Inline' },
        'section':   { zh: '区块元素', en: 'Section' },
        'structure': { zh: '结构元素', en: 'Structure' },
        'form':      { zh: '表单元素', en: 'Form' },
        'table':     { zh: '表格元素', en: 'Table' },
        'list':      { zh: '列表元素', en: 'List' },
        'media':     { zh: '媒体元素', en: 'Media' },
        'head':      { zh: '头部元素', en: 'Head' },
        'interactive': { zh: '交互元素', en: 'Interactive' },
        'ruby':      { zh: 'Ruby 注释', en: 'Ruby' }
    };

    // Populate filter
    Object.keys(CAT_LABELS).forEach(function(key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = CAT_LABELS[key][isEN ? 'en' : 'zh'];
        filterSelect.appendChild(opt);
    });

    function render() {
        var query = searchInput.value.toLowerCase().trim();
        var filter = filterSelect.value;
        var matched = TAGS.filter(function(t) {
            if (filter !== 'all' && t.category !== filter) return false;
            if (query && t.tag.toLowerCase().indexOf(query) === -1) return false;
            return true;
        });

        var html = '';
        matched.forEach(function(t) {
            var depBadge = t.deprecated ? '<span style="font-size:10px;padding:1px 5px;background:#fff0f0;color:#c00;border-radius:3px;margin-left:6px">' + T('已废弃', 'Deprecated') + '</span>' : '';
            html += '<div class="htr-card" style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-card);margin-bottom:8px">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap">';
            html += '<code style="font-size:14px;font-weight:600;color:var(--accent);cursor:pointer" onclick="navigator.clipboard.writeText(\'' + t.tag.replace(/'/g, "\\'") + '\');this.style.opacity=0.5;setTimeout(function(){this.style.opacity=1}.bind(this),500)" title="' + T('点击复制', 'Click to copy') + '">&lt;' + esc(t.tag) + '&gt;</code>' + depBadge;
            html += '<span style="font-size:11px;padding:2px 6px;background:var(--bg-subtle);border-radius:4px;color:var(--text-dim)">' + esc(CAT_LABELS[t.category] ? CAT_LABELS[t.category][isEN ? 'en' : 'zh'] : t.category) + '</span>';
            html += '</div>';
            html += '<p style="font-size:13px;margin:0 0 4px 0;color:var(--text)">' + esc(isEN ? t.en : t.zh) + '</p>';
            if (t.attrs) {
                html += '<div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">' + T('属性', 'Attrs') + ': <code style="font-size:11px;color:var(--text-dim)">' + esc(t.attrs) + '</code></div>';
            }
            html += '<pre style="font-size:12px;padding:6px 8px;background:var(--bg-subtle);border-radius:4px;margin:0;overflow-x:auto;color:var(--text-dim);border:1px solid var(--border);font-family:Consolas,monospace;white-space:pre-wrap;word-break:break-all">' + esc(t.example) + '</pre>';
            html += '</div>';
        });

        if (matched.length === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:48px 16px;color:var(--text-dim)"><div style="font-size:32px;margin-bottom:8px">\ud83d\udd0d</div><p style="font-size:14px;margin:0">' + T('未找到匹配的标签', 'No matching tags found') + '</p></div>';
        } else {
            resultsEl.innerHTML = html;
        }
        countEl.textContent = T('共 ' + matched.length + ' 个标签', matched.length + ' tags');
    }

    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    searchInput.addEventListener('input', render);
    filterSelect.addEventListener('change', render);

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
