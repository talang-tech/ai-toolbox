/**
 * GraphQL Formatter / Validator - Pure JS, zero dependencies
 * Formats GraphQL queries/mutations/subscriptions with proper indentation.
 * Validates basic GraphQL syntax (braces, parens, operation names).
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('gql-input');
    const output = document.getElementById('gql-output');
    const formatBtn = document.getElementById('gql-format-btn');
    const copyBtn = document.getElementById('gql-copy-btn');
    const clearBtn = document.getElementById('gql-clear-btn');
    const statsEl = document.getElementById('gql-stats');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !formatBtn) return;

    const T = (zh, en) => isEN ? en : zh;

    // ====== GraphQL Formatter ======
    function formatGQL(code) {
        let result = '';
        let indent = 0;
        const indentStr = '  ';

        // Normalize line endings
        code = code.replace(/\r\n?/g, '\n');

        // Tokenize: preserve strings and block strings
        const tokens = [];
        let i = 0;
        let current = '';

        function flush() {
            if (current.trim()) {
                tokens.push(current.trim());
            }
            current = '';
        }

        while (i < code.length) {
            const ch = code[i];
            const next = code[i + 1] || '';

            // String value
            if (ch === '"') {
                flush();
                if (next === '"' && code[i + 2] === '"') {
                    // Block string """
                    let str = '"""';
                    i += 3;
                    while (i < code.length) {
                        str += code[i];
                        if (code[i] === '"' && code[i + 1] === '"' && code[i + 2] === '"') {
                            str += '"""';
                            i += 3;
                            break;
                        }
                        i++;
                    }
                    tokens.push(str);
                } else {
                    // Regular string
                    let str = '"';
                    i++;
                    while (i < code.length) {
                        if (code[i] === '\\') {
                            str += code[i] + (code[i + 1] || '');
                            i += 2;
                            continue;
                        }
                        if (code[i] === '"') {
                            str += '"';
                            i++;
                            break;
                        }
                        str += code[i];
                        i++;
                    }
                    tokens.push(str);
                }
                continue;
            }

            // Comments
            if (ch === '#') {
                flush();
                let comment = '#';
                i++;
                while (i < code.length && code[i] !== '\n') {
                    comment += code[i];
                    i++;
                }
                tokens.push(comment);
                continue;
            }

            // Significant characters
            if ('{}()[]:,|'.includes(ch)) {
                flush();
                tokens.push(ch);
                i++;
                continue;
            }

            // Whitespace and newlines
            if (/\s/.test(ch)) {
                flush();
                if (ch === '\n') {
                    // Don't add extra newlines for now, formatting handles them
                }
                i++;
                continue;
            }

            // Word characters, variables, etc.
            current += ch;
            i++;
        }
        flush();

        // Build formatted output
        let pendingNewline = false;
        let pendingIndent = false;

        for (let t = 0; t < tokens.length; t++) {
            const token = tokens[t];
            const prev = t > 0 ? tokens[t - 1] : '';
            const next = t + 1 < tokens.length ? tokens[t + 1] : '';

            // Comments
            if (token.startsWith('#')) {
                if (result.length > 0 && !result.endsWith('\n')) {
                    result += '\n';
                }
                result += indentStr.repeat(indent) + token + '\n';
                continue;
            }

            // Opening brace
            if (token === '{') {
                result += ' {\n';
                indent++;
                continue;
            }

            // Closing brace
            if (token === '}') {
                indent = Math.max(0, indent - 1);
                result += '\n' + indentStr.repeat(indent) + '}';
                continue;
            }

            // Opening paren
            if (token === '(') {
                result += '(';
                continue;
            }

            // Closing paren
            if (token === ')') {
                result += ')';
                continue;
            }

            // Opening bracket
            if (token === '[') {
                result += ' [';
                continue;
            }

            // Closing bracket
            if (token === ']') {
                result += ']';
                continue;
            }

            // Comma
            if (token === ',') {
                result += ', ';
                continue;
            }

            // Colon
            if (token === ':') {
                result += ': ';
                continue;
            }

            // Pipe
            if (token === '|') {
                result += ' | ';
                continue;
            }

            // As a general rule, if we're at the start of a line (or after {)
            // and this token looks like a field name, put it on a new line.
            // Heuristic: after a newline or at the start of output
            if (result.length === 0 || result.endsWith('\n') || result.endsWith(' {\n')) {
                // Check if the previous token was a { (we already handled it above)
                if (result.endsWith(' {\n')) {
                    // Already formatted
                } else if (result.endsWith('\n') && !result.endsWith('  \n')) {
                    // We're on a new line but need indent
                }
                result += indentStr.repeat(indent);
            } else if (result.endsWith(' ') || result.endsWith('(')) {
                // Don't add space before
            } else {
                result += ' ';
            }

            result += token;
        }

        return result.trim();
    }

    // ====== GraphQL Validator ======
    function validateGQL(code) {
        const errors = [];
        const warnings = [];

        if (!code.trim()) {
            return { errors, warnings };
        }

        // Remove string contents for accurate brace matching
        let stripped = code;
        // Remove block strings
        stripped = stripped.replace(/"""[\s\S]*?"""/g, '"""');
        // Remove regular strings
        stripped = stripped.replace(/"([^"\\]|\\.)*"/g, '""');
        // Remove comments
        stripped = stripped.replace(/#[^\n]*/g, '');

        const lines = code.split('\n');

        function countLines(pos) {
            return code.substring(0, pos).split('\n').length;
        }

        // Check 1: Unmatched braces
        let braceStack = [];
        for (let i = 0; i < stripped.length; i++) {
            const ch = stripped[i];
            if (ch === '{') braceStack.push({ pos: i, ch: '{' });
            else if (ch === '}') {
                if (braceStack.length === 0) {
                    errors.push({ line: countLines(i), msg: T('多余的闭合大括号 }', 'Unexpected closing brace }') });
                } else {
                    braceStack.pop();
                }
            }
        }
        braceStack.forEach(s => {
            errors.push({ line: countLines(s.pos), msg: T('未闭合的大括号 {', 'Unclosed opening brace {') });
        });

        // Check 2: Unmatched parentheses
        let parenStack = [];
        for (let i = 0; i < stripped.length; i++) {
            if (stripped[i] === '(') parenStack.push(i);
            else if (stripped[i] === ')') {
                if (parenStack.length === 0) {
                    errors.push({ line: countLines(i), msg: T('多余的闭合括号 )', 'Unexpected closing parenthesis )') });
                } else {
                    parenStack.pop();
                }
            }
        }
        parenStack.forEach(pos => {
            errors.push({ line: countLines(pos), msg: T('未闭合的括号 (', 'Unclosed opening parenthesis (') });
        });

        // Check 3: Unmatched brackets
        let bracketStack = [];
        for (let i = 0; i < stripped.length; i++) {
            if (stripped[i] === '[') bracketStack.push(i);
            else if (stripped[i] === ']') {
                if (bracketStack.length === 0) {
                    errors.push({ line: countLines(i), msg: T('多余的闭合方括号 ]', 'Unexpected closing bracket ]') });
                } else {
                    bracketStack.pop();
                }
            }
        }
        bracketStack.forEach(pos => {
            errors.push({ line: countLines(pos), msg: T('未闭合的方括号 [', 'Unclosed opening bracket [') });
        });

        // Check 4: Operation name suggestion
        const opMatch = code.match(/\b(query|mutation|subscription)\s*(\w+)/);
        if (!opMatch) {
            const hasOp = /\b(query|mutation|subscription)\b/.test(code);
            if (hasOp) {
                warnings.push({ line: 1, msg: T('建议为操作命名（例如 query GetUsers）', 'Consider naming your operation (e.g. query GetUsers)') });
            }
        }

        // Check 5: Empty selection set
        const emptySel = code.match(/\{\s*\}/g);
        if (emptySel) {
            warnings.push({ line: 1, msg: T('检测到空选择集 {}', 'Detected empty selection set {}') });
        }

        // Check 6: Missing @ for directives
        const dirMatch = code.match(/(?<!\w)(skip|include|deprecated|defer|stream)(?:\s*\()/g);
        if (dirMatch) {
            warnings.push({ line: 1, msg: T('指令可能需要 @ 前缀（如 @skip, @include）', 'Directives may need @ prefix (e.g. @skip, @include)') });
        }

        // Check 7: Detect possible fragments without ...
        if (/\b(on\s+\w+)\s*\{/i.test(code)) {
            // Inline fragment is valid, just check
        }

        return { errors, warnings };
    }

    function process() {
        const code = input.value;
        if (!code.trim()) {
            output.value = '';
            if (statsEl) statsEl.innerHTML = '';
            return;
        }

        // Format
        const formatted = formatGQL(code);
        output.value = formatted;

        // Validate
        const { errors, warnings } = validateGQL(code);

        // Build stats
        let statsHtml = '';
        const beforeBytes = new TextEncoder().encode(code).length;
        const afterBytes = new TextEncoder().encode(formatted).length;

        if (errors.length > 0 || warnings.length > 0) {
            const total = errors.length + warnings.length;
            const icon = errors.length > 0 ? '⚠️' : '💡';
            statsHtml = `<span style="color:${errors.length > 0 ? 'var(--error)' : 'var(--warning)'}">${icon} ${T('发现', 'Found')} ${total} ${T('个问题', ' issue(s)')}`;
            if (errors.length > 0) {
                statsHtml += ` (${errors.length} ${T('错误', 'error(s)')})`;
            }
            statsHtml += '</span>';

            // Show detailed validation in a collapsible
            let detail = '';
            errors.forEach(e => {
                detail += `${T('第', 'Line ')}${e.line}: ❌ ${e.msg}\n`;
            });
            warnings.forEach(w => {
                detail += `${T('第', 'Line ')}${w.line}: ⚠️ ${w.msg}\n`;
            });

            // Append validation info to output
            output.value = formatted + '\n\n/* ===== ' + T('验证结果', 'Validation Results') + ' ===== */\n' + detail;
        }

        statsHtml += ` | ${T('格式化前', 'Before')}: ${formatBytes(beforeBytes)} → ${T('格式化后', 'After')}: ${formatBytes(afterBytes)}`;
        if (statsEl) statsEl.innerHTML = statsHtml;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    formatBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', function() {
        if (output.value) {
            navigator.clipboard.writeText(output.value).then(function() {
                toast(T('已复制!', 'Copied!'));
            });
        }
    });
    clearBtn.addEventListener('click', function() {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.innerHTML = '';
        input.focus();
    });

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            process();
        }
    });
}

// Global toast function if not defined
if (typeof toast !== 'function') {
    window.toast = function(msg) {
        var el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:8px;font-size:14px;z-index:9999;transition:opacity .3s';
        document.body.appendChild(el);
        setTimeout(function() {
            el.style.opacity = '0';
            setTimeout(function() { el.remove(); }, 300);
        }, 2000);
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();