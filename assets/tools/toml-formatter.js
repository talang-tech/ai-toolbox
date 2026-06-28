/**
 * TOML Formatter / Validator - Pure JS
 * Formats and validates TOML configuration files.
 * TOML parsing is done with a simplified approach.
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('toml-input');
    const output = document.getElementById('toml-output');
    const actionBtn = document.getElementById('toml-action-btn');
    const copyBtn = document.getElementById('toml-copy-btn');
    const statusEl = document.getElementById('toml-status');

    if (!input || !output) return;

    function showStatus(msg, isError) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#e74c3c' : 'var(--text-dim)';
    }

    // Extremely simple TOML tokenizer/validator formatter
    // This handles common TOML constructs: tables, key-value pairs, comments, arrays, inline tables
    function formatTOML(text) {
        const lines = text.split('\n');
        let formatted = '';
        let inTable = false;
        let inArrayOfTables = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Trim trailing whitespace
            line = line.replace(/\s+$/, '');

            // Preserve empty lines (max one between sections)
            if (line.trim() === '') {
                if (!formatted.endsWith('\n\n')) {
                    formatted += '\n';
                }
                continue;
            }

            // Preserve comments
            const commentMatch = line.match(/^\s*#/);
            if (commentMatch) {
                formatted += line.trimStart() + '\n';
                continue;
            }

            // Table headers [[array.table]] or [table]
            const arrayTableMatch = line.match(/^\s*\[\[(.+?)\]\]\s*(?:#.*)?$/);
            const simpleTableMatch = line.match(/^\s*\[(.+?)\]\s*(?:#.*)?$/);

            if (arrayTableMatch) {
                if (!formatted.endsWith('\n')) formatted += '\n';
                formatted += '[[' + arrayTableMatch[1].trim() + ']]\n';
                inArrayOfTables = true;
                inTable = true;
                continue;
            }

            if (simpleTableMatch) {
                if (!formatted.endsWith('\n')) formatted += '\n';
                formatted += '[' + simpleTableMatch[1].trim() + ']\n';
                inTable = true;
                inArrayOfTables = false;
                continue;
            }

            // Key = value pairs
            const kvMatch = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*(?:#.*)?$/);
            if (kvMatch) {
                const key = kvMatch[1].trim();
                let value = kvMatch[2].trim();

                // Clean up value formatting
                // Multiline strings
                if (value.startsWith('"""') || value.startsWith("'''")) {
                    formatted += key + ' = ' + value + '\n';
                    continue;
                }

                // Arrays
                if (value.startsWith('[') && value.endsWith(']')) {
                    formatted += key + ' = ' + formatInlineArray(value) + '\n';
                    continue;
                }

                // Inline tables
                if (value.startsWith('{') && value.endsWith('}')) {
                    formatted += key + ' = ' + value + '\n';
                    continue;
                }

                formatted += key + ' = ' + value + '\n';
                continue;
            }

            // If we can't parse it, keep it as-is (might be TOML we don't recognize)
            formatted += line + '\n';
        }

        // Clean up extra blank lines
        formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();
        return formatted;
    }

    function formatInlineArray(arrStr) {
        // Simplify: just add spaces after commas
        const content = arrStr.slice(1, -1);
        return '[' + content.replace(/,/g, ', ') + ']';
    }

    function validateTOML(tomlText) {
        // Basic validation checks
        const errors = [];
        const lines = tomlText.split('\n');
        let inMultilineBasic = false;
        let inMultilineLiteral = false;
        let inBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const lineNum = i + 1;
            let line = lines[i].trim();

            if (inMultilineBasic) {
                if (line.includes('"""')) {
                    inMultilineBasic = false;
                }
                continue;
            }
            if (inMultilineLiteral) {
                if (line.includes("'''")) {
                    inMultilineLiteral = false;
                }
                continue;
            }

            // Skip empty lines and comments
            if (line === '' || line.startsWith('#')) continue;

            // Check for unclosed multiline strings
            const basicStr = line.match(/"""/);
            const literalStr = line.match(/'''/);
            if (basicStr) {
                const count = (line.match(/"""/g) || []).length;
                if (count % 2 !== 0) {
                    inMultilineBasic = !inMultilineBasic;
                }
                continue;
            }
            if (literalStr) {
                const count = (line.match(/'''/g) || []).length;
                if (count % 2 !== 0) {
                    inMultilineLiteral = !inMultilineLiteral;
                }
                continue;
            }

            // Table header [xxx] or [[xxx]]
            const tableMatch = line.match(/^\[{1,2}(.+?)\]{1,2}\s*(?:#.*)?$/);
            if (tableMatch) {
                const name = tableMatch[1].trim();
                if (!name) {
                    errors.push(`第 ${lineNum} 行: 空的表头`);
                }
                continue;
            }

            // Key = value
            const kvMatch = line.match(/^([\w.-]+)\s*=\s*(.*?)\s*$/);
            if (kvMatch) {
                const value = kvMatch[2].trim();
                // Check for obvious issues
                if (value === '' || value === ',') {
                    errors.push(`第 ${lineNum} 行: 值无效或为空`);
                }
                if (value.includes('\t')) {
                    errors.push(`第 ${lineNum} 行: 值中包含制表符`);
                }
                continue;
            }

            // If we get here, it might be a continuation or an unknown construct
            // We'll be lenient and just warn
        }

        return errors;
    }

    function process() {
        const text = input.value;
        if (!text.trim()) {
            output.value = '';
            showStatus('请输入 TOML 内容');
            return;
        }

        try {
            const formatted = formatTOML(text);
            output.value = formatted;

            const errors = validateTOML(text);
            if (errors.length > 0) {
                showStatus('格式化完成，有 ' + errors.length + ' 个警告:\n' + errors.join('\n'), true);
            } else {
                showStatus('✓ 格式化完成，无错误');
            }
        } catch (e) {
            output.value = '';
            showStatus('❌ 错误: ' + e.message, true);
        }
    }

    actionBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', function() {
        if (output.value) {
            navigator.clipboard.writeText(output.value).then(function() {
                toast('已复制!');
            });
        }
    });

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            process();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();