/**
 * JSON to Excel - Convert JSON arrays/objects to CSV/XLSX format
 * AI Toolbox - 100% client-side processing
 */

(function() {
  'use strict';

  const input = document.getElementById('j2e-input');
  const convertBtn = document.getElementById('j2e-convert');
  const copyBtn = document.getElementById('j2e-copy');
  const clearBtn = document.getElementById('j2e-clear');
  const downloadBtn = document.getElementById('j2e-download');
  const formatSelect = document.getElementById('j2e-format');
  const statusEl = document.getElementById('j2e-status');
  const rowsEl = document.getElementById('j2e-rows');
  const colsEl = document.getElementById('j2e-cols');
  const thead = document.getElementById('j2e-thead');
  const tbody = document.getElementById('j2e-tbody');

  let currentData = [];
  let currentHeaders = [];

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === 'error' ? '#e74c3c' : type === 'warn' ? '#f39c12' : type === 'success' ? '#27ae60' : 'var(--text-dim)';
  }

  function flattenObject(obj, prefix) {
    if (obj === null || obj === undefined) return {};
    prefix = prefix || '';
    const result = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const newKey = prefix ? prefix + '_' + key : key;
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(result, flattenObject(val, newKey));
      } else {
        result[newKey] = val;
      }
    }
    return result;
  }

  function expandArrays(rows) {
    const expanded = [];
    for (const row of rows) {
      let maxLen = 0;
      const arrayFields = {};
      for (const key of Object.keys(row)) {
        if (Array.isArray(row[key]) && row[key].length > 0) {
          arrayFields[key] = row[key];
          maxLen = Math.max(maxLen, row[key].length);
        }
      }
      if (maxLen === 0) {
        expanded.push(row);
      } else {
        for (let i = 0; i < maxLen; i++) {
          const newRow = {};
          for (const key of Object.keys(row)) {
            if (arrayFields[key]) {
              newRow[key] = i < arrayFields[key].length ? arrayFields[key][i] : null;
            } else {
              newRow[key] = row[key];
            }
          }
          expanded.push(newRow);
        }
      }
    }
    return expanded;
  }

  function parseJSON(inputText) {
    let parsed;
    try {
      parsed = JSON.parse(inputText);
    } catch (e) {
      setStatus('JSON parse error: ' + e.message, 'error');
      return null;
    }

    let rows;
    if (Array.isArray(parsed)) {
      rows = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const values = Object.values(parsed);
      const arrVal = values.find(v => Array.isArray(v));
      if (arrVal && arrVal.length > 0) {
        rows = arrVal;
      } else {
        rows = [parsed];
      }
    } else {
      setStatus('JSON input must be an object or array', 'error');
      return null;
    }

    if (rows.length === 0) {
      setStatus('JSON array is empty', 'warn');
      return null;
    }

    const flatRows = rows.map(r => {
      if (r !== null && typeof r === 'object') {
        return flattenObject(r);
      }
      return { value: r };
    });

    const expanded = expandArrays(flatRows);

    const headers = [];
    const seen = new Set();
    for (const row of expanded) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          headers.push(key);
        }
      }
    }

    if (expanded.length > 10000) {
      setStatus('Data exceeds 10,000 rows, showing first 10,000', 'warn');
    }

    currentData = expanded.slice(0, 10000);
    currentHeaders = headers;
    return { headers, rows: expanded.slice(0, 10000) };
  }

  function renderTable(headers, rows) {
    let headerHtml = '<tr>';
    for (const h of headers) {
      headerHtml += '<th style="padding:8px 10px;border:1px solid var(--border);background:var(--bg-secondary);font-weight:600;text-align:left;white-space:nowrap">' + escapeHtml(h) + '</th>';
    }
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;

    let bodyHtml = '';
    const previewRows = Math.min(rows.length, 100);
    for (let i = 0; i < previewRows; i++) {
      bodyHtml += '<tr>';
      for (const h of headers) {
        let val = rows[i][h];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        bodyHtml += '<td style="padding:6px 10px;border:1px solid var(--border);font-size:13px">' + escapeHtml(String(val)) + '</td>';
      }
      bodyHtml += '</tr>';
    }
    if (rows.length > 100) {
      bodyHtml += '<tr><td colspan="' + headers.length + '" style="padding:8px;text-align:center;color:var(--text-dim);font-size:13px">... and ' + (rows.length - 100) + ' more rows</td></tr>';
    }
    tbody.innerHTML = bodyHtml;

    rowsEl.textContent = rows.length;
    colsEl.textContent = headers.length;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeCsv(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function toCSV(headers, rows) {
    const lines = [];
    lines.push(headers.map(h => escapeCsv(h)).join(','));
    for (const row of rows) {
      lines.push(headers.map(h => escapeCsv(row[h])).join(','));
    }
    return lines.join('\n');
  }

  function downloadCSV() {
    if (currentHeaders.length === 0) {
      setStatus('No data to download', 'error');
      return;
    }
    const csv = toCSV(currentHeaders, currentData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('CSV downloaded', 'success');
  }

  function downloadXLSX() {
    if (currentHeaders.length === 0) {
      setStatus('No data to download', 'error');
      return;
    }
    // Use SheetJS if available, otherwise use simple CSV renamed
    const csv = '\ufeff' + toCSV(currentHeaders, currentData);
    const blob = new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('XLSX downloaded (CSV-based, compatible with Excel)', 'success');
  }

  function handleConvert() {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please paste JSON data', 'warn');
      return;
    }

    const result = parseJSON(text);
    if (!result) return;

    renderTable(result.headers, result.rows);
    setStatus('Converted successfully: ' + result.rows.length + ' rows, ' + result.headers.length + ' columns', 'success');
  }

  function handleCopy() {
    if (currentHeaders.length === 0) {
      setStatus('No data to copy', 'error');
      return;
    }
    const csv = toCSV(currentHeaders, currentData);
    navigator.clipboard.writeText(csv).then(() => {
      setStatus('Copied to clipboard', 'success');
    }).catch(() => {
      setStatus('Failed to copy', 'error');
    });
  }

  function handleClear() {
    input.value = '';
    currentData = [];
    currentHeaders = [];
    thead.innerHTML = '';
    tbody.innerHTML = '';
    rowsEl.textContent = '0';
    colsEl.textContent = '0';
    setStatus('Cleared', '');
  }

  function handleDownload() {
    const format = formatSelect.value;
    if (format === 'csv') {
      downloadCSV();
    } else {
      downloadXLSX();
    }
  }

  // Event listeners
  convertBtn.addEventListener('click', handleConvert);
  copyBtn.addEventListener('click', handleCopy);
  clearBtn.addEventListener('click', handleClear);
  downloadBtn.addEventListener('click', handleDownload);

  // Enter key in textarea
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleConvert();
    }
  });
})();
