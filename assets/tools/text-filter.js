/**
 * Text Filter (Grep) - Filter lines by keyword or regex pattern
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('tf-input');
    const output = document.getElementById('tf-output');
    const pattern = document.getElementById('tf-pattern');
    const regexCheck = document.getElementById('tf-regex');
    const caseCheck = document.getElementById('tf-case');
    const invertCheck = document.getElementById('tf-invert');
    const filterBtn = document.getElementById('tf-filter');
    const copyBtn = document.getElementById('tf-copy');
    const clearBtn = document.getElementById('tf-clear');
    const statsEl = document.getElementById('tf-stats');

    if (!input || !output || !filterBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

    function filterLines() {
        const text = input.value;
        const pat = pattern.value;
        const lines = text.split('\n');
        
        if (!pat.trim()) {
            output.value = text;
            statsEl.textContent = T('请输入模式', 'Enter a pattern');
            return;
        }

        const caseSensitive = caseCheck.checked;
        const invert = invertCheck.checked;
        const isRegex = regexCheck.checked;

        let regex;
        try {
            if (isRegex) {
                regex = new RegExp(pat, caseSensitive ? '' : 'i');
            } else {
                // Escape special regex chars for literal matching
                const escaped = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                regex = new RegExp(escaped, caseSensitive ? '' : 'i');
            }
        } catch (e) {
            statsEl.textContent = T('正则表达式错误: ' + e.message, 'Regex error: ' + e.message);
            statsEl.style.color = '#e74c3c';
            output.value = '';
            return;
        }

        const matched = [];
        let matchCount = 0;
        let totalChars = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isMatch = regex.test(line);
            regex.lastIndex = 0; // Reset for global regexes
            
            if (invert ? !isMatch : isMatch) {
                matched.push(line);
                matchCount++;
                totalChars += line.length;
            }
        }

        output.value = matched.join('\n');
        
        const totalLines = lines.length;
        const removed = totalLines - matchCount;
        
        statsEl.style.color = 'var(--text-dim)';
        statsEl.textContent = T(
            `共 ${totalLines} 行，匹配 ${matchCount} 行，排除 ${removed} 行`,
            `${totalLines} lines total, ${matchCount} matched, ${removed} excluded`
        );
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        pattern.value = '';
        regexCheck.checked = false;
        caseCheck.checked = false;
        invertCheck.checked = false;
        statsEl.textContent = '';
    }

    function copyResult() {
        if (!output.value) {
            showToast(T('没有可复制的内容', 'Nothing to copy'));
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showToast(T('已复制!', 'Copied!'));
        });
    }

    filterBtn.addEventListener('click', filterLines);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);

    // Enter key in pattern field triggers filter
    pattern.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') filterLines();
    });

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    }
})();