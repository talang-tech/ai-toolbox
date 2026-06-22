/**
 * CSS Minifier / Beautifier - Pure JS, zero dependencies
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('css-input');
    const output = document.getElementById('css-output');
    const modeRadios = document.querySelectorAll('input[name="css-mode"]');
    const actionBtn = document.getElementById('css-action-btn');
    const copyBtn = document.getElementById('css-copy-btn');
    const statsEl = document.getElementById('css-stats');

    if (!input || !output) return;

    function getMode() {
        for (const r of modeRadios) {
            if (r.checked) return r.value;
        }
        return 'beautify';
    }

    function showStats(before, after) {
        if (!statsEl) return;
        const saved = before.length - after.length;
        const ratio = before.length > 0 ? ((1 - after.length / before.length) * 100).toFixed(1) : 0;
        const beforeBytes = new Blob([before]).size;
        const afterBytes = new Blob([after]).size;
        statsEl.innerHTML = `
            <span>原大小: ${formatBytes(beforeBytes)} (${before.length} 字符)</span>
            <span>| 结果大小: ${formatBytes(afterBytes)} (${after.length} 字符)</span>
            <span>| 减少: ${saved > 0 ? '-' : '+'}${formatBytes(Math.abs(saved))} (${ratio}%)</span>
        `;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function beautifyCSS(css) {
        // Remove comments
        let cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');
        // Normalize whitespace
        cleaned = cleaned.replace(/\r\n?/g, '\n');
        cleaned = cleaned.replace(/[ \t]+/g, ' ');
        cleaned = cleaned.replace(/\n+/g, '\n');
        cleaned = cleaned.replace(/ ?\n ?/g, '\n');
        cleaned = cleaned.replace(/\{/g, ' {\n');
        cleaned = cleaned.replace(/\}/g, '\n}\n\n');
        cleaned = cleaned.replace(/;/g, ';\n');
        cleaned = cleaned.replace(/,[\s]*\n/g, ',\n');
        cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Indent
        let depth = 0;
        const lines = cleaned.split('\n');
        const result = [];
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('}')) {
                depth = Math.max(0, depth - 1);
            }

            const indent = '  '.repeat(depth);
            result.push(indent + trimmed);

            if (trimmed.endsWith('{') && !trimmed.endsWith('{{')) {
                depth++;
            }
            const openCount = (trimmed.match(/\{/g) || []).length;
            const closeCount = (trimmed.match(/\}/g) || []).length;
            depth += openCount - closeCount;
            if (depth < 0) depth = 0;

            // Handle CSS @media nested
            if (trimmed.startsWith('@') && trimmed.includes('{')) {
                depth++;
            }
        }

        return result.join('\n') + '\n';
    }

    function minifyCSS(css) {
        // Remove comments
        let result = css.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove whitespace around special chars
        result = result.replace(/\s*([{}:;,])\s*/g, '$1');
        // Replace multiple whitespace with single space
        result = result.replace(/\s+/g, ' ');
        // Remove leading/trailing whitespace
        result = result.trim();
        // Remove last semicolon before closing brace
        result = result.replace(/;}/g, '}');
        // Remove unnecessary spaces in selectors (keep between compound selectors)
        // Space between selectors within comma-separated lists
        result = result.replace(/, /g, ',');
        // Remove space before !important
        result = result.replace(/ !important/g, '!important');
        // Normalize zero values
        result = result.replace(/([: ])0(\.0+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|in|pt|pc|%|ex|ch)/g, '$10');
        // Remove leading zeros
        result = result.replace(/([: ])-?0*\.(\d+)/g, '$1.$2');
        // Lowercase hex colors where possible (keep short if possible)
        result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
        result = result.replace(/#([0-9a-fA-F]{6})\b/g, (m, h) => {
            if (/^([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.test(h)) {
                return '#' + h[0] + h[2] + h[4];
            }
            return '#' + h.toLowerCase();
        });
        return result;
    }

    function process() {
        const mode = getMode();
        const raw = input.value;
        if (!raw.trim()) {
            output.value = '';
            if (statsEl) statsEl.innerHTML = '';
            return;
        }

        try {
            const result = mode === 'minify' ? minifyCSS(raw) : beautifyCSS(raw);
            output.value = result;
            showStats(raw, result);
        } catch (e) {
            output.value = '错误: ' + e.message;
            if (statsEl) statsEl.innerHTML = '<span style="color:var(--error)">处理出错</span>';
        }
    }

    // Debounced auto-process on input change
    let debounceTimer = null;
    function onInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(process, 300);
    }

    input.addEventListener('input', onInput);
    input.addEventListener('paste', () => setTimeout(onInput, 50));
    if (actionBtn) actionBtn.addEventListener('click', process);
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!output.value) return;
            try {
                await navigator.clipboard.writeText(output.value);
                const orig = copyBtn.textContent;
                copyBtn.textContent = '✅ 已复制';
                setTimeout(() => { copyBtn.textContent = orig; }, 1500);
            } catch (e) {
                output.select();
                document.execCommand('copy');
            }
        });
    }

    // Re-process on mode change
    for (const r of modeRadios) {
        r.addEventListener('change', process);
    }

    // Initial process (sample CSS)
    process();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();