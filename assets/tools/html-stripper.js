/**
 * HTML Tag Stripper — Remove HTML tags and extract clean text
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('hs-input');
    const output = document.getElementById('hs-output');
    const stripBtn = document.getElementById('hs-strip-btn');
    const copyBtn = document.getElementById('hs-copy-btn');
    const clearBtn = document.getElementById('hs-clear-btn');
    const statusEl = document.getElementById('hs-status');

    if (!input || !output) return;

    // Mode options
    const modeStripTags = document.getElementById('hs-mode-strip');
    const modeStripAll = document.getElementById('hs-mode-all');
    const modeDecode = document.getElementById('hs-mode-entities');
    const preserveNewlines = document.getElementById('hs-preserve-newlines');
    const collapseSpaces = document.getElementById('hs-collapse');

    function getMode() {
        if (modeStripTags && modeStripTags.checked) return 'strip-tags';
        if (modeStripAll && modeStripAll.checked) return 'strip-tags-content';
        if (modeDecode && modeDecode.checked) return 'decode-only';
        return 'strip-tags';
    }

    function stripHtml(html, mode, opts) {
        if (!html) return '';
        let text = html;
        let stats = { tagsRemoved: 0, charsSaved: 0 };

        // Step 1: HTML entity decoding (always applied)
        const entityRegex = /&(#(?:\d+);?|[a-zA-Z]+;?)/g;
        const entityMap = {
            '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
            '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&copy;': '©',
            '&reg;': '®', '&trade;': '™', '&mdash;': '—', '&ndash;': '–',
            '&hellip;': '…', '&laquo;': '«', '&raquo;': '»', '&bull;': '•',
            '&middot;': '·', '&deg;': '°', '&plusmn;': '±', '&times;': '×',
            '&divide;': '÷', '&micro;': 'µ', '&cent;': '¢', '&pound;': '£',
            '&yen;': '¥', '&euro;': '€', '&sect;': '§', '&para;': '¶',
            '&amp': '&', '&lt': '<', '&gt': '>', '&quot': '"', '&nbsp': ' '
        };
        text = text.replace(/&[a-zA-Z]+;?/g, function(m) {
            return entityMap[m.toLowerCase()] || m;
        });
        text = text.replace(/&#(\d+);?/g, function(m, d) {
            return String.fromCharCode(parseInt(d, 10));
        });

        if (mode === 'decode-only') {
            return text;
        }

        if (mode === 'strip-tags-content') {
            // Remove tags AND their content (strip script, style, etc.)
            // For script/style tags, remove tag + inner content
            text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
            text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
            text = text.replace(/<template[^>]*>[\s\S]*?<\/template>/gi, '');
            text = text.replace(/<!--[\s\S]*?-->/g, '');
            // Count tags removed
            const allTags = text.match(/<[^>]*>/g);
            stats.tagsRemoved = allTags ? allTags.length : 0;
            // Remove remaining tags
            text = text.replace(/<[^>]*>/g, '');
        } else {
            // Default: strip tags but keep content
            // Remove comments first
            text = text.replace(/<!--[\s\S]*?-->/g, '');
            // Count tags removed
            const allTags = text.match(/<[^>]*>/g);
            stats.tagsRemoved = allTags ? allTags.length : 0;
            // Remove tags
            text = text.replace(/<[^>]*>/g, '');
        }

        // Preserve or normalize newlines
        if (opts.preserveNewlines) {
            // Replace block-level tags with newlines for better readability
            text = text.replace(/(<(?:br|p|div|h[1-6]|li|tr|td|th|blockquote|section|article|header|footer|nav|figure|figcaption|details|summary|pre)[^>]*>)/gi, '\n');
            // Clean up multiple newlines
            text = text.replace(/\n{3,}/g, '\n\n');
        } else {
            // Remove all newlines entirely
            text = text.replace(/[\r\n]+/g, ' ');
        }

        // Collapse whitespace
        if (opts.collapseSpaces) {
            text = text.replace(/[ \t]+/g, ' ');
            if (!opts.preserveNewlines) {
                text = text.replace(/\s+/g, ' ');
            } else {
                text = text.replace(/[ \t]+/g, ' ');
                text = text.replace(/ *\n */g, '\n');
                text = text.replace(/\n{3,}/g, '\n\n');
            }
        }

        // Trim
        text = text.trim();
        stats.charsSaved = html.length - text.length;
        return text;
    }

    function process() {
        const html = input.value;
        if (!html.trim()) {
            showStatus('error', 'Please paste HTML code first / 请先粘贴 HTML 代码');
            return;
        }

        const mode = getMode();
        const opts = {
            preserveNewlines: preserveNewlines ? preserveNewlines.checked : false,
            collapseSpaces: collapseSpaces ? collapseSpaces.checked : true
        };

        const result = stripHtml(html, mode, opts);
        output.value = result;

        // Show stats
        const charsBefore = html.length;
        const charsAfter = result.length;
        const saved = charsBefore - charsAfter;
        const pct = charsBefore > 0 ? ((saved / charsBefore) * 100).toFixed(1) : 0;
        showStatus('success', 
            `✅ Done / 完成 | Before: ${charsBefore.toLocaleString()} chars → After: ${charsAfter.toLocaleString()} chars | Reduced by ${saved.toLocaleString()} (${pct}%)`);

        // Update stats display
        const statsEl = document.getElementById('hs-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span>Characters before: ${charsBefore.toLocaleString()}</span>
                <span>Characters after: ${charsAfter.toLocaleString()}</span>
                <span>Saved: ${saved.toLocaleString()} (${pct}%)</span>
            `;
        }
    }

    function showStatus(type, msg) {
        if (!statusEl) return;
        statusEl.className = type;
        statusEl.textContent = msg;
        statusEl.style.display = 'block';
    }

    function copyResult() {
        if (!output.value) {
            showStatus('error', 'Nothing to copy / 没有内容可复制');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus('success', '📋 Copied to clipboard! / 已复制到剪贴板！');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            showStatus('success', '📋 Copied! / 已复制！');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        const statsEl = document.getElementById('hs-stats');
        if (statsEl) statsEl.innerHTML = '';
        statusEl.style.display = 'none';
        input.focus();
    }

    // Event listeners
    stripBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', copyResult);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter / Cmd+Enter
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            process();
        }
        // Tab inserts spaces instead of losing focus
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
        }
    });

    // Real-time stats update
    function updateLivePreview() {
        const html = input.value;
        const statsEl = document.getElementById('hs-stats');
        if (!statsEl) return;
        if (!html.trim()) {
            statsEl.innerHTML = '';
            return;
        }
        const mode = getMode();
        const opts = {
            preserveNewlines: preserveNewlines ? preserveNewlines.checked : false,
            collapseSpaces: collapseSpaces ? collapseSpaces.checked : true
        };
        const result = stripHtml(html, mode, opts);
        const charsBefore = html.length;
        const charsAfter = result.length;
        const saved = charsBefore - charsAfter;
        const pct = charsBefore > 0 ? ((saved / charsBefore) * 100).toFixed(1) : 0;
        statsEl.innerHTML = `
            <span>Before: ${charsBefore.toLocaleString()}</span>
            <span>After: ${charsAfter.toLocaleString()}</span>
            <span>Saved: ${saved.toLocaleString()} (${pct}%)</span>
        `;
    }

    // Debounced live update
    let debounceTimer;
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateLivePreview, 300);
    });

    // Mode changes also trigger live update
    if (modeStripTags) modeStripTags.addEventListener('change', updateLivePreview);
    if (modeStripAll) modeStripAll.addEventListener('change', updateLivePreview);
    if (modeDecode) modeDecode.addEventListener('change', updateLivePreview);
    if (preserveNewlines) preserveNewlines.addEventListener('change', updateLivePreview);
    if (collapseSpaces) collapseSpaces.addEventListener('change', updateLivePreview);

    console.log('✅ HTML Tag Stripper initialized');
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();