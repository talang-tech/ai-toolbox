/**
 * HTML Prettifier - Format/Beautify HTML code with indentation options
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('html-prettify-input');
    const output = document.getElementById('html-prettify-output');
    const formatBtn = document.getElementById('html-prettify-format');
    const copyBtn = document.getElementById('html-prettify-copy');
    const clearBtn = document.getElementById('html-prettify-clear');
    const statusEl = document.getElementById('html-prettify-status');
    const statsEl = document.getElementById('html-prettify-stats');
    const indentRadios = document.querySelectorAll('input[name="html-prettify-indent"]');
    const collapseCheck = document.getElementById('html-prettify-collapse');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !formatBtn) return;

    function getIndent() {
        for (const r of indentRadios) {
            if (r.checked) return r.value;
        }
        return '  ';
    }

    function showStatus(text, type) {
        if (!statusEl) return;
        const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)' };
        statusEl.style.color = colors[type] || colors.info;
        statusEl.textContent = text;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Inline elements that typically don't break lines
    const INLINE = new Set([
        'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite',
        'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map',
        'object', 'output', 'q', 'samp', 'script', 'select', 'small', 'span',
        'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var', 'wbr'
    ]);

    // Self-closing elements
    const SELF_CLOSE = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    function tokenize(html) {
        const tokens = [];
        const regex = /(<!--[\s\S]*?-->|<[!?\/]?[a-zA-Z][^>]*>|[^<]+)/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            tokens.push(match[0]);
        }
        return tokens;
    }

    function getTagName(token) {
        const m = token.match(/^<\/(\w+)/);
        if (m) return m[1].toLowerCase();
        const m2 = token.match(/^<(\w+)/);
        if (m2) return m2[1].toLowerCase();
        return null;
    }

    function isComment(token) {
        return token.startsWith('<!--');
    }

    function isClosingTag(token) {
        return /^<\//.test(token);
    }

    function isOpeningTag(token) {
        return /^<[^\/!?]/.test(token) && !token.endsWith('/>') && !isComment(token);
    }

    function isSelfClosing(token) {
        const name = getTagName(token);
        if (!name) return false;
        if (token.endsWith('/>')) return true;
        if (SELF_CLOSE.has(name)) return true;
        // Check if void element
        if (name === '!doctype' || name === '?xml') return true;
        return false;
    }

    function format(html) {
        const indent = getIndent();
        const collapse = collapseCheck ? collapseCheck.checked : false;
        const tokens = tokenize(html);
        const lines = [];
        let depth = 0;
        let prevWasOpen = false;
        let prevWasClose = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const tagName = getTagName(token);
            const isOpen = isOpeningTag(token);
            const isClose = isClosingTag(token);
            const isSelfClose = isSelfClosing(token);
            const isCommentToken = isComment(token);
            const isText = !isOpen && !isClose && !isSelfClose && !isCommentToken;

            if (isText && collapse) {
                const trimmed = token.replace(/\s+/g, ' ').trim();
                if (!trimmed) continue;
                const text = trimmed;
                if (prevWasOpen && !INLINE.has(tagName)) {
                    lines.push(indent.repeat(depth) + text);
                } else {
                    if (lines.length > 0 && !prevWasClose) {
                        lines[lines.length - 1] += text;
                    } else {
                        lines.push(indent.repeat(depth) + text);
                    }
                }
                prevWasOpen = false;
                prevWasClose = false;
                continue;
            }

            if (isText) {
                const trimmed = token.replace(/\s+/g, ' ').trim();
                if (!trimmed) continue;
                lines.push(indent.repeat(depth) + trimmed);
                prevWasOpen = false;
                prevWasClose = false;
                continue;
            }

            if (isCommentToken) {
                lines.push(indent.repeat(depth) + token);
                prevWasOpen = false;
                prevWasClose = false;
                continue;
            }

            if (isClose) {
                depth = Math.max(0, depth - 1);
                lines.push(indent.repeat(depth) + token);
                prevWasOpen = false;
                prevWasClose = true;
                continue;
            }

            if (isSelfClose) {
                lines.push(indent.repeat(depth) + token);
                prevWasOpen = false;
                prevWasClose = false;
                continue;
            }

            // Opening tag
            // Check if next token is closing tag (for empty elements)
            const nextToken = tokens[i + 1];
            const nextIsClose = nextToken && (isClosingTag(nextToken) && getTagName(nextToken) === tagName);

            if (nextIsClose) {
                // Empty element: <tag></tag> => <tag></tag> on one line
                lines.push(indent.repeat(depth) + token + tokens[i + 1]);
                i++; // Skip the closing tag
                prevWasOpen = false;
                prevWasClose = false;
                continue;
            }

            // Check if inline
            if (INLINE.has(tagName)) {
                // Inline, keep on same line if possible
                let line = indent.repeat(depth) + token;
                // Check if next is also inline text or inline tag
                let j = i + 1;
                while (j < tokens.length) {
                    const nextT = tokens[j];
                    const nextTag = getTagName(nextT);
                    const nextIsCloseT = isClosingTag(nextT);
                    if (nextIsCloseT && nextTag === tagName) {
                        line += nextT;
                        i = j;
                        break;
                    }
                    if (INLINE.has(nextTag) || isOpeningTag(nextT)) {
                        break;
                    }
                    if (!isText && !isCommentToken) {
                        line += nextT;
                        j++;
                    } else {
                        break;
                    }
                }
                lines.push(line);
                prevWasOpen = true;
                prevWasClose = false;
                continue;
            }

            // Block opening tag
            lines.push(indent.repeat(depth) + token);
            depth++;
            prevWasOpen = true;
            prevWasClose = false;
        }

        return lines.join('\n');
    }

    function run() {
        const html = input.value.trim();
        if (!html) {
            showStatus(T('请先输入 HTML 代码。', 'Please enter HTML code first.'), 'error');
            return;
        }

        try {
            const result = format(html);
            output.value = result;
            const inBytes = new TextEncoder().encode(html).length;
            const outBytes = new TextEncoder().encode(result).length;
            showStatus(T('格式化成功。所有处理在浏览器本地完成。', 'Formatted successfully. All processing is local.'), 'success');
            if (statsEl) {
                statsEl.textContent = T(
                    `输入: ${formatBytes(inBytes)} → 输出: ${formatBytes(outBytes)}`,
                    `Input: ${formatBytes(inBytes)} → Output: ${formatBytes(outBytes)}`
                );
            }
        } catch (e) {
            showStatus(T('格式化失败: ', 'Format failed: ') + e.message, 'error');
        }
    }

    function copy() {
        if (!output.value) {
            showStatus(T('没有可复制的内容。', 'Nothing to copy.'), 'error');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus(T('已复制！', 'Copied!'), 'success');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            showStatus(T('已复制！', 'Copied!'), 'success');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.textContent = '';
        showStatus(T('已清空。', 'Cleared.'), 'info');
    }

    formatBtn.addEventListener('click', run);
    copyBtn.addEventListener('click', copy);
    clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter to format
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            run();
        }
    });

})();