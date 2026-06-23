/**
 * CSV to JSON Converter - Pure JS, zero dependencies
 * Full-featured CSV→JSON conversion in the browser
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('ctj-input');
    const output = document.getElementById('ctj-output');
    const delimiterSelect = document.getElementById('ctj-delimiter');
    const headerSelect = document.getElementById('ctj-header');
    const indentSelect = document.getElementById('ctj-indent');
    const actionBtn = document.getElementById('ctj-action-btn');
    const copyBtn = document.getElementById('ctj-copy-btn');
    const downloadBtn = document.getElementById('ctj-download-btn');
    const statusEl = document.getElementById('ctj-status');

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
          } else if (ch === '\r' || ch === '\n') {
            // shouldn't reach here for a single row, but handle
          } else {
            current += ch;
          }
        }
      }
      result.push(current);
      return result;
    }

    function parseCSV(text, delimiter) {
      // Normalize line endings
      const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalized.split('\n');
      const rows = [];

      let currentRow = [];
      let inQuotes = false;
      let currentField = '';
      let i = 0;

      // Build rows respecting multi-line quoted fields
      while (i < lines.length) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
          const ch = line[j];
          if (inQuotes) {
            if (ch === '"') {
              if (j + 1 < line.length && line[j + 1] === '"') {
                currentField += '"';
                j++;
              } else {
                inQuotes = false;
              }
            } else {
              currentField += ch;
            }
          } else {
            if (ch === '"') {
              inQuotes = true;
            } else if (ch === delimiter) {
              currentRow.push(currentField);
              currentField = '';
            } else {
              currentField += ch;
            }
          }
        }

        if (inQuotes) {
          currentField += '\n';
        } else {
          currentRow.push(currentField);
          currentField = '';
          rows.push(currentRow);
          currentRow = [];
        }
        i++;
      }

      // Catch trailing row if file ends without newline
      if (currentRow.length > 0 || currentField) {
        // If we processed the last field already, the row was already pushed
        // Check if last row has content
        if (rows.length === 0 || rows[rows.length - 1].length > 0) {
          // Edge case: already pushed
        }
      }

      // Remove empty trailing rows
      while (rows.length > 0 && rows[rows.length - 1].every(function (f) { return f === ''; })) {
        rows.pop();
      }

      return rows;
    }

    function inferType(value) {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '""') return null;
      if (trimmed === 'null' || trimmed === 'NULL') return null;
      if (trimmed === 'true' || trimmed === 'TRUE') return true;
      if (trimmed === 'false' || trimmed === 'FALSE') return false;
      if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
      if (/^-?\d+\.?\d*$/.test(trimmed) && trimmed !== '.') return parseFloat(trimmed);
      return trimmed;
    }

    function buildNestedObject(headers, values) {
      const result = {};
      for (let i = 0; i < headers.length; i++) {
        if (i >= values.length) break;
        const parts = headers[i].split('.');
        let current = result;
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j].trim();
          if (j === parts.length - 1) {
            current[part] = inferType(values[i]);
          } else {
            if (!current[part] || typeof current[part] !== 'object') {
              current[part] = {};
            }
            current = current[part];
          }
        }
      }
      return result;
    }

    function process() {
      const csvText = input.value;
      if (!csvText.trim()) {
        output.value = '';
        if (statusEl) statusEl.textContent = '';
        return;
      }

      const delimiterRaw = delimiterSelect.value;
      const delimiter = delimiterRaw === '\\t' ? '\t' : delimiterRaw;
      const headerMode = headerSelect.value;
      const indentVal = indentSelect.value;

      try {
        const rows = parseCSV(csvText, delimiter);

        if (rows.length === 0) {
          if (statusEl) statusEl.textContent = '⚠️ 未解析到数据行';
          return;
        }

        let jsonResult;
        const rowCount = rows.length;

        if (headerMode === 'first') {
          const headers = rows[0];
          const dataRows = rows.slice(1);
          jsonResult = dataRows.map(function (row) {
            return buildNestedObject(headers, row);
          });
        } else {
          // No header mode: use index-based keys
          jsonResult = rows.map(function (row) {
            return row.map(function (v) { return inferType(v); });
          });
        }

        let indentStr;
        if (indentVal === 'compact') {
          indentStr = null;
        } else {
          indentStr = parseInt(indentVal, 10);
        }

        const jsonStr = JSON.stringify(jsonResult, null, indentStr);

        output.value = jsonStr;

        const dataRows = headerMode === 'first' ? rows.length - 1 : rows.length;
        const fieldsCount = rows[0] ? rows[0].length : 0;
        if (statusEl) {
          statusEl.textContent = '✅ 转换完成: ' + dataRows + ' 行 × ' + fieldsCount + ' 字段 | JSON ' + jsonStr.length + ' 字符';
        }
      } catch (e) {
        if (statusEl) statusEl.textContent = '❌ 解析错误: ' + e.message;
        output.value = 'Error: ' + e.message;
      }
    }

    actionBtn.addEventListener('click', process);

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        process();
      }
    });

    copyBtn.addEventListener('click', function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(function () {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✅ 已复制!';
        setTimeout(function () { copyBtn.textContent = orig; }, 2000);
      }).catch(function () {
        output.select();
        document.execCommand('copy');
      });
    });

    downloadBtn.addEventListener('click', function () {
      if (!output.value) return;
      const blob = new Blob([output.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Auto-process with debounce
    let debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(process, 600);
    });
    delimiterSelect.addEventListener('change', function () {
      if (input.value.trim()) process();
    });
    headerSelect.addEventListener('change', function () {
      if (input.value.trim()) process();
    });
    indentSelect.addEventListener('change', function () {
      if (input.value.trim()) process();
    });
  }

  // Wait for DOM and tool container
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    const observer = new MutationObserver(function () {
      if (document.getElementById('ctj-input')) {
        observer.disconnect();
        init();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();