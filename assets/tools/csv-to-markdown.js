// CSV to Markdown Table Converter
(function () {
  const input = document.getElementById('csv2md-input');
  const output = document.getElementById('csv2md-output');
  const preview = document.getElementById('csv2md-preview');
  const btn = document.getElementById('csv2md-convert');
  const copyBtn = document.getElementById('csv2md-copy');
  const downloadBtn = document.getElementById('csv2md-download');
  const clearBtn = document.getElementById('csv2md-clear');
  const status = document.getElementById('csv2md-status');

  const delimSelect = document.getElementById('csv2md-delimiter');
  const hasHeader = document.getElementById('csv2md-header');
  const alignSelect = document.getElementById('csv2md-align');
  const trimCheck = document.getElementById('csv2md-trim');

  const isEN = document.documentElement.lang === 'en';

  function escapeTable(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, '<br>');
  }

  function parseCSV(text, delimiter, trim) {
    const rows = [];
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return rows;

    for (const line of lines) {
      const cells = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          cells.push(trim ? current.trim() : current);
          current = '';
        } else {
          current += ch;
        }
      }
      cells.push(trim ? current.trim() : current);
      rows.push(cells);
    }
    return rows;
  }

  function getAlignment(align) {
    switch (align) {
      case 'left': return ':---';
      case 'center': return ':---:';
      case 'right': return '---:';
      default: return '---';
    }
  }

  function generateMD(rows, header, align) {
    if (!rows.length) return '';

    // Find max columns
    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const alignStr = getAlignment(align);
    let md = '';

    // Header
    if (header) {
      md += '| ' + normalized[0].map(c => escapeTable(c)).join(' | ') + ' |\n';
      md += '| ' + normalized[0].map(() => alignStr).join(' | ') + ' |\n';
      // Body (skip first row)
      for (let i = 1; i < normalized.length; i++) {
        md += '| ' + normalized[i].map(c => escapeTable(c)).join(' | ') + ' |\n';
      }
    } else {
      // No header — generate separator row
      md += '| ' + normalized[0].map(c => escapeTable(c)).join(' | ') + ' |\n';
      md += '| ' + normalized[0].map(() => alignStr).join(' | ') + ' |\n';
      for (let i = 1; i < normalized.length; i++) {
        md += '| ' + normalized[i].map(c => escapeTable(c)).join(' | ') + ' |\n';
      }
    }

    return md;
  }

  function convert() {
    if (!input || !output) return;
    const text = input.value.trim();
    if (!text) {
      output.value = '';
      if (preview) preview.innerHTML = '';
      status.textContent = isEN ? 'Paste CSV data and click Convert' : '粘贴 CSV 数据后点击转换';
      return;
    }

    try {
      const delimiter = delimSelect ? delimSelect.value : ',';
      const header = hasHeader ? hasHeader.checked : true;
      const align = alignSelect ? alignSelect.value : 'default';
      const trim = trimCheck ? trimCheck.checked : true;

      const rows = parseCSV(text, delimiter, trim);
      if (!rows.length) {
        output.value = '';
        preview.innerHTML = '';
        status.textContent = isEN ? '✗ No data rows found' : '✗ 未找到数据行';
        return;
      }

      const md = generateMD(rows, header, align);
      output.value = md;

      // Render preview
      if (preview) {
        const tableRows = rows.map((r, idx) => {
          const tag = (header && idx === 0) ? 'th' : 'td';
          return '<tr>' + r.map(c => `<${tag}>${escapeTable(c)}</${tag}>`).join('') + '</tr>';
        }).join('');
        preview.innerHTML = `<table><thead>${tableRows.split('</thead>')[0] || ''}</thead><tbody>...</tbody></table>`;
        // Proper preview
        if (header && rows.length > 1) {
          const head = rows[0].map(c => `<th>${escapeTable(c)}</th>`).join('');
          const body = rows.slice(1).map(r => '<tr>' + r.map(c => `<td>${escapeTable(c)}</td>`).join('') + '</tr>').join('');
          preview.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
        } else {
          const body = rows.map(r => '<tr>' + r.map(c => `<td>${escapeTable(c)}</td>`).join('') + '</tr>').join('');
          preview.innerHTML = `<table><tbody>${body}</tbody></table>`;
        }
      }

      const rowCount = rows.length;
      const colCount = rows[0].length;
      status.textContent = isEN
        ? `✓ ${rowCount} rows × ${colCount} columns — Markdown table generated`
        : `✓ ${rowCount} 行 × ${colCount} 列 — Markdown 表格已生成`;
    } catch (e) {
      output.value = '';
      preview.innerHTML = '';
      status.textContent = isEN ? `✗ Error: ${e.message}` : `✗ 错误: ${e.message}`;
    }
  }

  function copy() {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      status.textContent = isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板';
    }).catch(() => {
      status.textContent = isEN ? '✗ Copy failed' : '✗ 复制失败';
    });
  }

  function download() {
    if (!output.value) return;
    const blob = new Blob([output.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    preview.innerHTML = '';
    status.textContent = '';
  }

  // Sample data
  function loadSample() {
    input.value = `Name,Email,Role,Department
Alice Johnson,alice@example.com,Engineer,Engineering
Bob Smith,bob@example.com,Designer,Design
Carol Williams,carol@example.com,PM,Product
David Brown,david@example.com,Developer,Engineering`;
  }

  btn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copy);
  downloadBtn.addEventListener('click', download);
  clearBtn.addEventListener('click', clearAll);

  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { convert(); }
  });

  // Auto-convert on delimiter change
  delimSelect.addEventListener('change', () => { if (input.value.trim()) convert(); });
  hasHeader.addEventListener('change', () => { if (input.value.trim()) convert(); });
  alignSelect.addEventListener('change', () => { if (input.value.trim()) convert(); });
  trimCheck.addEventListener('change', () => { if (input.value.trim()) convert(); });

  // Load sample
  loadSample();
  setTimeout(convert, 150);
})();