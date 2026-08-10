/**
 * CSV Column Filter - Select, rename, reorder CSV columns
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const input = document.getElementById('ccf-input');
    const output = document.getElementById('ccf-output');
    const loadBtn = document.getElementById('ccf-load');
    const copyBtn = document.getElementById('ccf-copy');
    const clearBtn = document.getElementById('ccf-clear');
    const exportBtn = document.getElementById('ccf-export');
    const selectAllBtn = document.getElementById('ccf-select-all');
    const deselectAllBtn = document.getElementById('ccf-deselect-all');
    const statusEl = document.getElementById('ccf-status');
    const columnsEl = document.getElementById('ccf-columns');
    const delimiter = document.getElementById('ccf-delimiter');
    const headerCheck = document.getElementById('ccf-header');

    if (!input || !output || !loadBtn) return;

    const isEN = document.documentElement.lang === 'en';
    const T = function(zh, en) { return isEN ? en : zh; };

    let csvData = [];
    let headers = [];
    let columnStates = [];

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
            statusEl.textContent = T('请输入 CSV 数据', 'Please enter CSV data');
            return;
        }

        const delim = delimiter.value || ',';
        csvData = parseCSV(text, delim);

        if (csvData.length === 0) {
            statusEl.textContent = T('未解析到有效行', 'No valid rows parsed');
            return;
        }

        if (headerCheck.checked) {
            headers = csvData[0].map(h => cleanCell(h));
            csvData = csvData.slice(1);
        } else {
            headers = csvData[0].map((_, i) => T(`列 ${i+1}`, `Col ${i+1}`));
        }

        if (csvData.length === 0) {
            statusEl.textContent = T('只有表头行，无数据行', 'Header only, no data rows');
            return;
        }

        // Init column states
        columnStates = headers.map((h, i) => ({
            originalIndex: i,
            header: h,
            selected: true,
            newName: h
        }));

        renderColumns();
        statusEl.textContent = T(
            `已加载 ${csvData.length} 行，${headers.length} 列`,
            `Loaded ${csvData.length} rows, ${headers.length} columns`
        );
        exportBtn.disabled = false;
    }

    function renderColumns() {
        let html = '<div style="margin-bottom:8px;font-size:13px;font-weight:600">' +
            T('选择要保留的列（勾选/拖动排序/重命名）', 'Select columns to keep (check/drag/rename)') +
            '</div>';
        html += '<div id="ccf-column-list" style="border:1px solid var(--border);border-radius:6px;overflow:hidden">';
        columnStates.forEach((col, idx) => {
            const checked = col.selected ? 'checked' : '';
            html += `<div class="ccf-col-row" data-index="${idx}" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);cursor:grab;background:var(--bg-secondary)">`;
            html += `<span style="cursor:grab;color:var(--text-dim);font-size:16px;user-select:none">⠿</span>`;
            html += `<input type="checkbox" class="ccf-col-check" data-index="${idx}" ${checked} style="width:16px;height:16px">`;
            html += `<input type="text" class="ccf-col-rename" data-index="${idx}" value="${escapeHtml(col.newName)}" style="flex:1;padding:4px 8px;font-family:Consolas,monospace;font-size:13px;border:1px solid var(--border);border-radius:4px;background:var(--bg)">`;
            html += `<span style="font-size:11px;color:var(--text-dim);white-space:nowrap">${T('原名:', 'orig:')} ${escapeHtml(col.header)}</span>`;
            html += '</div>';
        });
        html += '</div>';
        columnsEl.innerHTML = html;

        // Bind events
        document.querySelectorAll('.ccf-col-check').forEach(el => {
            el.addEventListener('change', function() {
                const idx = parseInt(this.dataset.index);
                columnStates[idx].selected = this.checked;
            });
        });

        document.querySelectorAll('.ccf-col-rename').forEach(el => {
            el.addEventListener('input', function() {
                const idx = parseInt(this.dataset.index);
                columnStates[idx].newName = this.value;
            });
        });

        // Simple drag reorder
        let dragSrcIdx = null;
        document.querySelectorAll('.ccf-col-row').forEach(row => {
            row.addEventListener('dragstart', function(e) {
                dragSrcIdx = parseInt(this.dataset.index);
                this.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });
            row.addEventListener('dragend', function() {
                this.style.opacity = '1';
                dragSrcIdx = null;
            });
            row.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderLeft = '2px solid var(--accent)';
            });
            row.addEventListener('dragleave', function() {
                this.style.borderLeft = '';
            });
            row.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderLeft = '';
                const targetIdx = parseInt(this.dataset.index);
                if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
                    const item = columnStates.splice(dragSrcIdx, 1)[0];
                    columnStates.splice(targetIdx, 0, item);
                    renderColumns();
                }
            });
            row.draggable = true;
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function csvEscape(val) {
        const s = String(val);
        if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function exportSelected() {
        const selectedIndices = [];
        columnStates.forEach((col, idx) => {
            if (col.selected) selectedIndices.push(idx);
        });

        if (selectedIndices.length === 0) {
            statusEl.textContent = T('请至少选择一列', 'Select at least one column');
            return;
        }

        // Build header row
        const headerRow = selectedIndices.map(idx => csvEscape(columnStates[idx].newName)).join(delimiter.value || ',');

        // Build data rows
        const dataRows = csvData.map(row => {
            return selectedIndices.map(idx => {
                const origIdx = columnStates[idx].originalIndex;
                return origIdx < row.length ? csvEscape(cleanCell(row[origIdx])) : '';
            }).join(delimiter.value || ',');
        });

        const result = [headerRow, ...dataRows].join('\n');
        output.value = result;
        statusEl.textContent = T(
            `已导出 ${selectedIndices.length} 列，${csvData.length} 行`,
            `Exported ${selectedIndices.length} columns, ${csvData.length} rows`
        );
    }

    function copyResult() {
        if (!output.value) {
            statusEl.textContent = T('没有可复制的内容', 'Nothing to copy');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            statusEl.textContent = T('已复制到剪贴板', 'Copied to clipboard');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            statusEl.textContent = T('已复制到剪贴板', 'Copied to clipboard');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        statusEl.textContent = '';
        columnsEl.innerHTML = '';
        csvData = [];
        headers = [];
        columnStates = [];
        exportBtn.disabled = true;
    }

    // Event listeners
    loadBtn.addEventListener('click', loadColumns);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);
    exportBtn.addEventListener('click', exportSelected);
    selectAllBtn.addEventListener('click', function() {
        columnStates.forEach(c => c.selected = true);
        document.querySelectorAll('.ccf-col-check').forEach(el => el.checked = true);
    });
    deselectAllBtn.addEventListener('click', function() {
        columnStates.forEach(c => c.selected = false);
        document.querySelectorAll('.ccf-col-check').forEach(el => el.checked = false);
    });
})();