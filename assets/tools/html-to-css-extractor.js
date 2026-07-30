/**
 * HTML to CSS Extractor - Extract CSS classes, IDs, and selectors from HTML
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('h2c-input');
    const output = document.getElementById('h2c-output');
    const extractBtn = document.getElementById('h2c-extract-btn');
    const copyBtn = document.getElementById('h2c-copy-btn');
    const clearBtn = document.getElementById('h2c-clear-btn');
    const statsEl = document.getElementById('h2c-stats');
    const modeRadios = document.querySelectorAll('input[name="h2c-mode"]');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !extractBtn) return;

    const T = (zh, en) => isEN ? en : zh;

    const labels = {
        ready: T('粘贴 HTML 代码，然后点击提取', 'Paste HTML code, then click Extract'),
        empty: T('请输入 HTML 代码', 'Please enter HTML code'),
        noResults: T('未找到任何 CSS 类、ID 或选择器', 'No CSS classes, IDs, or selectors found'),
        copied: T('已复制！', 'Copied!'),
        copyFail: T('复制失败', 'Copy failed'),
        result: (classes, ids, tags, total) => T(`找到 ${classes} 个类、${ids} 个 ID、${tags} 个标签，共 ${total} 个选择器`, `Found ${classes} classes, ${ids} IDs, ${tags} tags, ${total} total selectors`),
        modeClasses: T('CSS 类名', 'CSS Classes'),
        modeIds: T('ID 选择器', 'ID Selectors'),
        modeTags: T('HTML 标签', 'HTML Tags'),
        modeAll: T('所有选择器', 'All Selectors'),
    };

    if (statsEl) statsEl.textContent = labels.ready;

    function getMode() {
        for (const r of modeRadios) { if (r.checked) return r.value; }
        return 'all';
    }

    function extractClasses(html) {
        // Match class="..." or class='...'
        const classRegex = /class\s*=\s*["']([^"']*?)["']/gi;
        const classes = new Set();
        let match;
        while ((match = classRegex.exec(html)) !== null) {
            match[1].split(/\s+/).forEach(cls => {
                if (cls.trim()) classes.add(cls.trim());
            });
        }
        return [...classes].sort();
    }

    function extractIds(html) {
        const idRegex = /id\s*=\s*["']([^"']*?)["']/gi;
        const ids = new Set();
        let match;
        while ((match = idRegex.exec(html)) !== null) {
            if (match[1].trim()) ids.add(match[1].trim());
        }
        return [...ids].sort();
    }

    function extractTags(html) {
        // Extract HTML tags (excluding comments, doctype, etc.)
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
        const tags = new Set();
        let match;
        while ((match = tagRegex.exec(html)) !== null) {
            if (match[1].toLowerCase() !== '!doctype' && match[1] !== '!--') {
                tags.add(match[1].toLowerCase());
            }
        }
        return [...tags].sort();
    }

    function extract() {
        const raw = input.value.trim();
        if (!raw) {
            if (statsEl) { statsEl.textContent = labels.empty; statsEl.className = 'error-message'; }
            output.value = '';
            return;
        }

        const mode = getMode();
        let result = [];
        let classes = [], ids = [], tags = [];

        if (mode === 'classes' || mode === 'all') {
            classes = extractClasses(raw);
        }
        if (mode === 'ids' || mode === 'all') {
            ids = extractIds(raw);
        }
        if (mode === 'tags' || mode === 'all') {
            tags = extractTags(raw);
        }

        // Build output
        const lines = [];

        if (mode === 'classes' || mode === 'all') {
            if (classes.length > 0) {
                lines.push(isEN ? 'CSS Classes Found:' : '找到的 CSS 类名：');
                classes.forEach(c => lines.push(`  .${c}`));
                lines.push('');
            }
        }

        if (mode === 'ids' || mode === 'all') {
            if (ids.length > 0) {
                lines.push(isEN ? 'ID Selectors Found:' : '找到的 ID 选择器：');
                ids.forEach(id => lines.push(`  #${id}`));
                lines.push('');
            }
        }

        if (mode === 'tags' || mode === 'all') {
            if (tags.length > 0) {
                lines.push(isEN ? 'HTML Tags Found:' : '找到的 HTML 标签：');
                tags.forEach(t => lines.push(`  ${t}`));
                lines.push('');
            }
        }

        // Summary
        if (mode === 'all') {
            lines.push(isEN ? `--- Summary: ${classes.length} classes, ${ids.length} IDs, ${tags.length} tags ---` : `--- 摘要：${classes.length} 个类、${ids.length} 个 ID、${tags.length} 个标签 ---`);
        }

        // CSS skeleton for found classes/ids
        if (mode === 'all' && (classes.length > 0 || ids.length > 0)) {
            lines.push('');
            lines.push(isEN ? 'CSS Skeleton:' : 'CSS 骨架：');
            if (classes.length > 0) {
                classes.forEach(c => lines.push(`.${c} {\n  \n}`));
            }
            if (ids.length > 0) {
                ids.forEach(id => lines.push(`#${id} {\n  \n}`));
            }
        }

        const total = classes.length + ids.length + tags.length;
        const resultText = lines.join('\n');

        if (!resultText.trim()) {
            if (statsEl) { statsEl.textContent = labels.noResults; statsEl.className = 'error-message'; }
            output.value = '';
            return;
        }

        output.value = resultText;

        if (statsEl) {
            statsEl.textContent = labels.result(classes.length, ids.length, tags.length, total);
            statsEl.className = 'success-message';
        }
    }

    function copyResult() {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(() => {
            if (statsEl) { statsEl.textContent = labels.copied; statsEl.className = 'success-message'; }
        }).catch(() => {
            if (statsEl) { statsEl.textContent = labels.copyFail; statsEl.className = 'error-message'; }
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        if (statsEl) { statsEl.textContent = labels.ready; statsEl.className = ''; }
    }

    extractBtn.addEventListener('click', extract);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);

    modeRadios.forEach(r => r.addEventListener('change', () => {
        if (input.value.trim()) extract();
    }));

    // Auto-extract on input change (debounced)
    let debounceTimer;
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(extract, 600);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();