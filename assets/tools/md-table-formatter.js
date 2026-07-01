// Markdown Table Formatter — Sort, Align, Beautify, Strip
(function () {
  'use strict';

  const input = document.getElementById('mdtInput');
  const output = document.getElementById('mdtOutput');
  const msg = document.getElementById('mdtMsg');
  const sortCol = document.getElementById('mdtSortCol');
  const sortDir = document.getElementById('mdtSortDir');
  const sortBtn = document.getElementById('mdtSortBtn');
  const alignEl = document.getElementById('mdtAlign');
  const alignBtn = document.getElementById('mdtAlignBtn');
  const stripBtn = document.getElementById('mdtStripBtn');
  const copyBtn = document.getElementById('mdtCopyBtn');

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error)' : 'var(--success)';
  }

  // ── Parse Markdown Table ──────────────────────────────
  // Returns { header: string[], align: ('left'|'center'|'right')[], rows: string[][] }
  function parseTable(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;

    // Find the separator row
    const sepIdx = lines.findIndex(l => /^\|?[\s:]*---[\s:|]*\|?$/.test(l.trim()));
    if (sepIdx === -1) return null;

    const headerRaw = lines[sepIdx === 0 ? lines.length - 1 : 0];
    const sepRaw = lines[sepIdx];
    const dataLines = lines.filter((_, i) => i !== sepIdx);
    const headerLine = dataLines[0];
    const bodyLines = dataLines.slice(1);

    // Parse cells
    function parseRow(line) {
      return line.split('|').map(c => c.trim()).filter((c, i, a) => i === 0 || i < a.length - 1 ? true : c !== '');
    }

    const header = parseRow(headerLine);
    const ncols = header.length;
    if (ncols === 0) return null;

    // Parse alignment from separator row
    const sepCells = sepRaw.split('|').map(c => c.trim()).filter(c => c);
    const align = [];
    for (let i = 0; i < ncols; i++) {
      const cell = sepCells[i] || '---';
      if (/^:--+:?$/.test(cell)) align.push('center');
      else if (/^:--+$/.test(cell)) align.push('left');
      else if (/^--+:$/.test(cell)) align.push('right');
      else align.push('left');
    }

    // Parse body rows, pad/truncate to ncols
    const rows = bodyLines.map(line => {
      const cells = parseRow(line);
      while (cells.length < ncols) cells.push('');
      return cells.slice(0, ncols);
    }).filter(r => r.some(c => c.trim()));

    return { header, align, rows, ncols };
  }

  // ── Build Table String ───────────────────────────────
  function buildTable(header, align, rows) {
    if (!header || header.length === 0) return '';

    const ncols = header.length;
    // Compute column widths
    const widths = [];
    for (let i = 0; i < ncols; i++) {
      let maxW = header[i].length;
      for (const row of rows) {
        if (i < row.length) maxW = Math.max(maxW, row[i].length);
      }
      widths[i] = maxW;
    }

    // Pad cell
    function padCell(text, width, alignment) {
      const diff = width - text.length;
      if (diff <= 0) return text;
      if (alignment === 'center') {
        const left = Math.floor(diff / 2);
        return ' '.repeat(left) + text + ' '.repeat(diff - left);
      }
      if (alignment === 'right') {
        return ' '.repeat(diff) + text;
      }
      // left align
      return text + ' '.repeat(diff);
    }

    const lines = [];

    // Header row
    lines.push('| ' + header.map((h, i) => padCell(h, widths[i], 'left')).join(' | ') + ' |');

    // Separator row
    const sepCells = align.map((a, i) => {
      if (a === 'center') return ':' + '-'.repeat(Math.max(widths[i], 3) - 2) + ':';
      if (a === 'right') return '-'.repeat(Math.max(widths[i], 3) - 1) + ':';
      return ':' + '-'.repeat(Math.max(widths[i], 3) - 1);
    });
    // Fix: left alignment is :---  not :---
    const sepCellsFixed = align.map((a, i) => {
      const w = Math.max(widths[i], 3);
      if (a === 'center') return ':' + '-'.repeat(w - 2) + ':';
      if (a === 'right') return '-'.repeat(w - 1) + ':';
      return '-' .repeat(w);
    });
    lines.push('|' + sepCellsFixed.map(s => ' ' + s + ' ').join('|') + '|');

    // Data rows
    for (const row of rows) {
      lines.push('| ' + row.map((c, i) => padCell(c, widths[i], align[i] || 'left')).join(' | ') + ' |');
    }

    return lines.join('\n');
  }

  // ── Strip Table to Plain Text ─────────────────────────
  function stripTable(delimiter) {
    showMsg('');
    const text = input.value.trim();
    if (!text) { showMsg('Please enter a Markdown table', true); return; }

    const parsed = parseTable(text);
    if (!parsed) { showMsg('Could not parse Markdown table. Ensure it has a separator row (|---|).', true); return; }

    const { header, rows } = parsed;
    const sep = delimiter === 'comma' ? ',' : '|';
    const lines = [];
    lines.push(header.join(sep));
    for (const row of rows) {
      lines.push(row.join(sep));
    }
    output.value = lines.join('\n');
    showMsg('Table converted to ' + (delimiter === 'comma' ? 'CSV' : 'pipe-delimited') + ' text');
  }

  // ── Sort ─────────────────────────────────────────────
  function doSort() {
    showMsg('');
    const text = input.value.trim();
    if (!text) { showMsg('Please enter a Markdown table', true); return; }

    const parsed = parseTable(text);
    if (!parsed) { showMsg('Could not parse Markdown table', true); return; }

    const { header, rows, align, ncols } = parsed;
    const colIdx = parseInt(sortCol.value, 10);
    const dir = sortDir.value;

    if (colIdx >= ncols || colIdx < 0) {
      showMsg('Invalid column index', true);
      return;
    }

    const sortedRows = [...rows].sort((a, b) => {
      const va = (a[colIdx] || '').toLowerCase();
      const vb = (b[colIdx] || '').toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    output.value = buildTable(header, align, sortedRows);
    updateSortCols(header);
    showMsg('Sorted by column "' + header[colIdx] + '" ' + (dir === 'asc' ? 'ascending' : 'descending'));
  }

  // ── Format/Align ─────────────────────────────────────
  function doFormat() {
    showMsg('');
    const text = input.value.trim();
    if (!text) { showMsg('Please enter a Markdown table', true); return; }

    const parsed = parseTable(text);
    if (!parsed) { showMsg('Could not parse Markdown table', true); return; }

    const { header, rows, ncols } = parsed;
    const alignMode = alignEl.value;
    let newAlign;

    if (alignMode) {
      newAlign = Array(ncols).fill(alignMode);
    } else {
      // Preserve original alignment from input
      const parsedAlign = parseTable(text);
      newAlign = parsedAlign ? parsedAlign.align : Array(ncols).fill('left');
    }

    output.value = buildTable(header, newAlign, rows);
    updateSortCols(header);
    showMsg('Table formatted' + (alignMode ? ' (' + alignMode + ' align)' : ''));
  }

  // ── Update sort column dropdown ──────────────────────
  function updateSortCols(header) {
    if (!sortCol || !header) return;
    const currentVal = sortCol.value;
    sortCol.innerHTML = header.map((h, i) =>
      '<option value="' + i + '"' + (String(i) === currentVal ? ' selected' : '') + '>' + h + '</option>'
    ).join('');
  }

  // ── Copy ─────────────────────────────────────────────
  function copyResult() {
    if (!output.value.trim()) {
      showMsg('Nothing to copy', true);
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showMsg('Copied to clipboard');
    }).catch(() => {
      // Fallback
      output.select();
      document.execCommand('copy');
      showMsg('Copied to clipboard');
    });
  }

  // ── Auto-format on input change ─────────────────────
  let autoTimer = null;
  function onInputChange() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      const text = input.value.trim();
      if (!text) { output.value = ''; showMsg(''); return; }
      const parsed = parseTable(text);
      if (!parsed) return;
      updateSortCols(parsed.header);
    }, 300);
  }

  // ── Init ────────────────────────────────────────────
  function init() {
    if (sortBtn) sortBtn.addEventListener('click', doSort);
    if (alignBtn) alignBtn.addEventListener('click', doFormat);
    if (stripBtn) stripBtn.addEventListener('click', function() {
      stripTable('pipe');
    });
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (input) {
      input.addEventListener('input', onInputChange);
      // Initial parse
      setTimeout(() => {
        const text = input.value.trim();
        if (text) {
          const parsed = parseTable(text);
          if (parsed) updateSortCols(parsed.header);
        }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();