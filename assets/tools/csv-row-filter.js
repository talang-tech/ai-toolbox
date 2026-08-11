/**
 * CSV Row Filter - Filter CSV rows by column value conditions
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('crf-input');
    const output = document.getElementById('crf-output');
    const delimiter = document.getElementById('crf-delimiter');
    const headerCheck = document.getElementById('crf-header');
    const columnSel = document.getElementById('crf-column');
    const operatorSel = document.getElementById('crf-operator');
    const valueInput = document.getElementById('crf-value');
    const filterBtn = document.getElementById('crf-filter');
    const copyBtn = document.getElementById('crf-copy');
    const clearBtn = document.getElementById('crf-clear');
    const statsEl = document.getElementById('crf-stats');

    if (!input || !output || !filterBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

    let headers = [];
    let parsedData = [];
    let hasHeader = true;

    // Operator labels
    const opLabels = {
        'equals':          ['等于', 'Equals'],
        'not-equals':      ['不等于', 'Not Equals'],
        'contains':        ['包含', 'Contains'],
        'starts-with':     ['开头为', 'Starts With'],
        'ends-with':       ['结尾为', 'Ends With'],
        'greater-than':    ['大于', 'Greater Than'],
        'less-than':       ['小于', 'Less Than'],
        'greater-equal':   ['大于等于', 'Greater or Equal'],
        'less-equal':      ['小于等于', 'Less or Equal'],
        'range':           ['在范围内', 'In Range'],
        'regex':           ['正则匹配', 'Regex Match'],
        'empty':           ['为空', 'Is Empty'],
        'not-empty':       ['不为空', 'Not Empty']
    };

    function parseCSV(text, delim) {
        const lines = text.split('\n');
        const result = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            const cols = [];
            let current = '';
            let inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (ch === '"') {
                    inQuotes = !inQuotes;
                } else if (ch === delim && !inQuotes) {
                    cols.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
            cols.push(current.trim());
            result.push(cols);
        }
        return result;
    }

    function cleanCell(val) {
        val = val.trim();
        if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
            val = val.slice(1, -1).replace(/""/g, '"');
        }
        return val;
    }

    function loadColumns() {
        const text = input.value.trim();
        if (!text) {
            statsEl.textContent = T('请输入 CSV 数据', 'Please enter CSV data');
            statsEl.style.color = '#e74c3c';
            return;
        }

        const delim = delimiter.value || ',';
        hasHeader = headerCheck.checked;
        parsedData = parseCSV(text, delim);

        if (parsedData.length === 0) {
            statsEl.textContent = T('无法解析 CSV 数据', 'Could not parse CSV data');
            statsEl.style.color = '#e74c3c';
            return;
        }

        if (hasHeader) {
            headers = parsedData[0].map(h => cleanCell(h));
            // Use column indices as data rows
        } else {
            headers = [];
            const maxCols = Math.max(...parsedData.map(r => r.length));
            for (let i = 0; i < maxCols; i++) {
                headers.push(T('列 ' + (i + 1), 'Column ' + (i + 1)));
            }
        }

        // Populate column selector
        columnSel.innerHTML = '';
        headers.forEach(function(h, idx) {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = h;
            columnSel.appendChild(opt);
        });

        columnSel.disabled = false;
        operatorSel.disabled = false;
        valueInput.disabled = false;
        filterBtn.disabled = false;

        statsEl.textContent = T(
            '已加载 ' + parsedData.length + ' 行，' + headers.length + ' 列',
            'Loaded ' + parsedData.length + ' rows, ' + headers.length + ' columns'
        );
        statsEl.style.color = 'var(--text-dim)';
    }

    function filterRows() {
        if (parsedData.length === 0) {
            loadColumns();
            if (parsedData.length === 0) return;
        }

        const colIdx = parseInt(columnSel.value);
        const operator = operatorSel.value;
        const rawValue = valueInput.value.trim();

        // For empty/not-empty, value is not needed
        if (operator !== 'empty' && operator !== 'not-empty' && !rawValue) {
            statsEl.textContent = T('请输入过滤值', 'Please enter a filter value');
            statsEl.style.color = '#e74c3c';
            return;
        }

        // Get data rows (skip header if hasHeader)
        const dataRows = hasHeader ? parsedData.slice(1) : parsedData;
        const matched = [];

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            let cellValue = '';
            if (colIdx < row.length) {
                cellValue = cleanCell(row[colIdx]);
            }

            let match = false;

            switch (operator) {
                case 'equals':
                    match = cellValue === rawValue;
                    break;
                case 'not-equals':
                    match = cellValue !== rawValue;
                    break;
                case 'contains':
                    match = cellValue.toLowerCase().includes(rawValue.toLowerCase());
                    break;
                case 'starts-with':
                    match = cellValue.toLowerCase().startsWith(rawValue.toLowerCase());
                    break;
                case 'ends-with':
                    match = cellValue.toLowerCase().endsWith(rawValue.toLowerCase());
                    break;
                case 'greater-than': {
                    const num = parseFloat(cellValue);
                    const val = parseFloat(rawValue);
                    match = !isNaN(num) && !isNaN(val) && num > val;
                    break;
                }
                case 'less-than': {
                    const num = parseFloat(cellValue);
                    const val = parseFloat(rawValue);
                    match = !isNaN(num) && !isNaN(val) && num < val;
                    break;
                }
                case 'greater-equal': {
                    const num = parseFloat(cellValue);
                    const val = parseFloat(rawValue);
                    match = !isNaN(num) && !isNaN(val) && num >= val;
                    break;
                }
                case 'less-equal': {
                    const num = parseFloat(cellValue);
                    const val = parseFloat(rawValue);
                    match = !isNaN(num) && !isNaN(val) && num <= val;
                    break;
                }
                case 'range': {
                    const parts = rawValue.split(/[,;-]/).map(s => s.trim()).filter(Boolean);
                    if (parts.length === 2) {
                        const num = parseFloat(cellValue);
                        const min = parseFloat(parts[0]);
                        const max = parseFloat(parts[1]);
                        match = !isNaN(num) && !isNaN(min) && !isNaN(max) && num >= min && num <= max;
                    }
                    break;
                }
                case 'regex': {
                    try {
                        const re = new RegExp(rawValue, 'i');
                        match = re.test(cellValue);
                    } catch(e) {
                        statsEl.textContent = T('正则表达式错误: ' + e.message, 'Regex error: ' + e.message);
                        statsEl.style.color = '#e74c3c';
                        return;
                    }
                    break;
                }
                case 'empty':
                    match = cellValue === '';
                    break;
                case 'not-empty':
                    match = cellValue !== '';
                    break;
            }

            if (match) {
                // Include header if hasHeader
                if (hasHeader) {
                    matched.push(parsedData[0].join(delimiter.value || ','));
                    hasHeader = false; // Only add header once
                }
                matched.push(row.join(delimiter.value || ','));
            }
        }

        // Reset hasHeader flag for next filter
        hasHeader = headerCheck.checked;

        output.value = matched.join('\n');

        statsEl.style.color = 'var(--text-dim)';
        const colName = headers[colIdx] || T('列 ' + (colIdx + 1), 'Column ' + (colIdx + 1));
        statsEl.textContent = T(
            '在列 "' + colName + '" 上过滤: ' + matched.length + ' 行匹配（共 ' + dataRows.length + ' 行）',
            'Filtered on column "' + colName + '": ' + matched.length + ' rows matched (of ' + dataRows.length + ')'
        );
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        delimiter.value = ',';
        headerCheck.checked = true;
        columnSel.innerHTML = '<option value="">' + T('先加载数据', 'Load data first') + '</option>';
        columnSel.disabled = true;
        operatorSel.disabled = true;
        valueInput.value = '';
        valueInput.disabled = true;
        filterBtn.disabled = true;
        statsEl.textContent = '';
        headers = [];
        parsedData = [];
        hasHeader = true;
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

    // Auto-load columns when input changes (debounced)
    let loadTimer = null;
    input.addEventListener('input', function() {
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(loadColumns, 500);
    });

    // Delimiter change triggers re-load
    delimiter.addEventListener('change', loadColumns);
    headerCheck.addEventListener('change', loadColumns);

    filterBtn.addEventListener('click', filterRows);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);

    // Enter key in value input
    valueInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') filterRows();
    });

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    }
})();