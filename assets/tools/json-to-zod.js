/**
 * JSON to Zod - Generate Zod validation schemas from JSON data
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('j2z-input');
    const output = document.getElementById('j2z-output');
    const generateBtn = document.getElementById('j2z-generate');
    const copyBtn = document.getElementById('j2z-copy');
    const clearBtn = document.getElementById('j2z-clear');
    const statusEl = document.getElementById('j2z-status');
    const optCheck = document.getElementById('j2z-optional');
    const strictCheck = document.getElementById('j2z-strict');
    const enumCheck = document.getElementById('j2z-enum');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !generateBtn) return;

    // String helpers
    function escapeStr(s) {
        return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    }

    function toPascalCase(str) {
        return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, c => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
    }

    function toValidIdent(str) {
        let s = str.replace(/[^a-zA-Z0-9_$]/g, '_');
        if (/^[0-9]/.test(s)) s = '_' + s;
        return s || '_';
    }

    // Type inference for special string formats
    function inferStringType(val) {
        // Email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'email';
        // URL
        try {
            if (val.startsWith('http://') || val.startsWith('https://')) {
                new URL(val);
                return 'url';
            }
        } catch (e) {}
        // UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) return 'uuid';
        // ISO datetime
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val) && !isNaN(Date.parse(val))) return 'datetime';
        // ISO date
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'date';
        // IP v4
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) return 'ip';
        return null;
    }

    // Generate Zod schema from a JSON value
    function generateSchema(value, name, depth, inferOptional, inferEnum, useStrict) {
        const indent = '  '.repeat(depth + 1);
        const indent2 = '  '.repeat(depth);

        if (value === null) {
            return 'z.null()';
        }

        if (value === undefined) {
            return 'z.undefined()';
        }

        if (typeof value === 'string') {
            const fmt = inferStringType(value);
            if (fmt === 'email') return 'z.string().email()';
            if (fmt === 'url') return 'z.string().url()';
            if (fmt === 'uuid') return 'z.string().uuid()';
            if (fmt === 'datetime') return 'z.string().datetime()';
            if (fmt === 'date') return 'z.string().date()';
            if (fmt === 'ip') return 'z.string().ip()';
            return 'z.string()';
        }

        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'z.number().int()' : 'z.number()';
        }

        if (typeof value === 'boolean') {
            return 'z.boolean()';
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return 'z.array(z.unknown())';
            }
            // Count unique types
            const types = value.map(v => {
                if (v === null) return 'null';
                return Array.isArray(v) ? 'array' : typeof v;
            });
            const uniqueTypes = [...new Set(types)];

            if (uniqueTypes.length === 1) {
                const itemSchema = generateSchema(value[0], 'Item', depth + 1, inferOptional, inferEnum, useStrict);
                return 'z.array(' + itemSchema + ')';
            } else {
                // Union of types
                const unionSchemas = uniqueTypes.map(t => {
                    const first = value.find((v, i) => {
                        const vt = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
                        return vt === t;
                    });
                    if (first !== undefined) {
                        return generateSchema(first, 'Item', depth + 1, inferOptional, inferEnum, useStrict);
                    }
                    return 'z.unknown()';
                });
                if (unionSchemas.length === 2) {
                    return 'z.union([' + unionSchemas.join(', ') + '])';
                }
                return 'z.union([' + unionSchemas.join(', ') + '])';
            }
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return 'z.object({}).strict()';
            }

            // Detect optional fields: keys that appear in SOME but not ALL objects
            // For a single object, no optional detection
            // For arrays, we look for missing keys across array items
            const optionalKeys = new Set();

            const fields = [];
            for (const key of keys) {
                const val = value[key];
                const fieldName = toValidIdent(key);

                // Check if key should be optional based on pattern
                let isOptional = false;
                if (inferOptional && val === null) {
                    isOptional = true;
                }

                let schema = generateSchema(val, key, depth + 1, inferOptional, inferEnum, useStrict);

                if (isOptional && inferOptional) {
                    if (val === null) {
                        schema = schema + '.nullable()';
                    }
                }

                // Add comment for original key if different from identifier
                const comment = fieldName !== key ? ` // original: "${key}"` : '';
                fields.push(indent + fieldName + ': ' + schema + ',' + comment);
            }

            const objSchema = 'z.object({\n' + fields.join('\n') + '\n' + indent2 + '})';
            return useStrict ? objSchema + '.strict()' : objSchema;
        }

        return 'z.unknown()';
    }

    // Collect keys across all items in an array for optional detection
    function collectAllKeys(arr) {
        const allKeys = new Set();
        for (const item of arr) {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                Object.keys(item).forEach(k => allKeys.add(k));
            }
        }
        return allKeys;
    }

    function getMissingKeys(arr, allKeys) {
        const missing = new Set();
        for (const item of arr) {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                for (const key of allKeys) {
                    if (!(key in item)) {
                        missing.add(key);
                    }
                }
            }
        }
        return missing;
    }

    function generate() {
        const raw = input.value.trim();
        if (!raw) {
            statusEl.textContent = T('请先输入 JSON 数据。', 'Please enter JSON data first.');
            statusEl.style.color = 'var(--error, #e74c3c)';
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            statusEl.textContent = T('JSON 解析错误: ' + e.message, 'JSON parse error: ' + e.message);
            statusEl.style.color = 'var(--error, #e74c3c)';
            return;
        }

        const inferOptional = optCheck ? optCheck.checked : true;
        const useStrict = strictCheck ? strictCheck.checked : true;
        const inferEnum = enumCheck ? enumCheck.checked : true;

        try {
            const schema = generateSchema(parsed, 'Root', 0, inferOptional, inferEnum, useStrict);
            const importStmt = "import { z } from 'zod';";
            const code = importStmt + '\n\n' + 'export const schema = ' + schema + ';\n';
            output.value = code;
            statusEl.textContent = T('✓ Schema 已生成', '✓ Schema generated');
            statusEl.style.color = 'var(--success, #27ae60)';
        } catch (e) {
            statusEl.textContent = T('生成失败: ' + e.message, 'Generation failed: ' + e.message);
            statusEl.style.color = 'var(--error, #e74c3c)';
        }
    }

    function copy() {
        if (!output.value) {
            statusEl.textContent = T('没有可复制的内容。', 'Nothing to copy.');
            statusEl.style.color = 'var(--muted)';
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            statusEl.textContent = T('✓ 已复制!', '✓ Copied!');
            statusEl.style.color = 'var(--success, #27ae60)';
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            statusEl.textContent = T('✓ 已复制!', '✓ Copied!');
            statusEl.style.color = 'var(--success, #27ae60)';
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        statusEl.textContent = T('已清空。', 'Cleared.');
        statusEl.style.color = 'var(--muted)';
    }

    // Events
    generateBtn.addEventListener('click', generate);
    copyBtn.addEventListener('click', copy);
    clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter to generate
    input.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generate();
        }
    });

    // Auto-generate on tab away
    input.addEventListener('blur', function() {
        if (input.value.trim()) {
            generate();
        }
    });

    console.log('JSON to Zod initialized');
})();