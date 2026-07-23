// JSON to Markdown Table — convert JSON arrays/objects to Markdown tables
(() => {
  'use strict';

  const input = document.getElementById('jtm-input');
  const output = document.getElementById('jtm-output');
  const convertBtn = document.getElementById('jtm-convert');
  const copyBtn = document.getElementById('jtm-copy');
  const clearBtn = document.getElementById('jtm-clear');
  const status = document.getElementById('jtm-status');
  const isEN = document.documentElement.lang === 'en';

  if (!input) return;

  const msg = {
    empty: isEN ? 'Please paste JSON data first.' : '请先粘贴 JSON 数据。',
    error: isEN ? 'Invalid JSON:' : 'JSON 格式错误：',
    ok: (r, c) => isEN ? `Done: ${r} rows × ${c} cols` : `完成：${r} 行 × ${c} 列`,
    copied: isEN ? 'Copied to clipboard!' : '已复制到剪贴板！',
    fail: isEN ? 'Copy failed.' : '复制失败。',
    noArray: isEN ? 'Input must be a JSON array of objects.' : '输入必须是 JSON 对象数组。',
    emptyData: isEN ? 'The array is empty.' : '数组为空。',
    clear: isEN ? 'Cleared.' : '已清空。',
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function escapeMd(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  }

  function getValue(obj, path) {
    const parts = path.split('.');
    let val = obj;
    for (const p of parts) {
      if (val === null || val === undefined || typeof val !== 'object') return undefined;
      val = val[p];
    }
    return val;
  }

  // Recursively collect all keys from an array of objects
  function collectKeys(arr, prefix = '') {
    const keys = new Set();
    arr.forEach(item => {
      if (item === null || item === undefined || typeof item !== 'object') return;
      Object.keys(item).forEach(k => {
        const fullKey = prefix ? prefix + '.' + k : k;
        const val = item[k];
        if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
          collectKeys([val], fullKey).forEach(k2 => keys.add(k2));
        } else {
          keys.add(fullKey);
        }
      });
    });
    return Array.from(keys);
  }

  function formatCell(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return escapeMd(JSON.stringify(val));
    }
    return escapeMd(val);
  }

  function convert() {
    const raw = input.value.trim();
    if (!raw) {
      show(msg.empty, 'warning');
      output.value = '';
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      show(msg.error + ' ' + e.message, 'error');
      return;
    }

    // Normalize: if it's a single object, wrap in array
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      show(msg.emptyData, 'warning');
      output.value = '';
      return;
    }

    // Check that items are objects
    if (typeof data[0] !== 'object' || data[0] === null || Array.isArray(data[0])) {
      show(msg.noArray, 'error');
      return;
    }

    const keys = collectKeys(data);

    // Build header row
    const header = '| ' + keys.map(k => escapeMd(k)).join(' | ') + ' |';
    const separator = '| ' + keys.map(() => '---').join(' | ') + ' |';
    const rows = data.map(item => {
      return '| ' + keys.map(k => formatCell(getValue(item, k))).join(' | ') + ' |';
    });

    const md = [header, separator, ...rows].join('\n');
    output.value = md;
    show(msg.ok(data.length, keys.length), 'success');
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

  // Auto-convert on paste (debounced)
  let autoTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(convert, 600);
  });

  // Keyboard shortcut: Ctrl+Enter to convert
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      convert();
    }
  });
})();