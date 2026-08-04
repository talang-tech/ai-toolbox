/**
 * JSON Minify - Compress JSON by removing whitespace
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('json-minify-input');
    const output = document.getElementById('json-minify-output');
    const minifyBtn = document.getElementById('json-minify-minify');
    const copyBtn = document.getElementById('json-minify-copy');
    const downloadBtn = document.getElementById('json-minify-download');
    const clearBtn = document.getElementById('json-minify-clear');
    const validateCheck = document.getElementById('json-minify-validate');
    const statusEl = document.getElementById('json-minify-status');
    const statsEl = document.getElementById('json-minify-stats');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !minifyBtn) return;

    function showStatus(text, type) {
        statusEl.textContent = text;
        statusEl.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : 'var(--text-dim)';
    }

    function showStats(inputSize, outputSize) {
        const saved = inputSize - outputSize;
        const pct = inputSize > 0 ? ((saved / inputSize) * 100).toFixed(1) : '0.0';
        const savedStr = saved >= 0 ?
            T(`节省: ${formatSize(saved)} (${pct}%)`, `Saved: ${formatSize(saved)} (${pct}%)`) :
            T(`增加了: ${formatSize(-saved)}`, `Increased: ${formatSize(-saved)}`);
        statsEl.textContent = T(
            `输入: ${formatSize(inputSize)} → 输出: ${formatSize(outputSize)} | ${savedStr}`,
            `Input: ${formatSize(inputSize)} → Output: ${formatSize(outputSize)} | ${savedStr}`
        );
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function doMinify() {
        const raw = input.value.trim();
        if (!raw) {
            showStatus(T('请输入 JSON', 'Please enter JSON'), 'error');
            return;
        }

        try {
            // Validate if checkbox is checked
            if (validateCheck && validateCheck.checked) {
                JSON.parse(raw);
            }

            // Parse and re-stringify without whitespace
            const parsed = JSON.parse(raw);
            const minified = JSON.stringify(parsed);
            output.value = minified;

            if (validateCheck && validateCheck.checked) {
                showStatus(T('✅ 语法验证通过，压缩成功！', '✅ Validation passed, minified!'), 'success');
            } else {
                showStatus(T('✅ 压缩成功！', '✅ Minified!'), 'success');
            }
            showStats(raw.length, minified.length);
        } catch (e) {
            showStatus(T(
                `JSON 语法错误: ${e.message}`,
                `JSON syntax error: ${e.message}`
            ), 'error');
            statsEl.textContent = '';
            output.value = '';
        }
    }

    function doCopy() {
        if (!output.value) {
            showStatus(T('没有可复制的内容', 'Nothing to copy'), 'error');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus(T('✅ 已复制到剪贴板', '✅ Copied to clipboard'), 'success');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            showStatus(T('✅ 已复制', '✅ Copied'), 'success');
        });
    }

    function doDownload() {
        if (!output.value) {
            showStatus(T('没有可下载的内容', 'Nothing to download'), 'error');
            return;
        }
        const blob = new Blob([output.value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
        showStatus(T('✅ 已下载为 data.json', '✅ Downloaded as data.json'), 'success');
    }

    function doClear() {
        input.value = '';
        output.value = '';
        statusEl.textContent = '';
        statsEl.textContent = '';
    }

    // Event listeners
    minifyBtn.addEventListener('click', doMinify);
    copyBtn.addEventListener('click', doCopy);
    downloadBtn.addEventListener('click', doDownload);
    clearBtn.addEventListener('click', doClear);

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doMinify(); }
    });
})();