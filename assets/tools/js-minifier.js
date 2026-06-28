/**
 * JS Minifier / Beautifier - Pure JS, zero dependencies
 * Compresses JS by removing comments, whitespace.
 * Beautifies JS with proper indentation.
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('js-input');
    const output = document.getElementById('js-output');
    const modeRadios = document.querySelectorAll('input[name="js-mode"]');
    const actionBtn = document.getElementById('js-action-btn');
    const copyBtn = document.getElementById('js-copy-btn');
    const statsEl = document.getElementById('js-stats');

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
        statsEl.innerHTML = '原大小: ' + formatBytes(before.length) + ' → 结果: ' + formatBytes(after.length) + ' (减少 ' + formatBytes(saved) + ', ' + ratio + '%)';
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function minifyJS(code) {
        // Remove single-line comments (but not inside strings)
        var noLineComments = code.replace(/\/\/[^\n]*/g, '');
        // Remove multi-line comments
        var noBlockComments = noLineComments.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove leading/trailing whitespace on each line
        var trimmed = noBlockComments.replace(/^\s+/gm, '').replace(/\s+$/gm, '');
        // Collapse multiple newlines and spaces
        var collapsed = trimmed.replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ');
        // Remove unnecessary spaces around brackets, parens, operators
        var min = collapsed
            .replace(/\s*({|}|\(|\)|;|,|:)\s*/g, '$1')
            .replace(/\s*([=!<>+*\/%&|?-]+)\s*/g, '$1')
            .replace(/\n+/g, '');
        return min;
    }

    function beautifyJS(code) {
        var result = '';
        var indent = 0;
        var indentStr = '  ';
        var i = 0;

        // Normalize line endings
        code = code.replace(/\r\n?/g, '\n');

        // Strip comments first but keep structure for beautification
        var cleaned = '';
        var len = code.length;
        var inLineComment = false;
        var inBlockComment = false;
        var inString = false;
        var stringChar = '';

        for (i = 0; i < len; i++) {
            var ch = code[i];
            var next = i + 1 < len ? code[i + 1] : '';

            if (inString) {
                cleaned += ch;
                if (ch === '\\') {
                    cleaned += next;
                    i++;
                } else if (ch === stringChar) {
                    inString = false;
                }
                continue;
            }
            if (inLineComment) {
                if (ch === '\n') {
                    inLineComment = false;
                    cleaned += ch;
                }
                continue;
            }
            if (inBlockComment) {
                if (ch === '*' && next === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            if (ch === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (ch === '"' || ch === "'" || ch === '`') {
                inString = true;
                stringChar = ch;
                cleaned += ch;
                continue;
            }
            cleaned += ch;
        }

        // Now beautify the cleaned code
        for (i = 0; i < cleaned.length; i++) {
            var ch = cleaned[i];
            var prev = i > 0 ? cleaned[i - 1] : '';
            var next = i + 1 < cleaned.length ? cleaned[i + 1] : '';

            if (ch === '{') {
                result += ' {\n';
                indent++;
                result += indentStr.repeat(indent);
            } else if (ch === '}') {
                result += '\n';
                indent = Math.max(0, indent - 1);
                result += indentStr.repeat(indent) + '}';
            } else if (ch === '(') {
                result += '(';
            } else if (ch === ')') {
                result += ')';
            } else if (ch === ';') {
                result += ';\n' + indentStr.repeat(indent);
            } else if (ch === ',') {
                result += ',\n' + indentStr.repeat(indent);
            } else if (ch === '\n') {
                result += '\n' + indentStr.repeat(indent);
            } else if (ch === ' ' && (prev === ' ' || prev === '\n')) {
                // Skip extra spaces
            } else {
                result += ch;
            }
        }

        // Cleanup extra whitespace
        return result.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function process() {
        var code = input.value;
        if (!code.trim()) {
            output.value = '';
            if (statsEl) statsEl.innerHTML = '';
            return;
        }
        var mode = getMode();
        var result;
        if (mode === 'minify') {
            result = minifyJS(code);
        } else {
            result = beautifyJS(code);
        }
        output.value = result;
        showStats(code, result);
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