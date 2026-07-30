/**
 * Markdown Table to JSON Converter
 * Parse Markdown tables and convert to JSON array of objects
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('mtj-input');
    const output = document.getElementById('mtj-output');
    const convertBtn = document.getElementById('mtj-convert-btn');
    const copyBtn = document.getElementById('mtj-copy-btn');
    const clearBtn = document.getElementById('mtj-clear-btn');
    const formatSelect = document.getElementById('mtj-format');
    const statsEl = document.getElementById('mtj-stats');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !convertBtn) return;

    const T = (zh, en) => isEN ? en : zh;

    const labels = {
        ready: T('就绪，输入 Markdown 表格后点击转换', 'Ready. Paste a Markdown table and click Convert'),
        empty: T('请先输入 Markdown 表格数据', 'Please enter Markdown table data first'),
        noTable: T('未找到有效的 Markdown 表格。格式应为：\n| 列1 | 列2 |\n| --- | --- |\n| 值1 | 值2 |', 'No valid Markdown table found. Expected format:\n| Col1 | Col2 |\n| --- | --- |\n| Val1 | Val2 |'),
        parsed: (rows, cols) => T(`解析完成：${rows} 行 × ${cols} 列`, `Parsed: ${rows} rows × ${cols} columns`),
        copied: T('已复制！', 'Copied!'),
        copyFail: T('复制失败', 'Copy failed'),
        firstRowHeader: T('第一行作为表头', 'First row as header'),
        allRows: T('所有行作为数据', 'All rows as data'),
    };

    if (statsEl) statsEl.textContent = labels.ready;

    function parseMarkdownTable(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        // Find the table: look for lines starting with |
        const tableLines = [];
        let inTable = false;
        for (const line of lines) {
            if (line.startsWith('|') || line.endsWith('|')) {
                // Check if it's a separator line (contains only ---, :---, etc.)
                if (/^\|[\s\-:|]+\|$/.test(line) || /^\|[\s\-:|]+\|$/.test(line)) {
                    continue; // skip separator line
                }
                tableLines.push(line);
                inTable = true;
            } else if (inTable) {
                break; // table ended
            }
        }

        if (tableLines.length === 0) return null;

        // Parse each row
        const rows = tableLines.map(line => {
            // Remove leading/trailing pipe
            let content = line.trim();
            if (content.startsWith('|')) content = content.slice(1);
            if (content.endsWith('|')) content = content.slice(0, -1);
            // Split by pipe, trim each cell
            return content.split('|').map(cell => cell.trim());
        });

        return rows;
    }

    function convert() {
        const raw = input.value.trim();
        if (!raw) {
            if (statsEl) { statsEl.textContent = labels.empty; statsEl.className = 'error-message'; }
            output.value = '';
            return;
        }

        const rows = parseMarkdownTable(raw);
        if (!rows || rows.length === 0) {
            if (statsEl) { statsEl.textContent = labels.noTable; statsEl.className = 'error-message'; }
            output.value = '';
            return;
        }

        const format = formatSelect ? formatSelect.value : 'objects';
        const firstRowHeader = format === 'objects';

        let result;

        if (firstRowHeader && rows.length >= 2) {
            // Use first row as header
            const headers = rows[0].map(h => h.replace(/[^a-zA-Z0-9_$_\u4e00-\u9fff]/g, '_').replace(/^(\d)/, '_$1') || 'col');
            const dataRows = rows.slice(1);
            result = dataRows.map(row => {
                const obj = {};
                headers.forEach((h, i) => {
                    obj[h] = i < row.length ? row[i] : '';
                });
                return obj;
            });
        } else {
            // All rows as arrays
            result = rows.map(row => row);
        }

        const json = JSON.stringify(result, null, 2);
        output.value = json;

        if (statsEl) {
            statsEl.textContent = labels.parsed(rows.length, rows[0].length);
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

    convertBtn.addEventListener('click', convert);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);

    // Auto-convert on input change (debounced)
    let debounceTimer;
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 500);
    });

    if (formatSelect) formatSelect.addEventListener('change', convert);
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();