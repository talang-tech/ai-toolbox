/**
 * CSV to XML Converter - Pure JS, zero dependencies
 * Convert CSV data to XML format with configurable root/row element names
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('ctx-input');
    const output = document.getElementById('ctx-output');
    const delimiterSelect = document.getElementById('ctx-delimiter');
    const headerSelect = document.getElementById('ctx-header');
    const rootEl = document.getElementById('ctx-root-element');
    const rowEl = document.getElementById('ctx-row-element');
    const indentSelect = document.getElementById('ctx-indent');
    const actionBtn = document.getElementById('ctx-action-btn');
    const copyBtn = document.getElementById('ctx-copy-btn');
    const downloadBtn = document.getElementById('ctx-download-btn');
    const statusEl = document.getElementById('ctx-status');

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

    function escapeXml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    function isValidXmlName(name) {
      return /^[a-zA-Z_:][a-zA-Z0-9_:.\-]*$/.test(name);
    }

    function sanitizeXmlName(name) {
      return name.replace(/[^a-zA-Z0-9_:.\-]/g, '_').replace(/^(\d)/, '_$1') || 'field';
    }

    function convert() {
      try {
        const text = input.value.trim();
        if (!text) {
          statusEl.textContent = '⚠️ 请输入 CSV 数据';
          output.value = '';
          return;
        }

        const delimiter = delimiterSelect.value;
        const hasHeader = headerSelect.value === 'first';
        const indent = indentSelect.value;
        const rootName = rootEl.value.trim() || 'root';
        const rowName = rowEl.value.trim() || 'row';
        const indentStr = indent === 'compact' ? '' : ' '.repeat(indent === '4' ? 4 : 2);
        const nl = indent === 'compact' ? '' : '\n';

        const lines = text.split('\n').filter(line => line.trim() !== '' || line === '');
        if (lines.length === 0) {
          statusEl.textContent = '⚠️ 没有数据行';
          output.value = '';
          return;
        }

        const parsed = lines.map(line => parseRow(line, delimiter));
        const maxCols = Math.max(...parsed.map(r => r.length));

        const safeRoot = sanitizeXmlName(rootName);
        const safeRow = sanitizeXmlName(rowName);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>' + nl;
        xml += '<' + safeRoot + '>' + nl;

        let headers = [];
        const startRow = hasHeader ? 1 : 0;

        if (hasHeader && parsed.length > 0) {
          headers = parsed[0].map(h => h.trim());
          // ensure all headers are valid XML names
          headers = headers.map(h => isValidXmlName(h) ? h : sanitizeXmlName(h));
        }

        for (let i = startRow; i < parsed.length; i++) {
          const row = parsed[i];
          xml += indentStr + '<' + safeRow + '>' + nl;

          for (let j = 0; j < maxCols; j++) {
            const val = j < row.length ? row[j] : '';
            const tagName = hasHeader && j < headers.length ? headers[j] : 'col' + (j + 1);
            xml += indentStr + indentStr + '<' + tagName + '>' + escapeXml(val) + '</' + tagName + '>' + nl;
          }

          xml += indentStr + '</' + safeRow + '>' + nl;
        }

        xml += '</' + safeRoot + '>';

        output.value = xml;
        statusEl.textContent = '✅ 成功: ' + (parsed.length - startRow) + ' 行 × ' + maxCols + ' 列 → XML';
      } catch (e) {
        statusEl.textContent = '❌ 转换失败: ' + e.message;
        output.value = '';
      }
    }

    actionBtn.addEventListener('click', convert);

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
      const blob = new Blob([output.value], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.xml';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        convert();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();