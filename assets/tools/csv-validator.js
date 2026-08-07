/**
 * CSV Validator - Validate CSV data for format errors, inconsistencies, and quality issues
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('csvv-input');
    const output = document.getElementById('csvv-output');
    const validateBtn = document.getElementById('csvv-validate');
    const copyBtn = document.getElementById('csvv-copy');
    const clearBtn = document.getElementById('csvv-clear');
    const statusEl = document.getElementById('csvv-status');
    const statsEl = document.getElementById('csvv-stats');
    const checkHeader = document.getElementById('csvv-check-header');
    const checkTypes = document.getElementById('csvv-check-types');
    const checkQuotes = document.getElementById('csvv-check-quotes');
    const checkEmpty = document.getElementById('csvv-check-empty');
    const delimiter = document.getElementById('csvv-delimiter');

    if (!input || !output || !validateBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

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
                } else if ((ch === delim || ch === ',') && !inQuotes) {
                    cols.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
            cols.push(current.trim());
            result.push({ line: i + 1, cols: cols, raw: line });
        }
        return result;
    }

    function tryParseNumber(s) {
        s = s.replace(/^["\s]+|["\s]+$/g, '');
        if (s === '') return false;
        // Remove thousands separators
        s = s.replace(/,/g, '');
        return !isNaN(parseFloat(s)) && isFinite(s);
    }

    function tryParseDate(s) {
        s = s.replace(/^["\s]+|["\s]+$/g, '');
        // Common date patterns
        const patterns = [
            /^\d{4}-\d{2}-\d{2}$/,
            /^\d{4}\/\d{2}\/\d{2}$/,
            /^\d{2}-\d{2}-\d{4}$/,
            /^\d{2}\/\d{2}\/\d{4}$/,
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
        ];
        for (let i = 0; i < patterns.length; i++) {
            if (patterns[i].test(s)) return true;
        }
        return false;
    }

    function validate() {
        const text = input.value.trim();
        if (!text) {
            statusEl.textContent = T('请输入 CSV 数据', 'Please enter CSV data');
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        const delim = delimiter ? delimiter.value.trim() : ',';
        const actualDelim = delim || ',';

        const rows = parseCSV(text, actualDelim);
        if (rows.length === 0) {
            statusEl.textContent = T('未找到有效数据', 'No valid data found');
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        const doCheckHeader = checkHeader ? checkHeader.checked : true;
        const doCheckTypes = checkTypes ? checkTypes.checked : true;
        const doCheckQuotes = checkQuotes ? checkQuotes.checked : true;
        const doCheckEmpty = checkEmpty ? checkEmpty.checked : true;

        const errors = [];
        const warnings = [];
        const info = [];

        // Determine expected column count from first row
        const expectedCols = rows[0].cols.length;
        info.push(T('检测到 ' + expectedCols + ' 列', 'Detected ' + expectedCols + ' columns'));

        // Check header row
        if (doCheckHeader) {
            const headerCols = rows[0].cols;
            // Check for empty headers
            for (let i = 0; i < headerCols.length; i++) {
                const h = headerCols[i].replace(/^["\s]+|["\s]+$/g, '');
                if (h === '') {
                    errors.push(T('表头第 ' + (i + 1) + ' 列为空', 'Header column ' + (i + 1) + ' is empty'));
                }
            }
            // Check for duplicate headers
            const seen = {};
            for (let i = 0; i < headerCols.length; i++) {
                const h = headerCols[i].toLowerCase().replace(/^["\s]+|["\s]+$/g, '');
                if (h && seen[h] !== undefined) {
                    warnings.push(T('重复的列名: "' + headerCols[i] + '" (第 ' + (seen[h] + 1) + ' 列和第 ' + (i + 1) + ' 列)', 'Duplicate column name: "' + headerCols[i] + '" (col ' + (seen[h] + 1) + ' and col ' + (i + 1) + ')'));
                }
                seen[h] = i;
            }
            // Check for non-alphanumeric characters in headers
            for (let i = 0; i < headerCols.length; i++) {
                const h = headerCols[i].replace(/^["\s]+|["\s]+$/g, '');
                if (h && /[^a-zA-Z0-9_\u4e00-\u9fff]/.test(h)) {
                    warnings.push(T('列名 "' + h + '" 包含特殊字符，可能导致某些程序解析问题', 'Column name "' + h + '" contains special characters, may cause parsing issues'));
                }
            }
        }

        // Check each data row
        let maxCols = expectedCols;
        let minCols = expectedCols;
        let emptyCells = 0;
        let totalCells = 0;
        let numericCells = 0;
        let dateCells = 0;
        let textCells = 0;

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const colCount = row.cols.length;

            if (colCount !== expectedCols) {
                if (colCount > expectedCols) {
                    errors.push(T('第 ' + row.line + ' 行: 有 ' + colCount + ' 列，超出预期的 ' + expectedCols + ' 列', 'Row ' + row.line + ': ' + colCount + ' columns, expected ' + expectedCols));
                } else {
                    errors.push(T('第 ' + row.line + ' 行: 只有 ' + colCount + ' 列，少于预期的 ' + expectedCols + ' 列', 'Row ' + row.line + ': ' + colCount + ' columns, expected ' + expectedCols));
                }
            }

            if (colCount > maxCols) maxCols = colCount;
            if (colCount < minCols) minCols = colCount;

            // Check each cell
            for (let c = 0; c < colCount; c++) {
                const cell = row.cols[c];
                totalCells++;

                if (doCheckEmpty) {
                    const clean = cell.replace(/^["\s]+|["\s]+$/g, '');
                    if (clean === '') {
                        emptyCells++;
                        if (r > 0) {
                            warnings.push(T('第 ' + row.line + ' 行第 ' + (c + 1) + ' 列为空', 'Row ' + row.line + ', col ' + (c + 1) + ' is empty'));
                        }
                    }
                }

                // Type detection (skip header row for type checking)
                if (doCheckTypes && r > 0) {
                    const clean = cell.replace(/^["\s]+|["\s]+$/g, '');
                    if (clean !== '') {
                        if (tryParseNumber(clean)) {
                            numericCells++;
                        } else if (tryParseDate(clean)) {
                            dateCells++;
                        } else {
                            textCells++;
                        }
                    }
                }
            }

            // Check for unbalanced quotes
            if (doCheckQuotes) {
                const quoteCount = (row.raw.match(/"/g) || []).length;
                if (quoteCount % 2 !== 0) {
                    errors.push(T('第 ' + row.line + ' 行: 引号不匹配', 'Row ' + row.line + ': unbalanced quotes'));
                }
            }
        }

        // Check for empty file
        if (rows.length <= 1 && doCheckEmpty) {
            info.push(T('只有表头行，没有数据行', 'Only header row, no data rows'));
        }

        // Check for trailing comma issues
        for (let r = 0; r < rows.length; r++) {
            const raw = rows[r].raw;
            if (raw.endsWith(',') || raw.endsWith(actualDelim)) {
                warnings.push(T('第 ' + rows[r].line + ' 行: 末尾有逗号，可能产生空列', 'Row ' + rows[r].line + ': trailing delimiter, may create empty column'));
            }
        }

        // Build output
        const resultParts = [];

        // Summary
        const summaryLines = [];
        if (isEN) {
            summaryLines.push('=== CSV Validation Report ===');
            summaryLines.push('Total rows: ' + rows.length + ' (including header)');
            summaryLines.push('Expected columns: ' + expectedCols);
            summaryLines.push('Column range: ' + minCols + ' - ' + maxCols);
            summaryLines.push('Errors: ' + errors.length + ' | Warnings: ' + warnings.length + ' | Info: ' + info.length);
            if (doCheckTypes && rows.length > 1) {
                summaryLines.push('Cell types: ' + numericCells + ' numeric, ' + dateCells + ' date, ' + textCells + ' text');
            }
            if (doCheckEmpty) {
                summaryLines.push('Empty cells: ' + emptyCells + ' / ' + totalCells + ' (' + (totalCells > 0 ? ((emptyCells / totalCells) * 100).toFixed(1) : '0') + '%)');
            }
        } else {
            summaryLines.push('=== CSV 验证报告 ===');
            summaryLines.push('总行数: ' + rows.length + '（含表头）');
            summaryLines.push('预期列数: ' + expectedCols);
            summaryLines.push('列数范围: ' + minCols + ' - ' + maxCols);
            summaryLines.push('错误: ' + errors.length + ' | 警告: ' + warnings.length + ' | 信息: ' + info.length);
            if (doCheckTypes && rows.length > 1) {
                summaryLines.push('单元格类型: ' + numericCells + ' 数字, ' + dateCells + ' 日期, ' + textCells + ' 文本');
            }
            if (doCheckEmpty) {
                summaryLines.push('空单元格: ' + emptyCells + ' / ' + totalCells + ' (' + (totalCells > 0 ? ((emptyCells / totalCells) * 100).toFixed(1) : '0') + '%)');
            }
        }

        resultParts.push(summaryLines.join('\n'));

        // Errors
        if (errors.length > 0) {
            resultParts.push('\n' + (isEN ? '--- ERRORS ---' : '--- 错误 ---'));
            for (let i = 0; i < errors.length; i++) {
                resultParts.push('  [ERROR] ' + errors[i]);
            }
        }

        // Warnings
        if (warnings.length > 0) {
            resultParts.push('\n' + (isEN ? '--- WARNINGS ---' : '--- 警告 ---'));
            for (let i = 0; i < warnings.length; i++) {
                resultParts.push('  [WARN] ' + warnings[i]);
            }
        }

        // Info
        if (info.length > 0) {
            resultParts.push('\n' + (isEN ? '--- INFO ---' : '--- 信息 ---'));
            for (let i = 0; i < info.length; i++) {
                resultParts.push('  [INFO] ' + info[i]);
            }
        }

        output.value = resultParts.join('\n');

        // Status
        if (isEN) {
            statusEl.textContent = 'Validation complete';
            if (statsEl) {
                const verdict = errors.length === 0 && warnings.length === 0
                    ? T('✅ CSV 格式良好！', '✅ CSV looks good!')
                    : T('⚠️ 发现 ' + errors.length + ' 个错误，' + warnings.length + ' 个警告', '⚠️ Found ' + errors.length + ' errors, ' + warnings.length + ' warnings');
                statsEl.textContent = verdict;
            }
        } else {
            statusEl.textContent = '验证完成';
            if (statsEl) {
                const verdict = errors.length === 0 && warnings.length === 0
                    ? '✅ CSV 格式良好！'
                    : '⚠️ 发现 ' + errors.length + ' 个错误，' + warnings.length + ' 个警告';
                statsEl.textContent = verdict;
            }
        }
    }

    // Validate button
    validateBtn.addEventListener('click', validate);

    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const text = output.value;
            if (!text) return;
            navigator.clipboard.writeText(text).then(function() {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.textContent = T('已复制!', 'Copied!');
                    toast.classList.add('show');
                    setTimeout(function() { toast.classList.remove('show'); }, 1800);
                }
            });
        });
    }

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            input.value = '';
            output.value = '';
            if (statusEl) statusEl.textContent = '';
            if (statsEl) statsEl.textContent = '';
        });
    }
})();