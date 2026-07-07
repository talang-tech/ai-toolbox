/**
 * CSV Editor - Pure JS inline CSV table editor
 * Zero dependencies, fully local
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('ceInput');
    const parseBtn = document.getElementById('ceParse');
    const table = document.getElementById('ceTable');
    const output = document.getElementById('ceOutput');
    const copyBtn = document.getElementById('ceCopy');
    const downloadBtn = document.getElementById('ceDownload');
    const addRowBtn = document.getElementById('ceAddRow');
    const addColBtn = document.getElementById('ceAddCol');
    const delRowBtn = document.getElementById('ceDelRow');
    const delColBtn = document.getElementById('ceDelCol');
    const statsEl = document.getElementById('ceStats');

    if (!input || !table || !output) return;

    let data = [];
    let headerRow = true;

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (inQuotes) {
                if (c === '"') {
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += c;
                }
            } else if (c === '"') {
                inQuotes = true;
            } else if (c === ',') {
                result.push(current.trim());
                current = '';
            } else {
                current += c;
            }
        }
        result.push(current.trim());
        return result;
    }

    function toCSVCell(value) {
        if (value === null || value === undefined) return '';
        const s = String(value);
        if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function rowToCSV(row) {
        return row.map(toCSVCell).join(',');
    }

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) return [];
        return lines.map(parseCSVLine);
    }

    function normalizeData(parsed) {
        if (parsed.length === 0) return [];
        const maxCols = parsed.reduce((m, r) => Math.max(m, r.length), 0);
        return parsed.map(r => {
            while (r.length < maxCols) r.push('');
            return r;
        });
    }

    function renderTable() {
        if (data.length === 0) {
            table.innerHTML = '';
            output.value = '';
            if (statsEl) statsEl.textContent = '';
            return;
        }

        let html = '';
        // Header
        if (headerRow && data.length > 0) {
            html += '<thead><tr>';
            data[0].forEach((cell, ci) => {
                html += `<th><input type="text" value="${escapeHtml(cell)}" data-r="0" data-c="${ci}" class="ce-header-input" placeholder="Col ${ci + 1}"></th>`;
            });
            html += '</tr></thead><tbody>';
            for (let ri = 1; ri < data.length; ri++) {
                html += '<tr>';
                data[ri].forEach((cell, ci) => {
                    html += `<td><input type="text" value="${escapeHtml(cell)}" data-r="${ri}" data-c="${ci}" class="ce-cell-input" placeholder="—"></td>`;
                });
                html += '</tr>';
            }
            html += '</tbody>';
        } else {
            html += '<tbody>';
            data.forEach((row, ri) => {
                html += '<tr>';
                row.forEach((cell, ci) => {
                    html += `<td><input type="text" value="${escapeHtml(cell)}" data-r="${ri}" data-c="${ci}" class="ce-cell-input"></td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
        }

        table.innerHTML = html;

        // Attach input handlers
        table.querySelectorAll('.ce-cell-input, .ce-header-input').forEach(inputEl => {
            inputEl.addEventListener('input', onCellEdit);
        });

        updateOutput();
    }

    function escapeHtml(s) {
        if (typeof s !== 'string') return '';
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function onCellEdit(e) {
        const inputEl = e.target;
        const ri = parseInt(inputEl.dataset.r);
        const ci = parseInt(inputEl.dataset.c);
        if (ri >= 0 && ri < data.length && ci >= 0 && ci < data[ri].length) {
            data[ri][ci] = inputEl.value;
            updateOutput();
        }
    }

    function updateOutput() {
        const csvLines = data.map(rowToCSV);
        output.value = csvLines.join('\n');
        if (statsEl) {
            const rows = data.length;
            const cols = data.length > 0 ? data[0].length : 0;
            statsEl.textContent = `📊 ${rows} 行 × ${cols} 列`;
        }
    }

    function loadCSV(text) {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
            toast('请输入有效的 CSV 数据');
            return;
        }
        data = normalizeData(parsed);
        renderTable();
        toast(`已解析 ${data.length} 行`);
    }

    // Parse button
    if (parseBtn) {
        parseBtn.addEventListener('click', () => {
            if (!input.value.trim()) {
                toast('请先输入 CSV 数据');
                return;
            }
            loadCSV(input.value);
        });
    }

    // Auto-parse sample + paste
    input.addEventListener('paste', () => {
        setTimeout(() => {
            if (input.value.trim()) loadCSV(input.value);
        }, 50);
    });

    // Add Row
    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => {
            if (data.length === 0) {
                // Create initial 3x3
                data = [['', '', ''], ['', '', ''], ['', '', '']];
                renderTable();
                toast('已创建新表格');
                return;
            }
            const cols = data[0].length;
            const newRow = new Array(cols).fill('');
            data.push(newRow);
            renderTable();
            toast('已添加新行');
        });
    }

    // Add Column
    if (addColBtn) {
        addColBtn.addEventListener('click', () => {
            if (data.length === 0) {
                data = [['', '', ''], ['', '', ''], ['', '', '']];
                renderTable();
                toast('已创建新表格');
                return;
            }
            data.forEach(row => row.push(''));
            renderTable();
            toast('已添加新列');
        });
    }

    // Remove Last Row
    if (delRowBtn) {
        delRowBtn.addEventListener('click', () => {
            if (data.length <= 1) {
                toast('至少保留一行');
                return;
            }
            data.pop();
            renderTable();
            toast('已删除最后一行');
        });
    }

    // Remove Last Column
    if (delColBtn) {
        delColBtn.addEventListener('click', () => {
            if (data.length === 0 || data[0].length <= 1) {
                toast('至少保留一列');
                return;
            }
            data.forEach(row => row.pop());
            renderTable();
            toast('已删除最后一列');
        });
    }

    // Copy
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!output.value) {
                toast('没有可复制的内容');
                return;
            }
            try {
                await navigator.clipboard.writeText(output.value);
                toast('已复制 CSV');
            } catch {
                output.select();
                document.execCommand('copy');
                toast('已复制 CSV');
            }
        });
    }

    // Download
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!output.value) {
                toast('没有可下载的内容');
                return;
            }
            const blob = new Blob(['\ufeff' + output.value], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'csv-editor-output.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast('CSV 文件已下载');
        });
    }

    // Load initial sample if input has content
    if (input.value.trim()) {
        loadCSV(input.value);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();