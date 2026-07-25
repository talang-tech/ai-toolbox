/**
 * JSON Lines (NDJSON) Tools - Validate, format, convert, analyze, filter
 * Pure JS, zero dependencies, runs entirely in browser.
 * Handles JSON Lines / NDJSON / JSONL format.
 */
(function() {
'use strict';

function init() {
    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    const inputEl = document.getElementById('jl-input');
    const outputEl = document.getElementById('jl-output');
    const statusEl = document.getElementById('jl-status');
    const statsEl = document.getElementById('jl-stats');
    const convertBtn = document.getElementById('jl-convert');
    const copyBtn = document.getElementById('jl-copy');
    const clearBtn = document.getElementById('jl-clear');
    const modeSelect = document.getElementById('jl-mode');
    const filterField = document.getElementById('jl-filter-field');
    const filterValue = document.getElementById('jl-filter-value');
    const extractFields = document.getElementById('jl-extract-fields');
    const indentSelect = document.getElementById('jl-indent');

    if (!inputEl || !outputEl || !modeSelect) return;

    function parseJSONLines(text) {
        const lines = text.split('\n');
        const results = [];
        const errors = [];
        lines.forEach((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            try {
                results.push({ line: i + 1, data: JSON.parse(trimmed) });
            } catch (e) {
                errors.push({ line: i + 1, error: e.message, text: trimmed });
            }
        });
        return { results, errors, totalLines: lines.length };
    }

    function getFieldValue(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') return undefined;
            current = current[part];
        }
        return current;
    }

    function getAllFields(objects) {
        const fields = new Set();
        objects.forEach(obj => {
            function walk(o, prefix) {
                if (o === null || o === undefined) return;
                if (typeof o !== 'object' || Array.isArray(o)) {
                    fields.add(prefix);
                    return;
                }
                for (const key of Object.keys(o)) {
                    const path = prefix ? `${prefix}.${key}` : key;
                    const val = o[key];
                    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                        walk(val, path);
                    } else {
                        fields.add(path);
                    }
                }
            }
            walk(obj, '');
        });
        return Array.from(fields).sort();
    }

    function getFieldTypes(field, objects) {
        const types = new Set();
        objects.forEach(obj => {
            const val = getFieldValue(obj, field);
            if (val === undefined) types.add('undefined');
            else if (val === null) types.add('null');
            else if (Array.isArray(val)) types.add('array');
            else types.add(typeof val);
        });
        return Array.from(types);
    }

    function getMode() { return modeSelect.value; }

    function process() {
        const input = inputEl.value;
        if (!input.trim()) {
            outputEl.value = '';
            statusEl.textContent = T('请粘贴 JSON Lines 数据', 'Paste JSON Lines data to begin');
            statsEl.textContent = '';
            return;
        }

        const parsed = parseJSONLines(input);
        const mode = getMode();
        const indent = parseInt(indentSelect.value) || 2;

        let output = '';
        let status = '';
        let stats = '';

        const validCount = parsed.results.length;
        const errorCount = parsed.errors.length;
        const emptyLines = parsed.totalLines - validCount - errorCount;

        if (parsed.errors.length > 0) {
            const errDetail = parsed.errors.slice(0, 5).map(e => 
                T(`第 ${e.line} 行: ${e.error}`, `Line ${e.line}: ${e.error}`)
            ).join('\n');
            status = T(
                `⚠️ 发现 ${errorCount} 个错误` + (errorCount > 5 ? `（显示前5个）` : ''),
                `⚠️ Found ${errorCount} error(s)` + (errorCount > 5 ? ` (showing first 5)` : '')
            ) + '\n' + errDetail;
        }

        stats = T(
            `📊 总行数: ${parsed.totalLines} | 有效: ${validCount} | 错误: ${errorCount} | 空行: ${emptyLines}`,
            `📊 Lines: ${parsed.totalLines} | Valid: ${validCount} | Errors: ${errorCount} | Empty: ${emptyLines}`
        );

        if (validCount === 0) {
            outputEl.value = '';
            statusEl.textContent = status || T('没有有效的 JSON Lines 数据', 'No valid JSON Lines data');
            statsEl.textContent = stats;
            return;
        }

        const validObjects = parsed.results.map(r => r.data);

        switch (mode) {
            case 'validate': {
                // Just validation - show summary
                output = T(
                    `✅ 所有行验证通过${errorCount > 0 ? '（部分行有错误）' : ''}`,
                    `✅ All lines valid${errorCount > 0 ? ' (some lines have errors)' : ''}`
                );
                if (parsed.errors.length > 0) {
                    output += '\n\n' + T('错误行:', 'Error lines:') + '\n';
                    parsed.errors.forEach(e => {
                        output += `${T('行', 'Line')} ${e.line}: ${e.error}\n  > ${e.text.slice(0, 100)}\n`;
                    });
                }
                break;
            }
            case 'format': {
                output = validObjects.map(obj => JSON.stringify(obj, null, indent)).join('\n');
                break;
            }
            case 'to-array': {
                output = JSON.stringify(validObjects, null, indent);
                break;
            }
            case 'from-array': {
                // JSON array input to JSON Lines
                try {
                    const arr = JSON.parse(input.trim());
                    if (!Array.isArray(arr)) {
                        output = T('错误：输入必须是 JSON 数组', 'Error: Input must be a JSON array');
                        break;
                    }
                    output = arr.map(item => JSON.stringify(item)).join('\n');
                } catch (e) {
                    output = T('错误：无效的 JSON 数组格式', 'Error: Invalid JSON array format');
                }
                break;
            }
            case 'stats': {
                const fields = getAllFields(validObjects);
                let lines = [];
                lines.push(T('=== 字段统计 ===', '=== Field Statistics ==='));
                lines.push(T(`总行数: ${validCount}`, `Total records: ${validCount}`));
                lines.push(T(`字段数: ${fields.length}`, `Total fields: ${fields.length}`));
                lines.push('');

                const header = T('字段名', 'Field').padEnd(30) + T('出现次数', 'Count').padEnd(12) + T('类型', 'Types');
                lines.push(header);
                lines.push('-'.repeat(60));
                fields.forEach(field => {
                    const count = validObjects.filter(o => getFieldValue(o, field) !== undefined).length;
                    const types = getFieldTypes(field, validObjects).join(', ');
                    lines.push(field.padEnd(30) + String(count).padEnd(12) + types);
                });
                output = lines.join('\n');
                break;
            }
            case 'filter': {
                const field = filterField.value.trim();
                const val = filterValue.value.trim();
                if (!field) {
                    status = T('请输入过滤字段名', 'Please enter a field name to filter');
                    outputEl.value = '';
                    break;
                }
                const filtered = validObjects.filter(obj => {
                    const v = getFieldValue(obj, field);
                    if (!val) return v !== undefined;
                    const strV = v === null ? 'null' : String(v);
                    return strV.toLowerCase().includes(val.toLowerCase());
                });
                if (filtered.length === 0) {
                    output = T('没有匹配的记录', 'No matching records');
                } else {
                    output = filtered.map(obj => JSON.stringify(obj, null, indent)).join('\n');
                }
                stats = T(
                    `过滤: ${filtered.length}/${validCount} 条记录`,
                    `Filtered: ${filtered.length}/${validCount} records`
                );
                break;
            }
            case 'extract': {
                const fields = extractFields.value.trim();
                if (!fields) {
                    status = T('请输入要提取的字段名（逗号分隔）', 'Enter field names to extract (comma-separated)');
                    outputEl.value = '';
                    break;
                }
                const fieldList = fields.split(',').map(f => f.trim()).filter(Boolean);
                const extracted = validObjects.map(obj => {
                    const result = {};
                    fieldList.forEach(field => {
                        result[field] = getFieldValue(obj, field);
                    });
                    return result;
                });
                output = extracted.map(obj => JSON.stringify(obj, null, indent)).join('\n');
                stats = T(
                    `提取了 ${fieldList.length} 个字段，${extracted.length} 条记录`,
                    `Extracted ${fieldList.length} fields, ${extracted.length} records`
                );
                break;
            }
        }

        outputEl.value = output;
        statusEl.textContent = status || T('处理完成 ✅', 'Done ✅');
        statsEl.textContent = stats;
    }

    function autoDetectMode() {
        const input = inputEl.value.trim();
        if (!input) return;
        // If input starts with [, it might be a JSON array
        if (input.startsWith('[')) {
            const prevMode = modeSelect.value;
            if (prevMode !== 'from-array') {
                // Don't auto-switch, but suggest
                const msg = T('提示：检测到 JSON 数组格式，可切换到 "JSON 数组转 Lines" 模式', 'Tip: JSON array detected, try "Array to Lines" mode');
                statusEl.textContent = msg;
            }
        }
    }

    // Event listeners
    convertBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', () => {
        if (outputEl.value) {
            navigator.clipboard.writeText(outputEl.value).then(() => {
                const orig = copyBtn.textContent;
                copyBtn.textContent = T('✅ 已复制', '✅ Copied!');
                setTimeout(() => { copyBtn.textContent = orig; }, 2000);
            }).catch(() => {
                // Fallback
                outputEl.select();
                document.execCommand('copy');
            });
        }
    });
    clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        statusEl.textContent = T('就绪 ✓', 'Ready ✓');
        statsEl.textContent = '';
    });

    // Auto-process on input with debounce
    let debounceTimer;
    inputEl.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            autoDetectMode();
            process();
        }, 500);
    });

    modeSelect.addEventListener('change', () => {
        // Show/hide filter/extract fields
        const filterSection = document.getElementById('jl-filter-section');
        const extractSection = document.getElementById('jl-extract-section');
        const indentSection = document.getElementById('jl-indent-section');
        if (filterSection) filterSection.style.display = modeSelect.value === 'filter' ? 'flex' : 'none';
        if (extractSection) extractSection.style.display = modeSelect.value === 'extract' ? 'flex' : 'none';
        if (indentSection) indentSection.style.display = ['format', 'to-array', 'extract', 'filter'].includes(modeSelect.value) ? 'flex' : 'none';
        process();
    });

    filterField.addEventListener('input', process);
    filterValue.addEventListener('input', process);
    extractFields.addEventListener('input', process);
    indentSelect.addEventListener('change', process);

    // Initial state
    statusEl.textContent = T('就绪 ✓', 'Ready ✓');
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();