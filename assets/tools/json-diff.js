// JSON Diff - deep compare two JSON values with visual diff output
(function () {
  'use strict';

  const leftInput = document.getElementById('jdLeft');
  const rightInput = document.getElementById('jdRight');
  const compareBtn = document.getElementById('jdCompare');
  const output = document.getElementById('jdOutput');
  const status = document.getElementById('jdStatus');
  const isEN = document.documentElement.lang === 'en';

  const t = {
    empty: isEN ? 'Paste JSON in both inputs.' : '请在两侧都粘贴 JSON。',
    emptySide: isEN ? 'Paste JSON in both inputs.' : '两侧都需要 JSON。',
    leftError: isEN ? 'Left JSON error: ' : '左侧 JSON 错误：',
    rightError: isEN ? 'Right JSON error: ' : '右侧 JSON 错误：',
    identical: isEN ? '✓ Identical' : '✓ 完全相同',
    diff: (a, b, c) => isEN ? `Found ${a} different nodes, ${b} added, ${c} removed` : `发现 ${a} 处不同，${b} 处新增，${c} 处删除`,
    copied: isEN ? 'Diff summary copied.' : '差异摘要已复制。',
    copyFail: isEN ? 'Copy failed.' : '复制失败。',
  };

  function escape(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function typeLabel(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  }

  // Deep diff: returns array of { path, type, leftVal, rightVal }
  function deepDiff(left, right, path) {
    const diffs = [];
    if (left === right) return diffs;

    const tl = typeLabel(left);
    const tr = typeLabel(right);

    if (tl !== tr) {
      diffs.push({ path: path.join('.'), type: 'type', leftVal: tl + ': ' + JSON.stringify(left), rightVal: tr + ': ' + JSON.stringify(right) });
      return diffs;
    }

    if (tl === 'object' || tl === 'array') {
      const lKeys = Array.isArray(left) ? left.map((_, i) => i) : Object.keys(left);
      const rKeys = Array.isArray(right) ? right.map((_, i) => i) : Object.keys(right);
      const allKeys = new Set([...lKeys, ...rKeys]);

      for (const key of allKeys) {
        const keyPath = Array.isArray(left) ? path.concat(`[${key}]`) : path.concat(key);
        if (key in left && !(key in right)) {
          diffs.push({ path: keyPath.join('.'), type: 'removed', leftVal: JSON.stringify(left[key]), rightVal: '(missing)' });
        } else if (!(key in left) && key in right) {
          diffs.push({ path: keyPath.join('.'), type: 'added', leftVal: '(missing)', rightVal: JSON.stringify(right[key]) });
        } else {
          diffs.push(...deepDiff(left[key], right[key], keyPath));
        }
      }
    } else {
      diffs.push({ path: path.join('.'), type: 'changed', leftVal: JSON.stringify(left), rightVal: JSON.stringify(right) });
    }

    return diffs;
  }

  function formatValue(val) {
    if (val === '(missing)') return '<span class="jd-missing">' + escape(val) + '</span>';
    try {
      const parsed = JSON.parse(val);
      return '<span class="jd-value">' + escape(JSON.stringify(parsed, null, 2).substring(0, 200)) + '</span>';
    } catch { return '<span class="jd-value">' + escape(val) + '</span>'; }
  }

  function renderDiff(diffs) {
    if (!diffs.length) {
      return '<div class="jd-identical">' + t.identical + '</div>';
    }

    let added = 0, removed = 0, changed = 0;
    diffs.forEach(d => {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') removed++;
      else changed++;
    });

    const summary = '<div class="jd-summary">' + t.diff(changed, added, removed) + '</div>';

    const rows = diffs.map(d => {
      const typeClass = 'jd-' + d.type;
      const label = d.type === 'added' ? '➕ Added' : d.type === 'removed' ? '➖ Removed' : d.type === 'type' ? '⚠️ Type' : '✏️ Changed';
      return `<tr class="${typeClass}">
        <td class="jd-path">${escape(d.path)}</td>
        <td class="jd-label">${label}</td>
        <td class="jd-old">${d.leftVal !== '(missing)' ? formatValue(d.leftVal) : '<span class="jd-missing">(missing)</span>'}</td>
        <td class="jd-new">${d.rightVal !== '(missing)' ? formatValue(d.rightVal) : '<span class="jd-missing">(missing)</span>'}</td>
      </tr>`;
    }).join('');

    const table = `<table class="jd-table">
      <thead><tr><th>${isEN ? 'Path' : '路径'}</th><th>${isEN ? 'Type' : '类型'}</th><th>${isEN ? 'Left (Old)' : '左侧（旧）'}</th><th>${isEN ? 'Right (New)' : '右侧（新）'}</th></tr></thead>
      <tbody>${rows}</tbody></table>`;

    return summary + table;
  }

  function compare() {
    status.textContent = '';
    output.innerHTML = '';

    const leftStr = leftInput.value.trim();
    const rightStr = rightInput.value.trim();

    if (!leftStr || !rightStr) {
      status.textContent = t.emptySide;
      status.style.color = 'var(--warning)';
      return;
    }

    let left, right;
    try {
      left = JSON.parse(leftStr);
    } catch (e) {
      status.textContent = t.leftError + e.message;
      status.style.color = 'var(--error)';
      return;
    }
    try {
      right = JSON.parse(rightStr);
    } catch (e) {
      status.textContent = t.rightError + e.message;
      status.style.color = 'var(--error)';
      return;
    }

    const diffs = deepDiff(left, right, []);
    output.innerHTML = renderDiff(diffs);

    const changed = diffs.filter(d => d.type === 'changed').length;
    const added = diffs.filter(d => d.type === 'added').length;
    const removed = diffs.filter(d => d.type === 'removed').length;

    if (diffs.length === 0) {
      status.textContent = t.identical;
      status.style.color = 'var(--success)';
    } else {
      status.textContent = t.diff(changed, added, removed);
      status.style.color = 'var(--text-dim)';
    }
  }

  function copyAsText() {
    const text = 'JSON Diff Result:\n' + (status.textContent || '') + '\n\n' + (output.textContent || '');
    navigator.clipboard.writeText(text).then(() => {
      status.textContent = t.copied;
      status.style.color = 'var(--success)';
    }).catch(() => {
      status.textContent = t.copyFail;
      status.style.color = 'var(--error)';
    });
  }

  compareBtn.addEventListener('click', compare);

  const copyBtn = document.getElementById('jdCopy');
  if (copyBtn) copyBtn.addEventListener('click', copyAsText);

  // Auto-compare on input change with debounce
  let debounceTimer;
  function debounceCompare() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compare, 600);
  }
  leftInput.addEventListener('input', debounceCompare);
  rightInput.addEventListener('input', debounceCompare);
})();