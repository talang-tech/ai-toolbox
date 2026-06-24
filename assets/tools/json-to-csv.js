/**
 * JSON to CSV Converter — Convert JSON array to CSV format
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('j2c-input');
    const output = document.getElementById('j2c-output');
    const convertBtn = document.getElementById('j2c-convert-btn');
    const copyBtn = document.getElementById('j2c-copy-btn');
    const clearBtn = document.getElementById('j2c-clear-btn');
    const statusEl = document.getElementById('j2c-status');
    const formatSelect = document.getElementById('j2c-format');
    const delimiterSelect = document.getElementById('j2c-delimiter');
    const includeHeaders = document.getElementById('j2c-headers');

    if (!input || !output) return;

    function showStatus(type, msg) {
        if (!statusEl) return;
        statusEl.className = type;
        statusEl.textContent = msg;
        statusEl.style.display = 'block';
    }

    function escapeCsvValue(value, delimiter) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r');
        if (needsQuotes) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    function formatJson(value, indent) {
        if (value === null) return '';
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    function convert() {
        const jsonText = input.value.trim();
        if (!jsonText) {
            showStatus('error', 'Please enter JSON data / 请输入 JSON 数据');
            return;
        }

        let data;
        try {
            data = JSON.parse(jsonText);
        } catch (e) {
            showStatus('error', 'Invalid JSON: ' + e.message + ' / JSON 格式错误');
            return;
        }

        // Handle single object
        if (!Array.isArray(data)) {
            data = [data];
        }

        if (data.length === 0) {
            showStatus('error', 'JSON array is empty / JSON 数组为空');
            return;
        }

        const delimiter = delimiterSelect ? delimiterSelect.value : ',';
        const formatOption = formatSelect ? formatSelect.value : 'flat';
        const headersEnabled = includeHeaders ? includeHeaders.checked : true;

        // Collect all unique keys
        const keys = [];
        const keySet = new Set();
        for (const item of data) {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                for (const k of Object.keys(item)) {
                    if (!keySet.has(k)) {
                        keySet.add(k);
                        keys.push(k);
                    }
                }
            }
        }

        // For array-of-simple-values or mixed data, adapt
        const isSimpleArray = data.every(item => typeof item !== 'object' || item === null);
        if (isSimpleArray) {
            // Each value becomes a row with a single column
            if (headersEnabled) {
                output.value = escapeCsvValue('value', delimiter);
                for (const item of data) {
                    output.value += '\n' + escapeCsvValue(String(item), delimiter);
                }
            } else {
                output.value = data.map(item => escapeCsvValue(String(item), delimiter)).join('\n');
            }
            showStatus('success', `✅ Done / 完成 — ${data.length} rows, 1 column`);
            return;
        }

        // Array of objects
        let rows = [];

        if (formatOption === 'flat') {
            // Flat: each object key becomes a column
            if (headersEnabled) {
                rows.push(keys.map(k => escapeCsvValue(k, delimiter)));
            }
            for (const item of data) {
                if (typeof item !== 'object' || item === null) {
                    rows.push([escapeCsvValue(String(item), delimiter)]);
                    continue;
                }
                const row = keys.map(k => {
                    const val = k in item ? item[k] : '';
                    return escapeCsvValue(formatJson(val, ''), delimiter);
                });
                rows.push(row);
            }
        } else if (formatOption === 'nested') {
            // Nested: flatten dotted keys
            function flattenObj(obj, prefix) {
                let result = {};
                for (const [k, v] of Object.entries(obj)) {
                    const key = prefix ? prefix + '.' + k : k;
                    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
                        Object.assign(result, flattenObj(v, key));
                    } else {
                        result[key] = formatJson(v, '');
                    }
                }
                return result;
            }

            const flatObjects = data.map(item => flattenObj(item, ''));
            const allKeys = [];
            const allKeySet = new Set();
            for (const obj of flatObjects) {
                for (const k of Object.keys(obj)) {
                    if (!allKeySet.has(k)) {
                        allKeySet.add(k);
                        allKeys.push(k);
                    }
                }
            }

            if (headersEnabled) {
                rows.push(allKeys.map(k => escapeCsvValue(k, delimiter)));
            }
            for (const obj of flatObjects) {
                const row = allKeys.map(k => escapeCsvValue(k in obj ? obj[k] : '', delimiter));
                rows.push(row);
            }
        }

        output.value = rows.map(r => r.join(delimiter)).join('\n');
        showStatus('success', `✅ Done / 完成 — ${data.length} rows, ${rows.length > 1 ? (rows[headersEnabled ? 0 : 0].length) : 0} columns`);
    }

    function copyResult() {
        if (!output.value) {
            showStatus('error', 'Nothing to copy / 没有内容可复制');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus('success', '📋 Copied to clipboard! / 已复制到剪贴板！');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            showStatus('success', '📋 Copied! / 已复制！');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        statusEl.style.display = 'none';
        input.focus();
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    copyBtn.addEventListener('click', copyResult);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convert();
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
        }
    });

    console.log('✅ JSON to CSV Converter initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();