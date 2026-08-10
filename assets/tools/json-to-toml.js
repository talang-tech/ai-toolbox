/**
 * JSON to TOML Converter - Convert JSON objects to TOML format
 * Pure JS, zero dependencies, runs entirely in browser.
 * Supports TOML v1.0 output spec.
 */
(function() {
    'use strict';

    const input = document.getElementById('jtt-input');
    const output = document.getElementById('jtt-output');
    const convertBtn = document.getElementById('jtt-convert');
    const copyBtn = document.getElementById('jtt-copy');
    const clearBtn = document.getElementById('jtt-clear');
    const statusEl = document.getElementById('jtt-status');

    if (!input || !output || !convertBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

    function tomlEscapeString(s) {
        if (typeof s !== 'string') return s;
        // Multiline strings
        if (s.includes('\n') || s.length > 80) {
            return '"""\n' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '\n"""';
        }
        // Basic string
        let escaped = s.replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\t/g, '\\t')
            .replace(/\r/g, '\\r');
        return '"' + escaped + '"';
    }

    function tomlValue(val, indent) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') {
            if (Number.isInteger(val)) return String(val);
            return String(val);
        }
        if (typeof val === 'string') return tomlEscapeString(val);
        if (Array.isArray(val)) {
            if (val.length === 0) return '[]';
            // Check if it's an array of objects
            const isObjArray = val.every(v => v !== null && typeof v === 'object' && !Array.isArray(v));
            if (isObjArray) return null; // table arrays handled separately
            // Inline array
            const items = val.map(v => {
                if (typeof v === 'string') return tomlEscapeString(v);
                if (v === null) return '';
                return String(v);
            });
            return '[' + items.join(', ') + ']';
        }
        if (typeof val === 'object') return null; // inline tables handled separately
        return String(val);
    }

    function jsonToToml(obj, rootKey) {
        const lines = [];
        const tableArrays = [];

        function addLine(key, val, prefix) {
            const p = prefix || '';
            lines.push(p + key + ' = ' + val);
        }

        function process(obj, prefix) {
            const keys = Object.keys(obj);
            const simpleKeys = [];
            const tableKeys = [];
            const arrayTableKeys = [];

            for (const key of keys) {
                const val = obj[key];
                if (val === null || val === undefined) {
                    simpleKeys.push(key);
                } else if (Array.isArray(val)) {
                    if (val.length > 0 && val.every(v => v !== null && typeof v === 'object' && !Array.isArray(v))) {
                        arrayTableKeys.push(key);
                    } else {
                        simpleKeys.push(key);
                    }
                } else if (typeof val === 'object') {
                    tableKeys.push(key);
                } else {
                    simpleKeys.push(key);
                }
            }

            // Simple keys
            for (const key of simpleKeys) {
                const val = obj[key];
                const tomlStr = tomlValue(val, prefix);
                if (tomlStr !== null) {
                    addLine(key, tomlStr, prefix);
                }
            }

            // Nested tables
            for (const key of tableKeys) {
                const val = obj[key];
                if (Object.keys(val).length === 0) {
                    addLine(key, '{}', prefix);
                    continue;
                }
                const newPrefix = prefix ? prefix + '.' + key : key;
                lines.push('');
                lines.push('[' + newPrefix + ']');
                process(val, newPrefix);
            }

            // Table arrays
            for (const key of arrayTableKeys) {
                const arr = obj[key];
                const newPrefix = prefix ? prefix + '.' + key : key;
                for (const item of arr) {
                    if (Object.keys(item).length === 0) {
                        lines.push('');
                        lines.push('[[' + newPrefix + ']]');
                        continue;
                    }
                    lines.push('');
                    lines.push('[[' + newPrefix + ']]');
                    process(item, newPrefix);
                }
            }
        }

        process(obj, rootKey || '');
        return lines.join('\n');
    }

    function convert() {
        const text = input.value.trim();
        if (!text) {
            statusEl.textContent = T('请输入 JSON 数据', 'Please enter JSON data');
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            output.value = '';
            statusEl.textContent = T('JSON 解析错误: ' + e.message, 'JSON parse error: ' + e.message);
            return;
        }

        if (parsed === null || typeof parsed !== 'object') {
            statusEl.textContent = T('请输入一个 JSON 对象（不支持顶层标量/数组）', 'Please enter a JSON object (top-level scalar/array not supported)');
            return;
        }

        if (Array.isArray(parsed)) {
            statusEl.textContent = T('请输入一个 JSON 对象（不支持顶层数组）', 'Please enter a JSON object (top-level array not supported)');
            return;
        }

        try {
            const result = jsonToToml(parsed, '');
            output.value = result.trim();
            const lineCount = result.trim().split('\n').length;
            statusEl.textContent = T(
                `转换成功，共 ${lineCount} 行`,
                `Converted successfully, ${lineCount} lines`
            );
        } catch (e) {
            output.value = '';
            statusEl.textContent = T('转换错误: ' + e.message, 'Conversion error: ' + e.message);
        }
    }

    function copyResult() {
        if (!output.value) {
            statusEl.textContent = T('没有可复制的内容', 'Nothing to copy');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            statusEl.textContent = T('已复制到剪贴板', 'Copied to clipboard');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            statusEl.textContent = T('已复制到剪贴板', 'Copied to clipboard');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        statusEl.textContent = '';
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);
})();