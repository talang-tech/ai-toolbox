// CSV to HTML Table Converter
(function () {
  const input = document.getElementById('csv2html-input');
  const output = document.getElementById('csv2html-output');
  const preview = document.getElementById('csv2html-preview');
  const btn = document.getElementById('csv2html-convert');
  const copyBtn = document.getElementById('csv2html-copy');
  const downloadBtn = document.getElementById('csv2html-download');
  const clearBtn = document.getElementById('csv2html-clear');
  const status = document.getElementById('csv2html-status');

  const delimSelect = document.getElementById('csv2html-delimiter');
  const hasHeader = document.getElementById('csv2html-header');
  const outputFormat = document.getElementById('csv2html-format');
  const trimCheck = document.getElementById('csv2html-trim');
  const classInput = document.getElementById('csv2html-class');
  const stripedCheck = document.getElementById('csv2html-striped');
  const borderedCheck = document.getElementById('csv2html-bordered');

  const isEN = document.documentElement.lang === 'en';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseCSV(text, delimiter, trim) {
    const rows = [];
    const lines = text.split(/\r?\n/);
    let inQuotes = false;
    let currentRow = [];
    let currentCell = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const ch = line[j];
        if (ch === '"') {
          if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
            currentCell += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          currentRow.push(trim ? currentCell.trim() : currentCell);
          currentCell = '';
        } else {
          currentCell += ch;
        }
      }
      if (!inQuotes) {
        currentRow.push(trim ? currentCell.trim() : currentCell);
        currentCell = '';
        // Only add non-empty rows or lines that have content
        if (currentRow.length > 0 && currentRow.some(c => c.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        // Multi-line quoted field
        currentCell += '\n';
      }
    }
    // Handle last line without trailing newline
    if (currentRow.length > 0 || currentCell) {
      currentRow.push(trim ? currentCell.trim() : currentCell);
      if (currentRow.some(c => c.trim())) {
        rows.push(currentRow);
      }
    }
    return rows;
  }

  function normalizeRows(rows) {
    if (!rows.length) return rows;
    const maxCols = Math.max(...rows.map(r => r.length));
    return rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });
  }

  function generateTableHtml(rows, header, format, cls, striped, bordered) {
    if (!rows.length) return '';

    rows = normalizeRows(rows);
    let html = '';
    const tableClass = [];
    if (cls && cls.trim()) tableClass.push(cls.trim());
    if (striped) tableClass.push('striped');
    if (bordered) tableClass.push('bordered');
    const classAttr = tableClass.length ? ` class="${tableClass.join(' ')}"` : '';

    if (format === 'compact') {
      // Compact: no newlines
      html += `<table${classAttr}>`;
      if (header && rows.length > 0) {
        html += '<thead><tr>' + rows[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr></thead>';
        if (rows.length > 1) {
          html += '<tbody>' + rows.slice(1).map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
        }
      } else {
        html += '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
      }
      html += '</table>';
    } else {
      // Pretty: indented
      html += `<table${classAttr}>\n`;
      if (header && rows.length > 0) {
        html += '  <thead>\n    <tr>' + rows[0].map(c => `\n      <th>${escapeHtml(c)}</th>`).join('') + '\n    </tr>\n  </thead>\n';
        if (rows.length > 1) {
          html += '  <tbody>\n';
          rows.slice(1).forEach(r => {
            html += '    <tr>' + r.map(c => `\n      <td>${escapeHtml(c)}</td>`).join('') + '\n    </tr>\n';
          });
          html += '  </tbody>\n';
        }
      } else {
        html += '  <tbody>\n';
        rows.forEach(r => {
          html += '    <tr>' + r.map(c => `\n      <td>${escapeHtml(c)}</td>`).join('') + '\n    </tr>\n';
        });
        html += '  </tbody>\n';
      }
      html += '</table>';
    }

    return html;
  }

  function convert() {
    if (!input || !output) return;
    const text = input.value.trim();
    if (!text) {
      output.value = '';
      if (preview) preview.innerHTML = '';
      if (status) status.textContent = isEN ? 'Paste CSV data and click Convert' : '粘贴 CSV 数据后点击转换';
      return;
    }

    try {
      const delimiter = delimSelect ? delimSelect.value : ',';
      const header = hasHeader ? hasHeader.checked : true;
      const format = outputFormat ? outputFormat.value : 'pretty';
      const trim = trimCheck ? trimCheck.checked : true;
      const cls = classInput ? classInput.value : '';
      const striped = stripedCheck ? stripedCheck.checked : false;
      const bordered = borderedCheck ? borderedCheck.checked : false;

      const rows = parseCSV(text, delimiter, trim);
      if (!rows.length) {
        output.value = '';
        preview.innerHTML = '';
        if (status) status.textContent = isEN ? '✗ No data rows found' : '✗ 未找到数据行';
        return;
      }

      const html = generateTableHtml(rows, header, format, cls, striped, bordered);
      output.value = html;

      // Render preview
      if (preview) {
        const normalized = normalizeRows(rows);
        const previewClass = [];
        if (striped) previewClass.push('striped');
        if (bordered) previewClass.push('bordered');
        const pClass = previewClass.length ? ` class="${previewClass.join(' ')}"` : '';
        let pHtml = `<table${pClass}>`;
        if (header && normalized.length > 0) {
          pHtml += '<thead><tr>' + normalized[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr></thead>';
          if (normalized.length > 1) {
            pHtml += '<tbody>' + normalized.slice(1).map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
          }
        } else {
          pHtml += '<tbody>' + normalized.map(r => '<tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
        }
        pHtml += '</table>';
        preview.innerHTML = pHtml;
      }

      const rowCount = rows.length;
      const colCount = Math.max(...rows.map(r => r.length));
      if (status) {
        status.textContent = isEN
          ? `✓ ${rowCount} rows × ${colCount} columns — HTML table generated`
          : `✓ ${rowCount} 行 × ${colCount} 列 — HTML 表格已生成`;
      }
    } catch (e) {
      output.value = '';
      preview.innerHTML = '';
      if (status) status.textContent = isEN ? `✗ Error: ${e.message}` : `✗ 错误: ${e.message}`;
    }
  }

  function copy() {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      if (status) status.textContent = isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板';
    }).catch(() => {
      if (status) status.textContent = isEN ? '✗ Copy failed' : '✗ 复制失败';
    });
  }

  function download() {
    if (!output.value) return;
    const blob = new Blob([output.value], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    preview.innerHTML = '';
    if (status) status.textContent = '';
  }

  function loadSample() {
    input.value = `Name,Email,Role,Department
Alice Johnson,alice@example.com,Engineer,Engineering
Bob Smith,bob@example.com,Designer,Design
Carol Williams,carol@example.com,PM,Product
David Brown,david@example.com,Developer,Engineering`;
  }

  if (btn) btn.addEventListener('click', convert);
  if (copyBtn) copyBtn.addEventListener('click', copy);
  if (downloadBtn) downloadBtn.addEventListener('click', download);
  if (clearBtn) clearBtn.addEventListener('click', clearAll);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { convert(); }
    });
  }

  if (delimSelect) delimSelect.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (hasHeader) hasHeader.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (outputFormat) outputFormat.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (trimCheck) trimCheck.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (stripedCheck) stripedCheck.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (borderedCheck) borderedCheck.addEventListener('change', () => { if (input && input.value.trim()) convert(); });

  // Load sample
  loadSample();
  setTimeout(convert, 150);
})();