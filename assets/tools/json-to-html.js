// JSON to HTML Table - convert JSON data to sortable HTML tables
(() => {
  const jsonInput = document.getElementById('json-input');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const tableContainer = document.getElementById('table-container');
  const status = document.getElementById('status');
  const isEN = document.documentElement.lang === 'en';

  if (!jsonInput || !tableContainer) return;

  const msg = {
    empty: isEN ? 'Please paste JSON first.' : '请先粘贴 JSON。',
    error: isEN ? 'Invalid JSON:' : 'JSON 格式错误：',
    ok: isEN ? 'Table generated. All processing is local.' : '表格已生成。所有处理在浏览器本地完成。',
    copied: isEN ? 'Copied as Markdown table!' : '已复制为 Markdown 表格！',
    clear: isEN ? 'Cleared.' : '已清空。',
    noData: isEN ? 'No data to display.' : '没有可显示的数据。',
    rows: (n) => isEN ? `${n} rows` : `${n} 行`,
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  // Parse JSON input
  function parseData() {
    const raw = jsonInput.value.trim();
    if (!raw) { show(msg.empty, 'warning'); return null; }
    try {
      let data = JSON.parse(raw);
      // Normalize: if it's a single object, wrap in array
      if (!Array.isArray(data)) data = [data];
      return data;
    } catch (e) {
      show(msg.error + ' ' + e.message, 'error');
      return null;
    }
  }

  // Recursively get all unique keys from an array of objects
  function getAllKeys(arr, prefix = '') {
    const keys = new Set();
    arr.forEach(item => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        Object.keys(item).forEach(k => {
          const fullKey = prefix ? prefix + '.' + k : k;
          const val = item[k];
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            // Merge nested keys
            getAllKeys([val], fullKey).forEach(k2 => keys.add(k2));
          } else {
            keys.add(fullKey);
          }
        });
      }
    });
    return Array.from(keys).sort();
  }

  // Get value for a nested key path
  function getNestedValue(obj, path) {
    const parts = path.split('.');
    let val = obj;
    for (const p of parts) {
      if (val === null || val === undefined || typeof val !== 'object') return undefined;
      val = val[p];
    }
    return val;
  }

  // Format a cell value for display
  function formatCellValue(val) {
    if (val === null || val === undefined) return '<span class="json-null">null</span>';
    if (typeof val === 'boolean') return `<span class="json-bool">${val}</span>`;
    if (typeof val === 'number') return `<span class="json-number">${val}</span>`;
    if (Array.isArray(val)) {
      if (val.length === 0) return '<span class="json-empty">[]</span>';
      const preview = val.slice(0, 3).map(v => formatCellValue(v)).join(', ');
      const extra = val.length > 3 ? `, ...` : '';
      return `<span class="json-nested clickable" data-type="array" data-content='${escapeHtml(JSON.stringify(val))}'>[${preview}${extra}]</span>`;
    }
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return '<span class="json-empty">{}</span>';
      const preview = keys.slice(0, 3).map(k => `${k}: ...`).join(', ');
      const extra = keys.length > 3 ? `, ...` : '';
      return `<span class="json-nested clickable" data-type="object" data-content='${escapeHtml(JSON.stringify(val))}'>{${preview}${extra}}</span>`;
    }
    // String - escape HTML
    return escapeHtml(val);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Escape for Markdown table cell
  function escapeMd(str) {
    return String(str).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  }

  function getCellText(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  let currentData = [];
  let currentKeys = [];

  let sortCol = -1;
  let sortAsc = true;

  function buildTable(data, keys) {
    currentData = data;
    currentKeys = keys;

    if (!data || data.length === 0) {
      tableContainer.innerHTML = `<p style="color:var(--text-dim);padding:20px;text-align:center">${msg.noData}</p>`;
      return;
    }

    let html = '<table class="json-table" style="width:100%;border-collapse:collapse;font-size:13px">';
    // Header
    html += '<thead><tr>';
    html += `<th style="padding:8px 10px;border:1px solid var(--border);background:var(--bg-hover);text-align:left;cursor:pointer;white-space:nowrap;user-select:none" data-col="-1">#</th>`;
    keys.forEach((key, i) => {
      const sortIcon = sortCol === i ? (sortAsc ? ' ▲' : ' ▼') : '';
      html += `<th style="padding:8px 10px;border:1px solid var(--border);background:var(--bg-hover);text-align:left;cursor:pointer;white-space:nowrap;user-select:none" data-col="${i}">${escapeHtml(key)}${sortIcon}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Sort data if needed
    let sortedData = [...data];
    if (sortCol >= 0 && sortCol < keys.length) {
      sortedData.sort((a, b) => {
        const va = getNestedValue(a, keys[sortCol]);
        const vb = getNestedValue(b, keys[sortCol]);
        if (va === undefined && vb === undefined) return 0;
        if (va === undefined) return 1;
        if (vb === undefined) return -1;
        const sa = String(va);
        const sb = String(vb);
        const na = parseFloat(sa);
        const nb = parseFloat(sb);
        if (!isNaN(na) && !isNaN(nb)) {
          return sortAsc ? na - nb : nb - na;
        }
        return sortAsc ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }

    sortedData.forEach((row, idx) => {
      html += '<tr>';
      html += `<td style="padding:6px 10px;border:1px solid var(--border);color:var(--text-dim);text-align:right">${idx + 1}</td>`;
      keys.forEach(key => {
        const val = getNestedValue(row, key);
        html += `<td style="padding:6px 10px;border:1px solid var(--border);max-width:400px;overflow:hidden;text-overflow:ellipsis">${formatCellValue(val)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += `<div style="margin-top:8px;font-size:12px;color:var(--text-dim)">${msg.rows(data.length)}</div>`;

    tableContainer.innerHTML = html;

    // Click handler for nested expand/collapse
    tableContainer.querySelectorAll('.clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.classList.contains('expanded')) {
          // Collapse
          const parent = el.parentElement;
          const preview = el.dataset.content ? JSON.parse(el.dataset.content) : {};
          el.innerHTML = formatCellValue(preview).replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');
          el.classList.remove('expanded');
          return;
        }
        // Expand
        try {
          const content = JSON.parse(el.dataset.content);
          el.innerHTML = `<pre style="margin:2px 0;padding:4px 6px;background:var(--bg-card);border:1px solid var(--border);border-radius:4px;font-size:11px;max-height:200px;overflow:auto">${escapeHtml(JSON.stringify(content, null, 2))}</pre>`;
          el.classList.add('expanded');
        } catch(e) { /* ignore */ }
      });
    });

    // Header click for sorting
    tableContainer.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = parseInt(th.dataset.col);
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = true;
        }
        buildTable(currentData, currentKeys);
      });
    });
  }

  function convert() {
    const data = parseData();
    if (!data) return;
    if (data.length === 0) {
      if (data.length === 0) {
        tableContainer.innerHTML = `<p style="color:var(--text-dim);padding:20px;text-align:center">${msg.noData}</p>`;
      }
      show(msg.noData, 'warning');
      return;
    }
    sortCol = -1;
    sortAsc = true;
    const keys = getAllKeys(data);
    // Filter out numeric indices for arrays
    const filteredKeys = keys.filter(k => !/^\d+$/.test(k));
    buildTable(data, filteredKeys.length > 0 ? filteredKeys : keys);
    show(msg.ok, 'success');
  }

  function copyAsMarkdown() {
    const data = parseData();
    if (!data) return;
    const keys = currentKeys.length > 0 ? currentKeys : getAllKeys(data);
    const filteredKeys = keys.filter(k => !/^\d+$/.test(k));
    const useKeys = filteredKeys.length > 0 ? filteredKeys : keys;

    let md = '| # | ' + useKeys.map(k => escapeMd(k)).join(' | ') + ' |\n';
    md += '|---|' + useKeys.map(() => '---').join('|') + '|\n';

    data.forEach((row, idx) => {
      const cells = useKeys.map(key => {
        const val = getNestedValue(row, key);
        return escapeMd(getCellText(val));
      });
      md += `| ${idx + 1} | ${cells.join(' | ')} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      show(msg.copied, 'success');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      show(msg.copied, 'success');
    });
  }

  function clear() {
    jsonInput.value = '';
    tableContainer.innerHTML = '';
    sortCol = -1;
    sortAsc = true;
    currentData = [];
    currentKeys = [];
    show(msg.clear, 'info');
  }

  // Event listeners
  convertBtn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copyAsMarkdown);
  clearBtn.addEventListener('click', clear);

  // Ctrl+Enter shortcut
  jsonInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      convert();
    }
  });

  // Load example data on first focus if empty
  let exampleLoaded = false;
  jsonInput.addEventListener('focus', () => {
    if (!exampleLoaded && !jsonInput.value.trim()) {
      jsonInput.value = JSON.stringify([
        { "name": "Alice", "age": 30, "city": "New York", "skills": { "js": true, "python": true }, "active": true },
        { "name": "Bob", "age": 25, "city": "London", "skills": { "js": true, "python": false }, "active": false },
        { "name": "Charlie", "age": 35, "city": "Tokyo", "skills": { "js": false, "python": true }, "active": true }
      ], null, 2);
      exampleLoaded = true;
    }
  });

  // Auto-generate on first load
  setTimeout(() => {
    if (!jsonInput.value.trim()) {
      jsonInput.value = JSON.stringify([
        { "name": "Alice", "age": 30, "city": "New York", "skills": { "js": true, "python": true }, "active": true },
        { "name": "Bob", "age": 25, "city": "London", "skills": { "js": true, "python": false }, "active": false },
        { "name": "Charlie", "age": 35, "city": "Tokyo", "skills": { "js": false, "python": true }, "active": true }
      ], null, 2);
      exampleLoaded = true;
      convert();
    }
  }, 100);
})();