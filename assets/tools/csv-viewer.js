// CSV Viewer & Table Converter - browser-local CSV parsing and export
(() => {
  'use strict';

  const input = document.getElementById('csvInput');
  const delimiter = document.getElementById('csvDelimiter');
  const customDelimiter = document.getElementById('csvCustomDelimiter');
  const hasHeader = document.getElementById('csvHasHeader');
  const parseBtn = document.getElementById('csvParse');
  const copyTableBtn = document.getElementById('csvCopyTable');
  const copyJsonBtn = document.getElementById('csvCopyJson');
  const downloadBtn = document.getElementById('csvDownload');
  const clearBtn = document.getElementById('csvClear');
  const status = document.getElementById('csvStatus');
  const preview = document.getElementById('csvPreview');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !preview) return;

  let state = { rows: [], headers: [], html: '', json: '' };

  const sample = `name,email,role,score\nAlice,alice@example.com,Developer,98\nBob,bob@example.com,Designer,91\nCharlie,charlie@example.com,"Product, Growth",88`;

  const t = {
    empty: isEN ? 'Paste CSV first.' : '请先粘贴 CSV。',
    parsed: (rows, cols) => isEN ? `Parsed ${rows} rows × ${cols} columns locally.` : `已在本地解析 ${rows} 行 × ${cols} 列。`,
    copiedTable: isEN ? 'HTML table copied.' : 'HTML 表格已复制。',
    copiedJson: isEN ? 'JSON copied.' : 'JSON 已复制。',
    cleared: isEN ? 'Cleared.' : '已清空。',
    error: isEN ? 'CSV parse error: ' : 'CSV 解析错误：',
  };

  function getDelimiter() {
    const value = delimiter.value;
    if (value === 'tab') return '\t';
    if (value === 'custom') return customDelimiter.value || ',';
    return value;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStatus(message, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', warning: '#f59e0b', error: 'var(--danger)' };
    status.textContent = message;
    status.style.color = colors[type] || colors.info;
  }

  function parseCsv(text, sep) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i += 1;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (text.startsWith(sep, i)) {
        row.push(field);
        field = '';
        i += sep.length - 1;
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (ch === '\r') {
        // ignore CR; LF handles row breaks
      } else {
        field += ch;
      }
    }

    if (inQuotes) throw new Error(isEN ? 'unclosed quoted field' : '存在未闭合的引号字段');
    row.push(field);
    if (row.length > 1 || row[0] !== '' || text.endsWith(sep)) rows.push(row);
    return rows.filter(r => r.some(cell => String(cell).trim() !== ''));
  }

  function normalizeRows(rows) {
    const width = Math.max(0, ...rows.map(r => r.length));
    return rows.map(r => {
      const out = [...r];
      while (out.length < width) out.push('');
      return out;
    });
  }

  function toObjects(rows, headers) {
    if (!rows.length) return [];
    return rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h || `column_${i + 1}`] = row[i] ?? '';
      });
      return obj;
    });
  }

  function buildTable(headers, rows) {
    const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
    const tbody = rows.slice(0, 500).map(row => `<tr>${headers.map((_, idx) => `<td>${escapeHtml(row[idx] || '')}</td>`).join('')}</tr>`).join('');
    const note = rows.length > 500
      ? `<p style="color:var(--text-dim);font-size:13px;margin-top:8px">${isEN ? 'Preview limited to first 500 rows.' : '预览仅显示前 500 行。'}</p>`
      : '';
    return `<div style="overflow:auto;max-height:520px;border:1px solid var(--border);border-radius:8px"><table style="width:100%;border-collapse:collapse">${thead}<tbody>${tbody}</tbody></table></div>${note}`;
  }

  function parseAndRender() {
    const text = input.value;
    if (!text.trim()) {
      preview.innerHTML = '';
      setStatus(t.empty, 'warning');
      return;
    }
    try {
      const sep = getDelimiter();
      const rows = normalizeRows(parseCsv(text.replace(/^\uFEFF/, ''), sep));
      if (!rows.length) {
        preview.innerHTML = '';
        setStatus(t.empty, 'warning');
        return;
      }
      const width = Math.max(0, ...rows.map(r => r.length));
      let headers;
      let dataRows;
      if (hasHeader.checked) {
        headers = rows[0].map((h, i) => h.trim() || `column_${i + 1}`);
        dataRows = rows.slice(1);
      } else {
        headers = Array.from({ length: width }, (_, i) => `column_${i + 1}`);
        dataRows = rows;
      }
      const html = buildTable(headers, dataRows);
      const objects = toObjects(dataRows, headers);
      state = {
        rows: dataRows,
        headers,
        html: `<table>\n<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>\n<tbody>\n${dataRows.map(row => '<tr>' + headers.map((_, idx) => `<td>${escapeHtml(row[idx] || '')}</td>`).join('') + '</tr>').join('\n')}\n</tbody>\n</table>`,
        json: JSON.stringify(objects, null, 2),
      };
      preview.innerHTML = html;
      setStatus(t.parsed(dataRows.length, headers.length), 'success');
    } catch (err) {
      preview.innerHTML = '';
      setStatus(t.error + err.message, 'error');
    }
  }

  function downloadJson() {
    if (!state.json) parseAndRender();
    if (!state.json) return;
    const blob = new Blob([state.json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csv-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  delimiter?.addEventListener('change', () => {
    if (customDelimiter) customDelimiter.style.display = delimiter.value === 'custom' ? '' : 'none';
    parseAndRender();
  });
  customDelimiter?.addEventListener('input', parseAndRender);
  hasHeader?.addEventListener('change', parseAndRender);
  parseBtn?.addEventListener('click', parseAndRender);
  copyTableBtn?.addEventListener('click', async () => {
    if (!state.html) parseAndRender();
    if (!state.html) return;
    await navigator.clipboard.writeText(state.html);
    setStatus(t.copiedTable, 'success');
  });
  copyJsonBtn?.addEventListener('click', async () => {
    if (!state.json) parseAndRender();
    if (!state.json) return;
    await navigator.clipboard.writeText(state.json);
    setStatus(t.copiedJson, 'success');
  });
  downloadBtn?.addEventListener('click', downloadJson);
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    preview.innerHTML = '';
    state = { rows: [], headers: [], html: '', json: '' };
    setStatus(t.cleared, 'info');
  });
  input.addEventListener('input', () => {
    if (input.value.length < 100000) parseAndRender();
  });

  if (!input.value.trim()) input.value = sample;
  if (customDelimiter) customDelimiter.style.display = 'none';
  parseAndRender();
})();
