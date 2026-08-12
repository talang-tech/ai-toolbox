/**
 * CSV to TSV Converter - Pure JS, zero dependencies
 * Convert CSV (comma-separated) to TSV (tab-separated) and vice versa
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('ctt-input');
    const output = document.getElementById('ctt-output');
    const modeSelect = document.getElementById('ctt-mode');
    const inputDelimiter = document.getElementById('ctt-input-delimiter');
    const headerSelect = document.getElementById('ctt-header');
    const actionBtn = document.getElementById('ctt-action-btn');
    const copyBtn = document.getElementById('ctt-copy-btn');
    const downloadBtn = document.getElementById('ctt-download-btn');
    const swapBtn = document.getElementById('ctt-swap-btn');
    const statusEl = document.getElementById('ctt-status');

    if (!input || !output) return;

    function parseRow(row, delimiter) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < row.length && row[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === delimiter) {
            result.push(current);
            current = '';
          } else if (ch === '\r') {
            // skip carriage return
          } else {
            current += ch;
          }
        }
      }
      result.push(current);
      return result;
    }

    function escapeField(value, delimiter, alwaysQuote) {
      if (value === null || value === undefined) return '';
      const str = String(value);
      const needsQuotes = alwaysQuote ||
        str.includes('"') ||
        str.includes(delimiter) ||
        str.includes('\n');
      if (needsQuotes) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    function csvToTsv(csvText, inDelim, hasHeader) {
      const lines = csvText.split('\n').filter(line => line.trim() !== '' || line === '');
      if (lines.length === 0) return { result: '', rows: 0, cols: 0 };

      const parsed = lines.map(line => parseRow(line, inDelim));
      const maxCols = Math.max(...parsed.map(r => r.length));

      const outDelim = '\t';
      const outLines = parsed.map(row => {
        const padded = [...row];
        while (padded.length < maxCols) padded.push('');
        return padded.map(f => escapeField(f, outDelim, false)).join(outDelim);
      });

      return { result: outLines.join('\n'), rows: parsed.length, cols: maxCols };
    }

    function tsvToCsv(tsvText, outDelim, hasHeader) {
      const lines = tsvText.split('\n').filter(line => line.trim() !== '' || line === '');
      if (lines.length === 0) return { result: '', rows: 0, cols: 0 };

      const parsed = lines.map(line => parseRow(line, '\t'));
      const maxCols = Math.max(...parsed.map(r => r.length));

      const outLines = parsed.map(row => {
        const padded = [...row];
        while (padded.length < maxCols) padded.push('');
        return padded.map(f => escapeField(f, outDelim, false)).join(outDelim);
      });

      return { result: outLines.join('\n'), rows: parsed.length, cols: maxCols };
    }

    function convert() {
      try {
        const text = input.value.trim();
        if (!text) {
          statusEl.textContent = '⚠️ 请输入数据';
          output.value = '';
          return;
        }

        const mode = modeSelect.value; // 'csv-to-tsv' or 'tsv-to-csv'
        const inDelim = mode === 'csv-to-tsv'
          ? inputDelimiter.value
          : '\t';
        const outDelim = mode === 'tsv-to-csv'
          ? inputDelimiter.value
          : '\t';
        const hasHeader = headerSelect.value === 'first';

        let result;
        if (mode === 'csv-to-tsv') {
          result = csvToTsv(text, inDelim, hasHeader);
        } else {
          result = tsvToCsv(text, inDelim, hasHeader);
        }

        output.value = result.result;
        statusEl.textContent = `✅ 成功: ${result.rows} 行 × ${result.cols} 列`;
      } catch (e) {
        statusEl.textContent = '❌ 转换失败: ' + e.message;
        output.value = '';
      }
    }

    function updateUI() {
      const mode = modeSelect.value;
      const label = document.getElementById('ctt-input-label');
      const delimLabel = document.getElementById('ctt-delimiter-label');
      if (mode === 'csv-to-tsv') {
        label.textContent = '📄 CSV 数据源';
        delimLabel.textContent = 'CSV 分隔符:';
        input.placeholder = '粘贴 CSV 数据（逗号分隔）...';
      } else {
        label.textContent = '📄 TSV 数据源';
        delimLabel.textContent = 'TSV 分隔符:';
        input.placeholder = '粘贴 TSV 数据（Tab 分隔）...';
      }
    }

    actionBtn.addEventListener('click', convert);

    swapBtn.addEventListener('click', function () {
      const tmp = input.value;
      input.value = output.value;
      output.value = '';
      modeSelect.value = modeSelect.value === 'csv-to-tsv' ? 'tsv-to-csv' : 'csv-to-tsv';
      updateUI();
      convert();
    });

    modeSelect.addEventListener('change', function () {
      input.value = '';
      output.value = '';
      statusEl.textContent = '';
      updateUI();
    });

    copyBtn.addEventListener('click', function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(function () {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✅ 已复制!';
        setTimeout(function () { copyBtn.textContent = orig; }, 2000);
      }).catch(function () {
        copyBtn.textContent = '❌ 复制失败';
      });
    });

    downloadBtn.addEventListener('click', function () {
      if (!output.value) return;
      const ext = modeSelect.value === 'csv-to-tsv' ? '.tsv' : '.csv';
      const blob = new Blob([output.value], { type: 'text/tab-separated-values;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted' + ext;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Ctrl+Enter to convert
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        convert();
      }
    });

    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();