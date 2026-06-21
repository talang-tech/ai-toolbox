// JSON Sorter
(function () {
  'use strict';

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const msg = document.getElementById('msg');
  const isEN = document.documentElement.lang === 'en';

  // Sort object keys recursively
  function sortKeys(obj, caseSensitive, numeric) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(v => sortKeys(v, caseSensitive, numeric));
    if (typeof obj !== 'object') return obj;

    const sorted = {};
    const keys = Object.keys(obj);
    if (caseSensitive) {
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric }));
    } else {
      keys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), undefined, { numeric }));
    }
    for (const k of keys) {
      sorted[k] = sortKeys(obj[k], caseSensitive, numeric);
    }
    return sorted;
  }

  // Sort array elements (only top-level arrays maintain; nested also via recursive)
  function sortArrayValues(obj, caseSensitive, numeric) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    const result = Array.isArray(obj) ? [...obj] : {};
    for (const key of Object.keys(result)) {
      result[key] = sortArrayValues(result[key], caseSensitive, numeric);
    }
    if (Array.isArray(result)) {
      result.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number' && numeric) return a - b;
        const sa = String(a), sb = String(b);
        if (caseSensitive) return sa.localeCompare(sb, undefined, { numeric });
        return sa.toLowerCase().localeCompare(sb.toLowerCase(), undefined, { numeric });
      });
    }
    return result;
  }

  // Reverse keys at all levels
  function reverseKeys(obj) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(reverseKeys);
    if (typeof obj !== 'object') return obj;

    const keys = Object.keys(obj).sort().reverse();
    const sorted = {};
    for (const k of keys) {
      sorted[k] = reverseKeys(obj[k]);
    }
    return sorted;
  }

  function getOptions() {
    const cs = document.getElementById('caseSensitive');
    const ns = document.getElementById('numericSort');
    return {
      caseSensitive: cs ? cs.checked : true,
      numeric: ns ? ns.checked : false
    };
  }

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error)' : 'var(--success)';
  }

  function process(action) {
    showMsg('');
    const raw = input.value.trim();
    if (!raw) {
      showMsg(isEN ? 'Please enter JSON.' : '请输入 JSON。', false);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      output.value = '';
      showMsg('✗ ' + e.message, true);
      return;
    }
    try {
      const opts = getOptions();
      let result;
      switch (action) {
        case 'sortKeys':
          result = sortKeys(parsed, opts.caseSensitive, opts.numeric);
          break;
        case 'sortValues':
          result = sortArrayValues(parsed, opts.caseSensitive, opts.numeric);
          break;
        case 'reverseKeys':
          result = reverseKeys(parsed);
          break;
        case 'deepSort':
          // Full recursive: keys + arrays
          result = sortKeys(parsed, opts.caseSensitive, opts.numeric);
          result = sortArrayValues(result, opts.caseSensitive, opts.numeric);
          break;
        default:
          return;
      }
      output.value = JSON.stringify(result, null, 2);
      showMsg(isEN ? '✓ Sorted successfully' : '✓ 排序成功', false);
      trackEvent('sort', { action });
    } catch (e) {
      output.value = '';
      showMsg('✗ ' + e.message, true);
    }
  }

  document.getElementById('sortKeysBtn')?.addEventListener('click', () => process('sortKeys'));
  document.getElementById('sortValuesBtn')?.addEventListener('click', () => process('sortValues'));
  document.getElementById('reverseKeysBtn')?.addEventListener('click', () => process('reverseKeys'));
  document.getElementById('deepSortBtn')?.addEventListener('click', () => process('deepSort'));

  // Copy output on click
  output?.addEventListener('click', () => {
    if (output.value) {
      navigator.clipboard.writeText(output.value);
      showMsg(isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板', false);
    }
  });
})();