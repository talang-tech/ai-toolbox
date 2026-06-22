/**
 * HTML Table Extractor — Extract table data from HTML to CSV/JSON/Markdown
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('hte-input');
    const extractBtn = document.getElementById('hte-extract-btn');
    const outputFormat = document.getElementById('hte-format');
    const output = document.getElementById('hte-output');
    const copyBtn = document.getElementById('hte-copy-btn');
    const statusEl = document.getElementById('hte-status');
    const previewEl = document.getElementById('hte-preview');

    if (!input || !output) return;

    function $(id) { return document.getElementById(id); }

    function parseHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tables = doc.querySelectorAll('table');
        return tables;
    }

    function extractTable(table) {
        const rows = table.querySelectorAll('tr');
        const data = [];
        for (const row of rows) {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            for (const cell of cells) {
                let text = cell.textContent.trim();
                // Handle colspan: repeat empty columns for colspan > 1
                const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
                rowData.push(text);
                for (let i = 1; i < colspan; i++) {
                    rowData.push('');
                }
            }
            if (rowData.length > 0) {
                data.push(rowData);
            }
        }
        return data;
    }

    function dataToCSV(data) {
        const rows = data.map(row => {
            return row.map(cell => {
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    return '"' + cell.replace(/"/g, '""') + '"';
                }
                return cell;
            }).join(',');
        });
        return rows.join('\n');
    }

    function dataToJSON(data) {
        if (data.length < 2) {
            return JSON.stringify(data.map((row, i) => ({ row: i + 1, values: row })), null, 2);
        }
        // First row as headers
        const headers = data[0];
        const rows = data.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => {
                obj[h || `col${i + 1}`] = row[i] || '';
            });
            return obj;
        });
        return JSON.stringify(rows, null, 2);
    }

    function dataToMarkdown(data) {
        if (data.length === 0) return '';
        const colCount = Math.max(...data.map(r => r.length));
        const rows = data.map(row => {
            while (row.length < colCount) row.push('');
            return '| ' + row.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |';
        });
        const sep = '| ' + Array(colCount).fill('---').join(' | ') + ' |';
        return rows[0] + '\n' + sep + '\n' + rows.slice(1).join('\n');
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function extract() {
        const html = input.value.trim();
        if (!html) {
            statusEl.textContent = '请粘贴包含 HTML 表格的代码';
            statusEl.style.color = 'var(--error, #e74c3c)';
            output.value = '';
            previewEl.innerHTML = '';
            return;
        }

        const tables = parseHTML(html);
        if (tables.length === 0) {
            statusEl.textContent = '未找到任何 HTML <table> 元素';
            statusEl.style.color = 'var(--error, #e74c3c)';
            output.value = '';
            previewEl.innerHTML = '';
            return;
        }

        const fmt = outputFormat.value;
        let result = '';
        let tableCount = tables.length;

        for (let i = 0; i < tableCount; i++) {
            const data = extractTable(tables[i]);
            if (data.length === 0) continue;

            if (tableCount > 1) {
                result += `# Table ${i + 1}\n`;
            }

            if (fmt === 'csv') {
                result += dataToCSV(data);
            } else if (fmt === 'json') {
                result += dataToJSON(data);
            } else if (fmt === 'markdown') {
                result += dataToMarkdown(data);
            }

            if (i < tableCount - 1) {
                result += '\n\n';
            }
        }

        output.value = result;
        statusEl.textContent = `找到 ${tableCount} 个表格，共提取 ${result.split('\n').length} 行数据`;
        statusEl.style.color = 'var(--text-dim, #888)';

        // Show preview of first table
        const firstData = extractTable(tables[0]);
        if (firstData.length > 0) {
            let previewHTML = '<div style="overflow-x:auto;max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:6px">';
            previewHTML += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
            for (let r = 0; r < Math.min(firstData.length, 10); r++) {
                previewHTML += '<tr>';
                const tag = r === 0 ? 'th' : 'td';
                for (const cell of firstData[r]) {
                    previewHTML += `<${tag} style="border:1px solid var(--border);padding:4px 8px;text-align:left">${escapeHTML(cell)}</${tag}>`;
                }
                previewHTML += '</tr>';
            }
            if (firstData.length > 10) {
                previewHTML += '<tr><td colspan="99" style="text-align:center;color:var(--text-muted);padding:8px">... 更多行已省略</td></tr>';
            }
            previewHTML += '</table></div>';
            previewEl.innerHTML = previewHTML;
        }
    }

    extractBtn.addEventListener('click', extract);

    // Auto-extract on Ctrl+Enter
    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            extract();
        }
    });

    copyBtn.addEventListener('click', async () => {
        if (!output.value) return;
        try {
            await navigator.clipboard.writeText(output.value);
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✅ 已复制';
            setTimeout(() => { copyBtn.textContent = orig; }, 1500);
        } catch (e) {
            output.select();
            document.execCommand('copy');
        }
    });

    // Load sample data on first visit
    if (!input.value) {
        input.value = `<!-- 从任何网页复制包含 <table> 的 HTML 代码 -->
<table border="1">
  <tr>
    <th>姓名</th>
    <th>职位</th>
    <th>邮箱</th>
    <th>入职日期</th>
  </tr>
  <tr>
    <td>张三</td>
    <td>高级工程师</td>
    <td>zhangsan@example.com</td>
    <td>2023-06-01</td>
  </tr>
  <tr>
    <td>李四</td>
    <td>产品经理</td>
    <td>lisi@example.com</td>
    <td>2024-01-15</td>
  </tr>
  <tr>
    <td>王五</td>
    <td>设计师</td>
    <td>wangwu@example.com</td>
    <td>2024-03-20</td>
  </tr>
</table>`;
    }

    // Initial extraction
    extract();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();