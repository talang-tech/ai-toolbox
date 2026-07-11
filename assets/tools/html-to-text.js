/**
 * HTML to Text Converter — Extract clean text from HTML
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('ht-input');
    const output = document.getElementById('ht-output');
    const convertBtn = document.getElementById('ht-convert-btn');
    const copyBtn = document.getElementById('ht-copy-btn');
    const clearBtn = document.getElementById('ht-clear-btn');
    const statusEl = document.getElementById('ht-status');
    const preserveLinks = document.getElementById('ht-preserve-links');
    const preserveHeadings = document.getElementById('ht-preserve-headings');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output) return;

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = 'status ' + (type || '');
    }

    function htmlToText(html, opts) {
        if (!html) return '';

        let text = html;

        // Decode HTML entities
        const entityMap = {
            '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
            '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&copy;': '©',
            '&reg;': '®', '&trade;': '™', '&mdash;': '—', '&ndash;': '–',
            '&hellip;': '…', '&laquo;': '«', '&raquo;': '»', '&bull;': '•',
            '&middot;': '·', '&deg;': '°', '&plusmn;': '±', '&times;': '×',
            '&divide;': '÷', '&micro;': 'µ', '&cent;': '¢', '&pound;': '£',
            '&yen;': '¥', '&euro;': '€', '&sect;': '§', '&para;': '¶',
            '&rsquo;': "'", '&lsquo;': "'", '&rdquo;': '"', '&ldquo;': '"',
            '&sbquo;': '‚', '&bdquo;': '„', '&prime;': '′', '&Prime;': '″',
            '&#x27;': "'", '&#x2F;': '/', '&#x60;': '`', '&#x3C;': '<', '&#x3E;': '>'
        };
        text = text.replace(/&[a-zA-Z#]+;/g, function(m) {
            if (m.startsWith('&#x')) {
                try { return String.fromCharCode(parseInt(m.slice(3, -1), 16)); } catch(e) { return m; }
            }
            if (m.startsWith('&#')) {
                try { return String.fromCharCode(parseInt(m.slice(2, -1))); } catch(e) { return m; }
            }
            return entityMap[m.toLowerCase()] || m;
        });

        // Remove script and style tags and their content
        text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
        text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
        text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
        text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');
        text = text.replace(/<template[\s\S]*?<\/template>/gi, '');

        // Handle block-level elements -> newlines
        const blockElements = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'pre', 'hr', 'li', 'tr', 'th', 'td', 'header', 'footer',
            'section', 'article', 'nav', 'aside', 'main', 'figure', 'figcaption',
            'details', 'summary', 'table', 'thead', 'tbody', 'tfoot', 'caption',
            'ol', 'ul', 'dl', 'dt', 'dd', 'address', 'form', 'fieldset'];

        blockElements.forEach(function(tag) {
            // Replace opening tags with newline
            var regex = new RegExp('<' + tag + '[^>]*>', 'gi');
            text = text.replace(regex, '\n');
            // Replace closing tags with newline
            var regexClose = new RegExp('</' + tag + '>', 'gi');
            text = text.replace(regexClose, '\n');
        });

        // Replace <br> and <wbr> with newlines
        text = text.replace(/<br[^>]*>/gi, '\n');
        text = text.replace(/<wbr[^>]*>/gi, '');

        // Handle links
        if (opts && opts.preserveLinks) {
            text = text.replace(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)');
        }

        // Handle headings
        if (opts && opts.preserveHeadings) {
            text = text.replace(/\n<([hH])([1-6])[^>]*>/g, function(m, _, level) {
                var prefix = '#'.repeat(parseInt(level));
                return '\n' + prefix + ' ';
            });
        }

        // Remove remaining HTML tags
        text = text.replace(/<[^>]*>/g, '');

        // Clean up whitespace
        text = text.replace(/[ \t]+/g, ' ');
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/^\n+/, '');
        text = text.replace(/\n+$/, '');
        text = text.split('\n').map(function(line) {
            return line.trim();
        }).join('\n');

        return text;
    }

    function doConvert() {
        const html = input.value;
        if (!html.trim()) {
            setStatus(isEN ? 'Please enter HTML content.' : '请输入 HTML 内容。', 'error');
            return;
        }

        const opts = {
            preserveLinks: preserveLinks ? preserveLinks.checked : true,
            preserveHeadings: preserveHeadings ? preserveHeadings.checked : false
        };

        const startTime = performance.now();
        const result = htmlToText(html, opts);
        const elapsed = (performance.now() - startTime).toFixed(1);

        output.value = result;

        const originalChars = html.length;
        const resultChars = result.length;
        const reduction = originalChars > 0 ? ((1 - resultChars / originalChars) * 100).toFixed(1) : 0;

        setStatus(
            isEN
                ? `✓ Converted (${resultChars} chars, ${reduction}% reduction, ${elapsed}ms)`
                : `✓ 转换完成（${resultChars} 字符，缩减 ${reduction}%，${elapsed}ms）`,
            'success'
        );
    }

    function doCopy() {
        if (!output.value) {
            setStatus(isEN ? 'Nothing to copy.' : '没有可复制的内容。', 'error');
            return;
        }
        navigator.clipboard.writeText(output.value).then(function() {
            setStatus(isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板', 'success');
        }).catch(function() {
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

    convertBtn.addEventListener('click', doConvert);
    copyBtn.addEventListener('click', doCopy);
    if (clearBtn) clearBtn.addEventListener('click', doClear);

    // Ctrl+Enter to convert
    input.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            doConvert();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();