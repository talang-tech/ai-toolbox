/**
 * JSON Escape / Unescape — Convert JSON to escaped string literal and back
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('je-input');
    const output = document.getElementById('je-output');
    const escapeBtn = document.getElementById('je-escape-btn');
    const unescapeBtn = document.getElementById('je-unescape-btn');
    const copyBtn = document.getElementById('je-copy-btn');
    const clearBtn = document.getElementById('je-clear-btn');
    const statusEl = document.getElementById('je-status');
    const wrapQuotes = document.getElementById('je-wrap-quotes');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output) return;

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = 'status ' + (type || '');
    }

    function escapeJSON(str) {
        const wrap = wrapQuotes ? wrapQuotes.checked : true;
        // Escape for JSON string literal
        const escaped = str.replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\b/g, '\\b');
        return wrap ? '"' + escaped + '"' : escaped;
    }

    function unescapeJSON(str) {
        // Remove surrounding quotes if present
        let s = str.trim();
        if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
            s = s.slice(1, -1);
        }
        // Unescape JSON string
        return s.replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\f/g, '\f')
            .replace(/\\b/g, '\b')
            .replace(/\\\\/g, '\\');
    }

    function doEscape() {
        const text = input.value;
        if (!text.trim()) {
            setStatus(isEN ? 'Please enter text.' : '请输入文本。', 'error');
            return;
        }
        try {
            const result = escapeJSON(text);
            output.value = result;
            const chars = text.length;
            const escapedChars = (result.match(/\\./g) || []).length;
            setStatus(
                isEN
                    ? `✓ Escaped (${chars} chars → ${result.length} chars, ${escapedChars} escape sequences)`
                    : `✓ 转义完成（${chars} 字符 → ${result.length} 字符，${escapedChars} 个转义序列）`,
                'success'
            );
        } catch (e) {
            setStatus(isEN ? '✗ Error: ' + e.message : '✗ 错误：' + e.message, 'error');
        }
    }

    function doUnescape() {
        const text = input.value;
        if (!text.trim()) {
            setStatus(isEN ? 'Please enter escaped text.' : '请输入转义后的文本。', 'error');
            return;
        }
        try {
            const result = unescapeJSON(text);
            output.value = result;
            // Check if result is valid JSON
            let validJSON = false;
            try {
                JSON.parse(result);
                validJSON = true;
            } catch(e) {}
            setStatus(
                isEN
                    ? `✓ Unescaped (${text.length} chars → ${result.length} chars${validJSON ? ', valid JSON' : ''})`
                    : `✓ 反转义完成（${text.length} 字符 → ${result.length} 字符${validJSON ? '，有效 JSON' : ''}）`,
                'success'
            );
        } catch (e) {
            setStatus(isEN ? '✗ Error: ' + e.message : '✗ 错误：' + e.message, 'error');
        }
    }

    function doCopy() {
        if (!output.value) {
            setStatus(isEN ? 'Nothing to copy.' : '没有可复制的内容。', 'error');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            setStatus(isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板', 'success');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            setStatus(isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板', 'success');
        });
    }

    function doClear() {
        input.value = '';
        output.value = '';
        setStatus('');
    }

    escapeBtn.addEventListener('click', doEscape);
    unescapeBtn.addEventListener('click', doUnescape);
    copyBtn.addEventListener('click', doCopy);
    if (clearBtn) clearBtn.addEventListener('click', doClear);

    // Auto-run on Ctrl+Enter
    input.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            doEscape();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();