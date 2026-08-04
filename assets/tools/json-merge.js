/**
 * JSON Merge - Deep merge two JSON objects
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input1 = document.getElementById('json-merge-input1');
    const input2 = document.getElementById('json-merge-input2');
    const output = document.getElementById('json-merge-output');
    const mergeBtn = document.getElementById('json-merge-merge');
    const copyBtn = document.getElementById('json-merge-copy');
    const swapBtn = document.getElementById('json-merge-swap');
    const clearBtn = document.getElementById('json-merge-clear');
    const statusEl = document.getElementById('json-merge-status');
    const statsEl = document.getElementById('json-merge-stats');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input1 || !input2 || !output || !mergeBtn) return;

    function deepMerge(target, source) {
        const result = {};
        // Collect all keys
        const allKeys = new Set([...Object.keys(target), ...Object.keys(source)]);
        for (const key of allKeys) {
            if (key in target && key in source) {
                const tVal = target[key];
                const sVal = source[key];
                if (Array.isArray(tVal) && Array.isArray(sVal)) {
                    // Merge arrays with dedup
                    const merged = [...tVal];
                    for (const item of sVal) {
                        const itemStr = JSON.stringify(item);
                        if (!merged.some(existing => JSON.stringify(existing) === itemStr)) {
                            merged.push(item);
                        }
                    }
                    result[key] = merged;
                } else if (typeof tVal === 'object' && tVal !== null &&
                           typeof sVal === 'object' && sVal !== null &&
                           !Array.isArray(tVal) && !Array.isArray(sVal)) {
                    // Recursive merge for plain objects
                    result[key] = deepMerge(tVal, sVal);
                } else {
                    // Source value overwrites target
                    result[key] = sVal;
                }
            } else if (key in target) {
                result[key] = JSON.parse(JSON.stringify(target[key]));
            } else {
                result[key] = JSON.parse(JSON.stringify(source[key]));
            }
        }
        return result;
    }

    function showStatus(text, type) {
        statusEl.textContent = text;
        statusEl.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : 'var(--text-dim)';
    }

    function showStats(inputSize, outputSize) {
        const saved = inputSize - outputSize;
        const pct = inputSize > 0 ? ((saved / inputSize) * 100).toFixed(1) : '0.0';
        statsEl.textContent = T(
            `输入: ${formatSize(inputSize)} → 输出: ${formatSize(outputSize)} | 节省: ${formatSize(saved)} (${pct}%)`,
            `Input: ${formatSize(inputSize)} → Output: ${formatSize(outputSize)} | Saved: ${formatSize(saved)} (${pct}%)`
        );
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function parseJSON(text, label) {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error(T(
                `${label} JSON 语法错误: ${e.message}`,
                `${label} JSON syntax error: ${e.message}`
            ));
        }
    }

    function doMerge() {
        const raw1 = input1.value.trim();
        const raw2 = input2.value.trim();

        if (!raw1 && !raw2) {
            showStatus(T('请在两个输入框中输入 JSON', 'Please enter JSON in both input fields'), 'error');
            return;
        }
        if (!raw1) {
            showStatus(T('请在左侧输入框中输入 JSON 1', 'Please enter JSON 1 (source)'), 'error');
            return;
        }
        if (!raw2) {
            showStatus(T('请在右侧输入框中输入 JSON 2', 'Please enter JSON 2 (target)'), 'error');
            return;
        }

        try {
            const obj1 = parseJSON(raw1, T('JSON 1', 'JSON 1'));
            const obj2 = parseJSON(raw2, T('JSON 2', 'JSON 2'));

            if (typeof obj1 !== 'object' || obj1 === null || Array.isArray(obj1)) {
                showStatus(T('JSON 1 必须是对象（不能是数组或基本类型）', 'JSON 1 must be an object (not an array or primitive)'), 'error');
                return;
            }
            if (typeof obj2 !== 'object' || obj2 === null || Array.isArray(obj2)) {
                showStatus(T('JSON 2 必须是对象（不能是数组或基本类型）', 'JSON 2 must be an object (not an array or primitive)'), 'error');
                return;
            }

            const merged = deepMerge(obj1, obj2);
            const result = JSON.stringify(merged, null, 2);
            output.value = result;
            showStatus(T('✅ 合并成功！', '✅ Merge successful!'), 'success');
            showStats(raw1.length + raw2.length, result.length);
        } catch (e) {
            showStatus(e.message, 'error');
            statsEl.textContent = '';
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
            // Fallback
            output.select();
            document.execCommand('copy');
            showStatus(T('✅ 已复制', '✅ Copied'), 'success');
        });
    }

    function doSwap() {
        const temp = input1.value;
        input1.value = input2.value;
        input2.value = temp;
        showStatus(T('🔄 已交换左右输入', '🔄 Inputs swapped'), '');
    }

    function doClear() {
        input1.value = '';
        input2.value = '';
        output.value = '';
        statusEl.textContent = '';
        statsEl.textContent = '';
    }

    // Event listeners
    mergeBtn.addEventListener('click', doMerge);
    copyBtn.addEventListener('click', doCopy);
    swapBtn.addEventListener('click', doSwap);
    clearBtn.addEventListener('click', doClear);

    // Ctrl+Enter shortcut
    input1.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doMerge(); }
    });
    input2.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doMerge(); }
    });
})();