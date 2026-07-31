/**
 * TOML to JSON / JSON to TOML Converter
 * Bidirectional TOML and JSON conversion
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('tjc-input');
    const output = document.getElementById('tjc-output');
    const convertBtn = document.getElementById('tjc-convert');
    const swapBtn = document.getElementById('tjc-swap');
    const copyBtn = document.getElementById('tjc-copy');
    const clearBtn = document.getElementById('tjc-clear');
    const directionSelect = document.getElementById('tjc-direction');
    const statsEl = document.getElementById('tjc-stats');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !convertBtn) return;

    const T = (zh, en) => isEN ? en : zh;

    const labels = {
        ready: T('输入 TOML 或 JSON 数据，点击转换', 'Enter TOML or JSON data, click Convert'),
        empty: T('请输入数据', 'Please enter data'),
        tomlErr: T('TOML 格式错误：', 'TOML parse error: '),
        jsonErr: T('JSON 格式错误：', 'JSON parse error: '),
        invalid: T('无法识别的格式', 'Unrecognized format'),
        copied: T('已复制！', 'Copied!'),
        copyFail: T('复制失败', 'Copy failed'),
        success: T('转换成功', 'Conversion successful'),
        charCount: (n) => T(`${n} 字符`, `${n} characters`),
    };

    if (statsEl) statsEl.textContent = labels.ready;

    // Simple TOML parser (handles common cases)
    function parseTOML(text) {
        const lines = text.split('\n');
        const result = {};
        let currentTable = result;
        let currentPath = [];

        function setValue(obj, path, value) {
            let current = obj;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            const key = path[path.length - 1];
            if (current[key] !== undefined) {
                if (!Array.isArray(current[key])) current[key] = [current[key]];
                current[key].push(value);
            } else {
                current[key] = value;
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#') || line.startsWith('//')) continue;

            // Table header: [table] or [table.subtable]
            const tableMatch = line.match(/^\[(.+?)\]$/);
            if (tableMatch) {
                currentPath = tableMatch[1].split('.').map(p => p.trim());
                // Navigate/create the path
                currentTable = result;
                for (const p of currentPath) {
                    if (!currentTable[p] || typeof currentTable[p] !== 'object') currentTable[p] = {};
                    currentTable = currentTable[p];
                }
                continue;
            }

            // Array of tables: [[array]]
            const arrayTableMatch = line.match(/^\[\[(.+?)\]\]$/);
            if (arrayTableMatch) {
                currentPath = arrayTableMatch[1].split('.').map(p => p.trim());
                currentTable = result;
                for (let j = 0; j < currentPath.length - 1; j++) {
                    const p = currentPath[j];
                    if (!currentTable[p] || typeof currentTable[p] !== 'object') currentTable[p] = {};
                    currentTable = currentTable[p];
                }
                const lastKey = currentPath[currentPath.length - 1];
                if (!currentTable[lastKey]) currentTable[lastKey] = [];
                const newObj = {};
                currentTable[lastKey].push(newObj);
                currentTable = newObj;
                continue;
            }

            // Key-value pair: key = value
            const kvMatch = line.match(/^([a-zA-Z0-9_.\-]+)\s*=\s*(.*)$/);
            if (kvMatch) {
                const key = kvMatch[1].trim();
                let value = kvMatch[2].trim();

                // Parse value
                let parsedValue;
                if (value === 'true') parsedValue = true;
                else if (value === 'false') parsedValue = false;
                else if (/^\d+$/.test(value)) parsedValue = parseInt(value, 10);
                else if (/^\d+\.\d+$/.test(value)) parsedValue = parseFloat(value);
                else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    parsedValue = value.slice(1, -1);
                } else if (value.startsWith('[') && value.endsWith(']')) {
                    // Inline array
                    try {
                        const inner = value.slice(1, -1);
                        parsedValue = inner.split(',').map(item => {
                            item = item.trim();
                            if (item === 'true') return true;
                            if (item === 'false') return false;
                            if (/^\d+$/.test(item)) return parseInt(item, 10);
                            if (/^\d+\.\d+$/.test(item)) return parseFloat(item);
                            if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'")))
                                return item.slice(1, -1);
                            return item;
                        });
                    } catch(e) {
                        parsedValue = value;
                    }
                } else {
                    parsedValue = value;
                }

                const path = [...currentPath, key];
                setValue(result, path, parsedValue);
            }
        }
        return result;
    }

    function stringifyTOML(obj, prefix) {
        let result = '';
        prefix = prefix || '';

        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) continue;

            const fullKey = prefix ? prefix + '.' + key : key;

            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0])) {
                    // Array of tables
                    for (const item of value) {
                        result += '\n[[' + fullKey + ']]\n';
                        result += stringifyTOML(item, '');
                    }
                } else {
                    // Regular array
                    const items = value.map(v => tomlValue(v));
                    result += key + ' = [' + items.join(', ') + ']\n';
                }
            } else if (typeof value === 'object') {
                result += '\n[' + fullKey + ']\n';
                result += stringifyTOML(value, '');
            } else {
                result += key + ' = ' + tomlValue(value) + '\n';
            }
        }
        return result;
    }

    function tomlValue(value) {
        if (typeof value === 'string') return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'number') return String(value);
        return String(value);
    }

    function convert() {
        const text = input.value.trim();
        if (!text) {
            if (statsEl) statsEl.textContent = labels.empty;
            output.value = '';
            return;
        }

        const direction = directionSelect.value;

        try {
            if (direction === 'toml-to-json') {
                // TOML to JSON
                const parsed = parseTOML(text);
                output.value = JSON.stringify(parsed, null, 2);
            } else {
                // JSON to TOML
                const parsed = JSON.parse(text);
                output.value = stringifyTOML(parsed, '').trim();
            }
            if (statsEl) statsEl.textContent = labels.success + ' | ' + labels.charCount(output.value.length);
        } catch (e) {
            if (direction === 'toml-to-json') {
                if (statsEl) statsEl.textContent = labels.tomlErr + e.message;
            } else {
                if (statsEl) statsEl.textContent = labels.jsonErr + e.message;
            }
            output.value = '';
        }
    }

    function swap() {
        if (output.value && output.value.trim()) {
            input.value = output.value;
            output.value = '';
            const dir = directionSelect.value;
            directionSelect.value = dir === 'toml-to-json' ? 'json-to-toml' : 'toml-to-json';
            if (statsEl) statsEl.textContent = labels.ready;
        }
    }

    function copyResult() {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(() => {
            if (statsEl) statsEl.textContent = labels.copied;
        }).catch(() => {
            if (statsEl) statsEl.textContent = labels.copyFail;
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.textContent = labels.ready;
    }

    convertBtn.addEventListener('click', convert);
    if (swapBtn) swapBtn.addEventListener('click', swap);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) convert();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();