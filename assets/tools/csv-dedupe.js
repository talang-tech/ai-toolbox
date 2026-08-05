/**
 * CSV Deduplicate - Remove duplicate rows from CSV
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('cdd-input');
    const output = document.getElementById('cdd-output');
    const dedupBtn = document.getElementById('cdd-dedup');
    const copyBtn = document.getElementById('cdd-copy');
    const clearBtn = document.getElementById('cdd-clear');
    const statusEl = document.getElementById('cdd-status');
    const statsEl = document.getElementById('cdd-stats');
    const allCols = document.getElementById('cdd-all-cols');
    const colSelect = document.getElementById('cdd-col-select');
    const keepFirst = document.getElementById('cdd-keep-first');
    const keepLast = document.getElementById('cdd-keep-last');
    const hasHeader = document.getElementById('cdd-header');

    if (!input || !output || !dedupBtn) return;

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

    function deduplicate() {
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

        const useAll = allCols ? allCols.checked : true;
        const keepFirstRow = keepFirst ? keepFirst.checked : true;
        const headerRow = hasHeader ? hasHeader.checked : false;

        let startIdx = 0;
        let header = null;
        if (headerRow && rows.length > 0) {
            header = rows[0];
            startIdx = 1;
        }

        const dataRows = rows.slice(startIdx);

        // Determine column indices to compare
        let colIndices = [];
        if (useAll) {
            colIndices = null; // compare all columns
        } else {
            const colStr = colSelect ? colSelect.value.trim() : '';
            if (colStr) {
                const parts = colStr.split(',');
                for (let i = 0; i < parts.length; i++) {
                    const p = parseInt(parts[i].trim());
                    if (!isNaN(p) && p >= 0) colIndices.push(p);
                }
            }
            if (colIndices.length === 0) {
                statusEl.textContent = T('请输入有效的列索引（从0开始，逗号分隔）', 'Enter valid column indices (0-based, comma-separated)');
                return;
            }
        }

        // Deduplicate
        const seen = new Set();
        const unique = [];
        const dupCount = { count: 0 };

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            let key;
            if (colIndices === null) {
                key = row.join('|');
            } else {
                key = colIndices.map(function(idx) { return idx < row.length ? row[idx] : ''; }).join('|');
            }

            if (keepFirstRow) {
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(row);
                } else {
                    dupCount.count++;
                }
            } else {
                // Keep last: remove previous entry and add this one
                if (seen.has(key)) {
                    // Find and remove the previous occurrence
                    for (let j = unique.length - 1; j >= 0; j--) {
                        let existingKey;
                        if (colIndices === null) {
                            existingKey = unique[j].join('|');
                        } else {
                            existingKey = colIndices.map(function(idx) { return idx < unique[j].length ? unique[j][idx] : ''; }).join('|');
                        }
                        if (existingKey === key) {
                            unique.splice(j, 1);
                            dupCount.count++;
                            break;
                        }
                    }
                }
                unique.push(row);
            }
        }

        // Build result
        const result = [];
        if (header) result.push(header);
        for (let i = 0; i < unique.length; i++) {
            result.push(unique[i]);
        }

        output.value = stringifyCSV(result);

        // Status
        const totalData = dataRows.length;
        const uniqueCount = unique.length;
        const removed = totalData - uniqueCount;
        const percent = totalData > 0 ? ((removed / totalData) * 100).toFixed(1) : '0';

        if (isEN) {
            statusEl.textContent = 'Deduplication complete';
            if (statsEl) {
                statsEl.textContent = `Original: ${totalData} rows | After dedup: ${uniqueCount} rows | Removed: ${removed} (${percent}%)`;
            }
        } else {
            statusEl.textContent = '去重完成';
            if (statsEl) {
                statsEl.textContent = `去重前: ${totalData} 行 | 去重后: ${uniqueCount} 行 | 移除: ${removed} 行 (${percent}%)`;
            }
        }
    }

    // All columns checkbox toggle
    if (allCols && colSelect) {
        allCols.addEventListener('change', function() {
            colSelect.disabled = this.checked;
        });
    }

    // Keep first/last radio
    if (keepFirst && keepLast) {
        keepFirst.addEventListener('change', deduplicate);
        keepLast.addEventListener('change', deduplicate);
    }

    // Has header
    if (hasHeader) {
        hasHeader.addEventListener('change', deduplicate);
    }

    // Dedup button
    dedupBtn.addEventListener('click', deduplicate);

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