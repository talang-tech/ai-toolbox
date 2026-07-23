// Markdown Table to CSV — extract data from Markdown tables as CSV
(() => {
  'use strict';

  const input = document.getElementById('mtc-input');
  const output = document.getElementById('mtc-output');
  const convertBtn = document.getElementById('mtc-convert');
  const copyBtn = document.getElementById('mtc-copy');
  const clearBtn = document.getElementById('mtc-clear');
  const status = document.getElementById('mtc-status');
  const includeHeader = document.getElementById('mtc-header');
  const isEN = document.documentElement.lang === 'en';

  if (!input) return;

  const msg = {
    empty: isEN ? 'Please paste a Markdown table first.' : '请先粘贴 Markdown 表格。',
    error: isEN ? 'Could not parse Markdown table. Make sure it has a separator row (|---|).' : '无法解析 Markdown 表格，请确保有分隔行（|---|）。',
    ok: (r, c) => isEN ? `Done: ${r} rows × ${c} columns` : `完成：${r} 行 × ${c} 列`,
    copied: isEN ? 'Copied to clipboard!' : '已复制到剪贴板！',
    fail: isEN ? 'Copy failed.' : '复制失败。',
    clear: isEN ? 'Cleared.' : '已清空。',
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function escapeCsv(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function parseCells(line) {
    const cells = [];
    let current = '';
    let inCell = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '|' && !inCell) {
        inCell = true;
        current = '';
      } else if (ch === '|' && inCell) {
        cells.push(current.trim());
        current = '';
      } else if (inCell) {
        current += ch;
      }
    }
    // If line ends with |, we already pushed the last cell
    // If not, push the accumulated current
    if (inCell && current !== '') {
      cells.push(current.trim());
    }
    return cells;
  }

  function convert() {
    const text = input.value.trim();
    if (!text) {
      show(msg.empty, 'warning');
      output.value = '';
      return;
    }

    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) {
      show(msg.error, 'error');
      return;
    }

    // Find separator row
    const sepIdx = lines.findIndex(l => /^\|?[\s:]*---[\s:|]*\|?$/.test(l.trim()));
    if (sepIdx === -1) {
      show(msg.error, 'error');
      return;
    }

    // Get header from first line (or line before separator)
    const headerLine = sepIdx === 0 ? lines[1] : lines[0];
    // Get data rows
    const dataLines = lines.filter((_, i) => i !== sepIdx);
    const bodyLines = includeHeader && includeHeader.checked ? dataLines.slice(1) : dataLines;

    // Parse header
    const header = parseCells(headerLine);
    if (header.length === 0) {
      show(msg.error, 'error');
      return;
    }
    const ncols = header.length;

    // Parse body rows
    const rows = [];
    for (const line of bodyLines) {
      const cells = parseCells(line);
      // Pad or truncate to ncols
      while (cells.length < ncols) cells.push('');
      rows.push(cells.slice(0, ncols));
    }

    // Build CSV
    const headerCsv = header.map(escapeCsv).join(',');
    const bodyCsv = rows.map(row => row.map(escapeCsv).join(','));
    const csv = includeHeader && includeHeader.checked
      ? [headerCsv, ...bodyCsv].join('\n')
      : bodyCsv.join('\n');

    output.value = csv;
    show(msg.ok(rows.length, ncols), 'success');
  }

  function copy() {
    if (!output.value) {
      show(isEN ? 'Nothing to copy.' : '没有内容可复制。', 'warning');
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      show(msg.copied, 'success');
    }).catch(() => {
      show(msg.fail, 'error');
    });
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    show(msg.clear, 'info');
  }

  // Event listeners
  convertBtn && convertBtn.addEventListener('click', convert);
  copyBtn && copyBtn.addEventListener('click', copy);
  clearBtn && clearBtn.addEventListener('click', clearAll);

  // Auto-convert on paste
  let autoTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(convert, 600);
  });

  // Keyboard shortcut
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      convert();
    }
  });
})();