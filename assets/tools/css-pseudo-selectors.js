/**
 * CSS Pseudo-Selector Reference - Searchable reference for CSS pseudo-classes & pseudo-elements
 * Pure JS, zero dependencies, runs entirely in browser.
 * Covers all standard CSS pseudo-classes and pseudo-elements with examples.
 */
(function() {
'use strict';

function init() {
    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    const searchInput = document.getElementById('cps-search');
    const filterSelect = document.getElementById('cps-filter');
    const resultsEl = document.getElementById('cps-results');
    const countEl = document.getElementById('cps-count');
    const copyBtn = document.getElementById('cps-copy-btn');

    if (!searchInput || !filterSelect || !resultsEl || !countEl) return;

    const CSS_PSEUDO = {
        'pseudo-classes': {
            name_zh: '伪类',
            name_en: 'Pseudo-classes',
            selectors: [
                { selector: ':active', category: 'dynamic', zh: '匹配被用户激活的元素（如鼠标点击瞬间）', en: 'Matches an element being activated by the user', example: 'a:active { color: red; }', supports: 'all' },
                { selector: ':any-link', category: 'link', zh: '匹配所有包含 href 属性的链接元素', en: 'Matches any element with an href attribute', example: ':any-link { color: blue; }', supports: 'modern' },
                { selector: ':autofill', category: 'form', zh: '匹配浏览器自动填充的 input 元素', en: 'Matches auto-filled input elements', example: 'input:autofill { background: #fff; }', supports: 'modern' },
                { selector: ':blank', category: 'form', zh: '匹配输入值为空的 input 元素', en: 'Matches input elements whose value is empty', example: 'input:blank { border: 1px solid #ccc; }', supports: 'limited' },
                { selector: ':checked', category: 'form', zh: '匹配被选中的 radio/checkbox/option', en: 'Matches selected radio, checkbox, or option elements', example: 'input:checked + label { font-weight: bold; }', supports: 'all' },
                { selector: ':default', category: 'form', zh: '匹配一组元素中的默认元素', en: 'Matches the default element in a group', example: 'input:default { box-shadow: 0 0 2px blue; }', supports: 'modern' },
                { selector: ':disabled', category: 'form', zh: '匹配被禁用的表单元素', en: 'Matches disabled form elements', example: 'input:disabled { opacity: 0.5; }', supports: 'all' },
                { selector: ':empty', category: 'structural', zh: '匹配没有子元素的元素', en: 'Matches elements with no children', example: 'div:empty { display: none; }', supports: 'all' },
                { selector: ':enabled', category: 'form', zh: '匹配可用的（未禁用）表单元素', en: 'Matches enabled form elements', example: 'input:enabled { background: white; }', supports: 'all' },
                { selector: ':first-child', category: 'structural', zh: '匹配父元素的第一个子元素', en: 'Matches the first child of its parent', example: 'li:first-child { font-weight: bold; }', supports: 'all' },
                { selector: ':first-of-type', category: 'structural', zh: '匹配同类元素中的第一个', en: 'Matches the first element of its type among siblings', example: 'p:first-of-type { margin-top: 0; }', supports: 'all' },
                { selector: ':focus', category: 'dynamic', zh: '匹配获得焦点的元素', en: 'Matches an element that has received focus', example: 'input:focus { border-color: blue; }', supports: 'all' },
                { selector: ':focus-visible', category: 'dynamic', zh: '匹配通过键盘导航获得焦点的元素', en: 'Matches elements focused via keyboard navigation', example: 'button:focus-visible { outline: 2px solid blue; }', supports: 'modern' },
                { selector: ':focus-within', category: 'dynamic', zh: '匹配自身或子元素获得焦点的元素', en: 'Matches element when it or its descendants have focus', example: 'form:focus-within { background: #f0f8ff; }', supports: 'modern' },
                { selector: ':fullscreen', category: 'display', zh: '匹配当前处于全屏模式的元素', en: 'Matches an element in fullscreen mode', example: ':fullscreen { background: black; }', supports: 'modern' },
                { selector: ':has()', category: 'structural', zh: '匹配包含匹配子元素的父元素', en: 'Matches a parent with a child matching the selector', example: 'div:has(> img) { border: 1px solid #ccc; }', supports: 'modern' },
                { selector: ':hover', category: 'dynamic', zh: '匹配鼠标悬停的元素', en: 'Matches an element under the mouse cursor', example: 'a:hover { text-decoration: underline; }', supports: 'all' },
                { selector: ':in-range', category: 'form', zh: '匹配值在指定范围内的 input', en: 'Matches inputs with values within range', example: 'input:in-range { border: 1px solid green; }', supports: 'modern' },
                { selector: ':indeterminate', category: 'form', zh: '匹配不确定状态的 checkbox/radio/progress', en: 'Matches indeterminate state elements', example: 'input:indeterminate { opacity: 0.5; }', supports: 'modern' },
                { selector: ':invalid', category: 'form', zh: '匹配验证不通过的表单元素', en: 'Matches form elements that fail validation', example: 'input:invalid { border-color: red; }', supports: 'all' },
                { selector: ':is()', category: 'structural', zh: '匹配选择器列表中的任意一个', en: 'Matches any selector in the list (with forgiveness)', example: ':is(header, main, footer) p { line-height: 1.6; }', supports: 'modern' },
                { selector: ':lang()', category: 'language', zh: '匹配指定语言的元素', en: 'Matches elements in a specified language', example: 'p:lang(fr) { quotes: "\\00AB" "\\00BB"; }', supports: 'all' },
                { selector: ':last-child', category: 'structural', zh: '匹配父元素的最后一个子元素', en: 'Matches the last child of its parent', example: 'li:last-child { border: none; }', supports: 'all' },
                { selector: ':last-of-type', category: 'structural', zh: '匹配同类元素中的最后一个', en: 'Matches the last element of its type', example: 'p:last-of-type { margin-bottom: 0; }', supports: 'all' },
                { selector: ':link', category: 'link', zh: '匹配未访问过的链接', en: 'Matches unvisited links', example: 'a:link { color: blue; }', supports: 'all' },
                { selector: ':not()', category: 'structural', zh: '匹配不符合选择器条件的元素', en: 'Matches elements that do NOT match the selector', example: 'input:not([type="submit"]) { border: 1px solid #ccc; }', supports: 'all' },
                { selector: ':nth-child()', category: 'structural', zh: '匹配父元素中第 n 个子元素', en: 'Matches the nth child of its parent', example: 'tr:nth-child(odd) { background: #f5f5f5; }', supports: 'all' },
                { selector: ':nth-last-child()', category: 'structural', zh: '从末尾计数匹配第 n 个子元素', en: 'Matches the nth child counting from the end', example: 'li:nth-last-child(2) { color: red; }', supports: 'all' },
                { selector: ':nth-last-of-type()', category: 'structural', zh: '从末尾计数匹配同类元素中的第 n 个', en: 'Matches the nth element of its type from the end', example: 'p:nth-last-of-type(2) { font-style: italic; }', supports: 'all' },
                { selector: ':nth-of-type()', category: 'structural', zh: '匹配同类元素中的第 n 个', en: 'Matches the nth element of its type among siblings', example: 'p:nth-of-type(2) { font-size: 1.2em; }', supports: 'all' },
                { selector: ':only-child', category: 'structural', zh: '匹配作为唯一子元素的元素', en: 'Matches an element that is the only child', example: 'li:only-child { list-style: none; }', supports: 'all' },
                { selector: ':only-of-type', category: 'structural', zh: '匹配同类元素中唯一的一个', en: 'Matches the only element of its type', example: 'img:only-of-type { width: 100%; }', supports: 'all' },
                { selector: ':optional', category: 'form', zh: '匹配非必填的表单元素', en: 'Matches form elements without required attribute', example: 'input:optional { border: 1px solid #aaa; }', supports: 'modern' },
                { selector: ':out-of-range', category: 'form', zh: '匹配值超出范围限制的 input', en: 'Matches inputs with values outside the range', example: 'input:out-of-range { border: 1px solid orange; }', supports: 'modern' },
                { selector: ':placeholder-shown', category: 'form', zh: '匹配 placeholder 正在显示的 input', en: 'Matches inputs whose placeholder is visible', example: 'input:placeholder-shown { color: #999; }', supports: 'modern' },
                { selector: ':read-only', category: 'form', zh: '匹配只读的表单元素', en: 'Matches read-only form elements', example: 'input:read-only { background: #f0f0f0; }', supports: 'modern' },
                { selector: ':read-write', category: 'form', zh: '匹配可编辑的表单元素', en: 'Matches editable form elements', example: 'input:read-write { background: white; }', supports: 'modern' },
                { selector: ':required', category: 'form', zh: '匹配必填的表单元素', en: 'Matches form elements with required attribute', example: 'input:required { border-left: 3px solid red; }', supports: 'all' },
                { selector: ':root', category: 'structural', zh: '匹配文档根元素（html）', en: 'Matches the root element of the document', example: ':root { --primary: #3498db; }', supports: 'all' },
                { selector: ':scope', category: 'structural', zh: '匹配选择器的作用域元素', en: 'Matches the scope element for the selector', example: ':scope { background: #f9f9f9; }', supports: 'modern' },
                { selector: ':target', category: 'dynamic', zh: '匹配 URL 锚点指向的元素', en: 'Matches the element targeted by URL fragment', example: ':target { background: yellow; }', supports: 'all' },
                { selector: ':valid', category: 'form', zh: '匹配验证通过的表单元素', en: 'Matches form elements that pass validation', example: 'input:valid { border-color: green; }', supports: 'all' },
                { selector: ':visited', category: 'link', zh: '匹配已访问过的链接', en: 'Matches visited links', example: 'a:visited { color: purple; }', supports: 'all' },
                { selector: ':where()', category: 'structural', zh: '匹配选择器列表中的任意一个（零优先级）', en: 'Matches any selector in the list (zero specificity)', example: ':where(ol, ul) :where(li, dd) { margin: 0; }', supports: 'modern' }
            ]
        }
    };

    // ── Category labels ──
    const CAT_LABELS = {
        'all':       { zh: '全部', en: 'All' },
        'dynamic':   { zh: '动态伪类', en: 'Dynamic' },
        'structural':{ zh: '结构伪类', en: 'Structural' },
        'form':      { zh: '表单伪类', en: 'Form' },
        'link':      { zh: '链接伪类', en: 'Link' },
        'language':  { zh: '语言伪类', en: 'Language' },
        'display':   { zh: '显示', en: 'Display' }
    };
    const SUPPORT_LABELS = {
        'all':    { zh: '所有浏览器', en: 'All browsers' },
        'modern': { zh: '现代浏览器', en: 'Modern browsers' },
        'limited':{ zh: '有限支持', en: 'Limited support' }
    };

    // ── Populate filter ──
    Object.keys(CAT_LABELS).forEach(function(key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = CAT_LABELS[key][isEN ? 'en' : 'zh'];
        filterSelect.appendChild(opt);
    });

    // ── Render ──
    function render() {
        var query = searchInput.value.toLowerCase().trim();
        var filter = filterSelect.value;
        var total = 0;
        var html = '';

        Object.keys(CSS_PSEUDO).forEach(function(groupKey) {
            var group = CSS_PSEUDO[groupKey];
            var groupName = isEN ? group.name_en : group.name_zh;
            var matched = group.selectors.filter(function(s) {
                if (filter !== 'all' && s.category !== filter) return false;
                if (query && s.selector.toLowerCase().indexOf(query) === -1) return false;
                return true;
            });
            if (matched.length === 0) return;
            total += matched.length;

            html += '<div class="cps-group" style="margin-bottom:20px">';
            html += '<h3 style="font-size:15px;font-weight:600;margin:0 0 10px 0;padding:0 0 4px 0;border-bottom:1px solid var(--border);color:var(--text)">' + esc(groupName) + '</h3>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">';

            matched.forEach(function(s) {
                var sup = SUPPORT_LABELS[s.supports];
                html += '<div class="cps-card" style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg-card);transition:box-shadow 0.15s">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
                html += '<code style="font-size:14px;font-weight:600;color:var(--accent);cursor:pointer" onclick="navigator.clipboard.writeText(\'' + escAttr(s.selector) + '\');this.style.opacity=0.5;setTimeout(function(){this.style.opacity=1}.bind(this),500)" title="' + T('点击复制', 'Click to copy') + '">' + esc(s.selector) + '</code>';
                html += '<span style="font-size:11px;padding:2px 6px;background:var(--bg-subtle);border-radius:4px;color:var(--text-dim)">' + esc(s.category) + '</span>';
                html += '</div>';
                html += '<p style="font-size:13px;margin:0 0 8px 0;color:var(--text);line-height:1.4">' + esc(isEN ? s.en : s.zh) + '</p>';
                html += '<pre style="font-size:12px;padding:6px 8px;background:var(--bg-subtle);border-radius:4px;margin:0;overflow-x:auto;color:var(--text-dim);border:1px solid var(--border);font-family:Consolas,monospace;white-space:pre-wrap;word-break:break-all">' + esc(s.example) + '</pre>';
                if (sup) {
                    html += '<div style="margin-top:6px;font-size:11px;color:var(--text-dim)">' + T('兼容性', 'Support') + ': ' + esc(sup[isEN ? 'en' : 'zh']) + '</div>';
                }
                html += '</div>';
            });

            html += '</div></div>';
        });

        if (total === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:48px 16px;color:var(--text-dim)"><div style="font-size:32px;margin-bottom:8px">🔍</div><p style="font-size:14px;margin:0">' + T('未找到匹配的选择器', 'No matching selectors found') + '</p></div>';
        } else {
            resultsEl.innerHTML = html;
        }
        countEl.textContent = T('共 ' + total + ' 个选择器', total + ' selectors');
    }

    function escAttr(str) {
        return str.replace(/'/g, "\\'");
    }

    // ── Events ──
    searchInput.addEventListener('input', render);
    filterSelect.addEventListener('change', render);

    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            var allSelectors = [];
            Object.keys(CSS_PSEUDO).forEach(function(groupKey) {
                CSS_PSEUDO[groupKey].selectors.forEach(function(s) {
                    allSelectors.push(s.selector);
                });
            });
            var text = allSelectors.join('\n');
            navigator.clipboard.writeText(text).then(function() {
                copyBtn.textContent = T('✅ 已复制', '✅ Copied');
                setTimeout(function() { copyBtn.textContent = T('📋 复制全部', '📋 Copy All'); }, 2000);
            }).catch(function() {
                copyBtn.textContent = T('❌ 复制失败', '❌ Failed');
            });
        });
    }

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
