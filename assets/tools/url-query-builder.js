// URL Query Builder - browser-local URL parameter editor
(() => {
  'use strict';

  const baseInput = document.getElementById('uqBase');
  const parseBtn = document.getElementById('uqParse');
  const addBtn = document.getElementById('uqAdd');
  const utmBtn = document.getElementById('uqUtm');
  const clearBtn = document.getElementById('uqClear');
  const rowsEl = document.getElementById('uqRows');
  const fullOutput = document.getElementById('uqFull');
  const queryOutput = document.getElementById('uqQuery');
  const copyFullBtn = document.getElementById('uqCopyFull');
  const copyQueryBtn = document.getElementById('uqCopyQuery');
  const status = document.getElementById('uqStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!baseInput || !rowsEl || !fullOutput || !queryOutput) return;

  let params = [];

  const t = {
    parsed: isEN ? 'Parsed URL parameters locally.' : '已在浏览器本地解析 URL 参数。',
    built: count => isEN ? `Built URL with ${count} parameters.` : `已生成包含 ${count} 个参数的 URL。`,
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Parameters cleared.' : '参数已清空。',
    invalid: isEN ? 'Invalid URL. You can still edit parameters manually.' : 'URL 格式不完整，仍可手动编辑参数。',
    key: isEN ? 'key' : '参数名',
    value: isEN ? 'value' : '参数值',
    remove: isEN ? 'Remove' : '删除'
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function splitBase(raw) {
    const value = raw.trim();
    if (!value) return { base: '', hash: '' };
    const hashIndex = value.indexOf('#');
    const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
    const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
    const qIndex = beforeHash.indexOf('?');
    return {
      base: qIndex >= 0 ? beforeHash.slice(0, qIndex) : beforeHash,
      query: qIndex >= 0 ? beforeHash.slice(qIndex + 1) : '',
      hash
    };
  }

  function parseQuery(query) {
    const list = [];
    if (!query) return list;
    query.split('&').forEach(part => {
      if (!part) return;
      const eq = part.indexOf('=');
      const rawKey = eq >= 0 ? part.slice(0, eq) : part;
      const rawValue = eq >= 0 ? part.slice(eq + 1) : '';
      list.push({
        key: safeDecode(rawKey),
        value: safeDecode(rawValue)
      });
    });
    return list;
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(String(value).replace(/\+/g, ' '));
    } catch (err) {
      return String(value);
    }
  }

  function encode(value) {
    return encodeURIComponent(value).replace(/%20/g, '+');
  }

  function renderRows() {
    rowsEl.innerHTML = '';
    params.forEach((param, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid var(--border)"><input data-index="${index}" data-field="key" type="text" value="${escapeAttr(param.key)}" placeholder="${t.key}" style="width:100%;font-family:monospace"></td>
        <td style="padding:8px;border-bottom:1px solid var(--border)"><input data-index="${index}" data-field="value" type="text" value="${escapeAttr(param.value)}" placeholder="${t.value}" style="width:100%;font-family:monospace"></td>
        <td style="padding:8px;border-bottom:1px solid var(--border);text-align:center"><button class="btn btn-secondary" data-remove="${index}" type="button">${t.remove}</button></td>
      `;
      rowsEl.appendChild(tr);
    });
    updateOutput();
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function readRowsFromDom() {
    rowsEl.querySelectorAll('input[data-index]').forEach(input => {
      const index = Number(input.dataset.index);
      const field = input.dataset.field;
      if (params[index] && field) params[index][field] = input.value;
    });
  }

  function buildQuery() {
    return params
      .filter(param => param.key !== '')
      .map(param => `${encode(param.key)}=${encode(param.value)}`)
      .join('&');
  }

  function updateOutput() {
    const { base, hash } = splitBase(baseInput.value);
    const query = buildQuery();
    queryOutput.value = query;
    fullOutput.value = `${base}${query ? '?' + query : ''}${hash || ''}`;
    show(t.built(params.filter(p => p.key !== '').length), 'success');
  }

  function parseUrl() {
    const parts = splitBase(baseInput.value);
    if (parts.query) {
      params = parseQuery(parts.query);
      baseInput.value = parts.base + (parts.hash || '');
      show(t.parsed, 'success');
    } else {
      try {
        const url = new URL(baseInput.value);
        params = [...url.searchParams.entries()].map(([key, value]) => ({ key, value }));
        url.search = '';
        baseInput.value = url.toString();
        show(t.parsed, 'success');
      } catch (err) {
        if (!params.length) params = [{ key: '', value: '' }];
        show(t.invalid, 'warning');
      }
    }
    if (!params.length) params = [{ key: '', value: '' }];
    renderRows();
  }

  function addParam(key = '', value = '') {
    readRowsFromDom();
    params.push({ key, value });
    renderRows();
  }

  function addUtmTemplate() {
    readRowsFromDom();
    const existingKeys = new Set(params.map(p => p.key));
    [
      ['utm_source', ''],
      ['utm_medium', ''],
      ['utm_campaign', ''],
      ['utm_content', ''],
      ['utm_term', '']
    ].forEach(([key, value]) => {
      if (!existingKeys.has(key)) params.push({ key, value });
    });
    renderRows();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof toast === 'function') toast(t.copied);
      show(t.copied, 'success');
    } catch (err) {
      show(t.copied, 'success');
    }
  }

  rowsEl.addEventListener('input', e => {
    const target = e.target.closest('input[data-index]');
    if (!target) return;
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    if (params[index] && field) params[index][field] = target.value;
    updateOutput();
  });

  rowsEl.addEventListener('click', e => {
    const button = e.target.closest('button[data-remove]');
    if (!button) return;
    readRowsFromDom();
    params.splice(Number(button.dataset.remove), 1);
    if (!params.length) params.push({ key: '', value: '' });
    renderRows();
  });

  baseInput.addEventListener('input', updateOutput);
  parseBtn?.addEventListener('click', parseUrl);
  addBtn?.addEventListener('click', () => addParam());
  utmBtn?.addEventListener('click', addUtmTemplate);
  clearBtn?.addEventListener('click', () => {
    params = [{ key: '', value: '' }];
    renderRows();
    show(t.cleared, 'info');
  });
  copyFullBtn?.addEventListener('click', () => copyText(fullOutput.value));
  copyQueryBtn?.addEventListener('click', () => copyText(queryOutput.value));

  parseUrl();
})();
