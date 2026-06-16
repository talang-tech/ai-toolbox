// CSV Cleaner - clean/normalize CSV data locally
(function () {
  'use strict';

  const input = document.getElementById('ccInput');
  const output = document.getElementById('ccOutput');
  const cleanBtn = document.getElementById('ccClean');
  const copyBtn = document.getElementById('ccCopy');
  const status = document.getElementById('ccStatus');
  const opts = {
    trimWhitespace: document.getElementById('ccTrim'),
    removeEmptyRows: document.getElementById('ccRemoveEmpty'),
    removeDuplicates: document.getElementById('ccRemoveDup'),
    normalizeQuotes: document.getElementById('ccNormalize'),
    stripHtml: document.getElementById('ccStrip'),
    collapseWhitespace: document.getElementById('ccCollapse'),
  };
  const isEN = document.documentElement.lang === 'en';

  const t = {
    empty: isEN ? 'Paste CSV data first.' : '请先粘贴 CSV 数据。',
    cleaned: (rows, cols) => isEN ? `Cleaned: ${rows} rows × ${cols} columns` : `清洗完成：${rows} 行 × ${cols} 列`,
    copied: isEN ? 'Copied to clipboard.' : '已复制到剪贴板。',
    copyFail: isEN ? 'Copy failed.' : '复制失败。',
    removedDup: isEN ? ' (removed {n} duplicate rows)' : '（移除 {n} 行重复）',
    removedEmpty: isEN ? ' (removed {n} empty rows)' : '（移除 {n} 行空行）',
  };

  function escapeCsvField(field) {
    if (field == null) return '';
    const s = String(field);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function parseCsvLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }

  function formatCsvRow(fields) {
    return fields.map(escapeCsvField).join(',');
  }

  function clean() {
    const text = input.value;
    if (!text.trim()) {
      status.textContent = t.empty;
      status.style.color = 'var(--warning)';
      output.value = '';
      return;
    }

    const lines = text.split('\n');
    const trimmedOpt = opts.trimWhitespace.checked;
    const removeEmptyOpt = opts.removeEmptyRows.checked;
    const removeDupOpt = opts.removeDuplicates.checked;
    const normalizeOpt = opts.normalizeQuotes.checked;
    const stripOpt = opts.stripHtml.checked;
    const collapseOpt = opts.collapseWhitespace.checked;

    let parsedRows = lines.map(l => {
      if (l.trim() === '' && removeEmptyOpt) return { fields: [], empty: true };
      const row = parseCsvLine(l);
      return { fields: row, empty: false };
    });

    let filterNote = '';
    let initialCount = parsedRows.filter(r => !r.empty).length;

    // Remove empty rows
    if (removeEmptyOpt) {
      const before = parsedRows.length;
      parsedRows = parsedRows.filter(r => !r.empty || r.fields.some(f => f.trim() !== ''));
      const removed = before - parsedRows.length;
      if (removed > 0) filterNote += t.removedEmpty.replace('{n}', removed);
    }

    // Remove duplicate rows
    if (removeDupOpt) {
      const seen = new Set();
      const before = parsedRows.length;
      parsedRows = parsedRows.filter(r => {
        const key = r.fields.join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const removed = before - parsedRows.length;
      if (removed > 0) filterNote += t.removedDup.replace('{n}', removed);
    }

    // Clean each field
    const cleanedRows = parsedRows.map(r => {
      let fields = r.fields.map(f => {
        let val = f;
        if (trimmedOpt) val = val.trim();
        if (collapseOpt) val = val.replace(/\s+/g, ' ');
        if (stripOpt) val = val.replace(/<[^>]*>/g, '');
        if (normalizeOpt) {
          // Normalize quotes: remove wrapping quotes
          if (val.length >= 2 && val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
        }
        return val;
      });
      return { fields, empty: false };
    });

    // Only output non-empty cleaned rows
    const outRows = cleanedRows.filter(r => r.fields.some(f => f !== ''));
    if (outRows.length === 0) {
      status.textContent = isEN ? 'No data after cleaning.' : '清洗后没有数据。';
      status.style.color = 'var(--warning)';
      output.value = '';
      return;
    }

    const outText = outRows.map(r => formatCsvRow(r.fields)).join('\n');
    output.value = outText;

    const cols = outRows.reduce((max, r) => Math.max(max, r.fields.length), 0);
    let msg = t.cleaned(outRows.length, cols) + filterNote;
    status.textContent = msg;
    status.style.color = 'var(--success)';
  }

  cleanBtn.addEventListener('click', clean);

  copyBtn.addEventListener('click', async () => {
    if (!output.value) {
      status.textContent = t.empty;
      status.style.color = 'var(--warning)';
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = t.copied;
      status.style.color = 'var(--success)';
    } catch {
      status.textContent = t.copyFail;
      status.style.color = 'var(--error)';
    }
  });
})();