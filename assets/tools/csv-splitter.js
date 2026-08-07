/**
 * CSV Splitter - Split CSV files into smaller chunks
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('csvs-input');
    const output = document.getElementById('csvs-output');
    const splitBtn = document.getElementById('csvs-split');
    const copyBtn = document.getElementById('csvs-copy');
    const clearBtn = document.getElementById('csvs-clear');
    const statusEl = document.getElementById('csvs-status');
    const statsEl = document.getElementById('csvs-stats');
    const splitModeRows = document.getElementById('csvs-mode-rows');
    const splitModeParts = document.getElementById('csvs-mode-parts');
    const splitValue = document.getElementById('csvs-split-value');
    const hasHeader = document.getElementById('csvs-header');

    if (!input || !output || !splitBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

    function parseCSV(text) {
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
                } else if (ch === ',' && !inQuotes) {
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

    function stringifyCSV(rows) {
        return rows.map(function(row) {
            return row.map(function(cell) {
                if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1 || cell.indexOf('\n') !== -1) {
                    return '"' + cell.replace(/"/g, '""') + '"';
                }
                return cell;
            }).join(',');
        }).join('\n');
    }

    function splitCSV() {
        const text = input.value.trim();
        if (!text) {
            statusEl.textContent = T('请输入 CSV 数据', 'Please enter CSV data');
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        const rows = parseCSV(text);
        if (rows.length === 0) {
            statusEl.textContent = T('未找到有效数据', 'No valid data found');
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        const val = parseInt(splitValue.value.trim());
        if (!val || val < 1) {
            statusEl.textContent = T('请输入有效的分割值', 'Please enter a valid split value');
            return;
        }

        const useRows = splitModeRows ? splitModeRows.checked : true;
        const headerRow = hasHeader ? hasHeader.checked : false;

        let startIdx = 0;
        let header = null;
        if (headerRow && rows.length > 0) {
            header = rows[0];
            startIdx = 1;
        }

        const dataRows = rows.slice(startIdx);
        const totalRows = dataRows.length;

        if (totalRows === 0) {
            statusEl.textContent = T('没有数据行可分割', 'No data rows to split');
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        let chunks = [];
        if (useRows) {
            // Split by rows per chunk
            const rowsPerChunk = val;
            for (let i = 0; i < totalRows; i += rowsPerChunk) {
                chunks.push(dataRows.slice(i, i + rowsPerChunk));
            }
        } else {
            // Split by number of parts
            const numParts = Math.min(val, totalRows);
            const baseSize = Math.floor(totalRows / numParts);
            const remainder = totalRows % numParts;
            let start = 0;
            for (let i = 0; i < numParts; i++) {
                const size = baseSize + (i < remainder ? 1 : 0);
                chunks.push(dataRows.slice(start, start + size));
                start += size;
            }
        }

        // Build output: each chunk separated by a comment line
        const resultParts = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const partRows = [];
            if (header) partRows.push(header);
            for (let j = 0; j < chunk.length; j++) {
                partRows.push(chunk[j]);
            }
            const headerLine = isEN
                ? `# === Part ${i + 1}/${chunks.length} (${chunk.length} rows) ===`
                : `# === 第 ${i + 1}/${chunks.length} 部分 (${chunk.length} 行) ===`;
            resultParts.push(headerLine);
            resultParts.push(stringifyCSV(partRows));
        }

        output.value = resultParts.join('\n\n');

        // Stats
        if (isEN) {
            statusEl.textContent = 'Split complete';
            if (statsEl) {
                statsEl.textContent = `Total: ${totalRows} data rows | Parts: ${chunks.length} | Avg: ${Math.round(totalRows / chunks.length)} rows/part`;
            }
        } else {
            statusEl.textContent = '分割完成';
            if (statsEl) {
                statsEl.textContent = `总计: ${totalRows} 行数据 | 分割: ${chunks.length} 份 | 平均: ${Math.round(totalRows / chunks.length)} 行/份`;
            }
        }
    }

    // Split button
    splitBtn.addEventListener('click', splitCSV);

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

    // Mode toggle
    if (splitModeRows) {
        splitModeRows.addEventListener('change', function() {
            splitValue.placeholder = isEN ? 'e.g. 100' : '例如 100';
        });
    }
    if (splitModeParts) {
        splitModeParts.addEventListener('change', function() {
            splitValue.placeholder = isEN ? 'e.g. 5' : '例如 5';
        });
    }
})();