// JSON Flatten / Unflatten
// Flatten nested JSON into dot-notation keys, and unflatten back
(function() {
  'use strict';

  const input = document.getElementById('jf-input');
  const actionBtn = document.getElementById('jf-action-btn');
  const copyBtn = document.getElementById('jf-copy-btn');
  const output = document.getElementById('jf-output');
  const stats = document.getElementById('jf-stats');

  function getMode() {
    const radios = document.getElementsByName('jf-mode');
    for (const r of radios) {
      if (r.checked) return r.value;
    }
    return 'flatten';
  }

  function flatten(obj, prefix, result) {
    prefix = prefix || '';
    result = result || {};
    if (obj === null || obj === undefined) {
      result[prefix] = obj;
      return result;
    }
    if (typeof obj !== 'object') {
      result[prefix] = obj;
      return result;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        result[prefix] = [];
        return result;
      }
      for (let i = 0; i < obj.length; i++) {
        const key = prefix ? `${prefix}.${i}` : `${i}`;
        flatten(obj[i], key, result);
      }
      return result;
    }
    // Plain object
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      result[prefix] = {};
      return result;
    }
    for (const key of keys) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      flatten(obj[key], newPrefix, result);
    }
    return result;
  }

  function unflatten(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        // Check if next part is numeric -> this should be an array
        const nextIsNumeric = !isLast && /^\d+$/.test(parts[i + 1]);
        const currentIsNumeric = /^\d+$/.test(part);

        if (isLast) {
          if (currentIsNumeric && Array.isArray(current)) {
            current[parseInt(part)] = obj[key];
          } else {
            current[part] = obj[key];
          }
        } else {
          if (nextIsNumeric) {
            // Ensure array
            if (!current[part]) {
              current[part] = [];
            }
            current = current[part];
          } else {
            if (!current[part]) {
              current[part] = {};
            }
            if (typeof current[part] === 'object' && !Array.isArray(current[part])) {
              current = current[part];
            } else {
              // Collision case, overwrite
              current[part] = {};
              current = current[part];
            }
          }
        }
      }
    }
    // Fix sparse arrays
    return fixArrays(result);
  }

  function fixArrays(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      // Check if it's a sparse array with only numeric indices
      let maxIdx = -1;
      let hasOnlyNumeric = true;
      for (const k of Object.keys(obj)) {
        if (!/^\d+$/.test(k)) { hasOnlyNumeric = false; break; }
        maxIdx = Math.max(maxIdx, parseInt(k));
      }
      if (hasOnlyNumeric && maxIdx >= 0) {
        const arr = [];
        for (let i = 0; i <= maxIdx; i++) {
          arr.push(obj[i] !== undefined ? fixArrays(obj[i]) : null);
        }
        return arr;
      }
      return obj.map(fixArrays);
    }
    const result = {};
    for (const k of Object.keys(obj)) {
      result[k] = fixArrays(obj[k]);
    }
    return result;
  }

  function processFlatten() {
    const raw = input.value.trim();
    if (!raw) {
      output.value = '';
      if (stats) stats.textContent = '请输入 JSON';
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      output.value = '';
      if (stats) {
        stats.textContent = `❌ JSON 解析错误: ${e.message}`;
        stats.style.color = 'var(--danger)';
      }
      return;
    }

    const mode = getMode();
    let result, originalKeys;

    try {
      if (mode === 'flatten') {
        const flatObj = flatten(parsed);
        originalKeys = Object.keys(typeof parsed === 'object' ? parsed : {}).length;
        result = flatObj;
      } else {
        // unflatten
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
          output.value = '';
          if (stats) {
            stats.textContent = '❌ 还原模式需要展平后的 JSON 对象';
            stats.style.color = 'var(--danger)';
          }
          return;
        }
        result = unflatten(parsed);
        originalKeys = Object.keys(parsed).length;
      }
    } catch (e) {
      output.value = '';
      if (stats) {
        stats.textContent = `❌ 处理错误: ${e.message}`;
        stats.style.color = 'var(--danger)';
      }
      return;
    }

    output.value = JSON.stringify(result, null, 2);

    // Stats
    if (stats) {
      const resultKeys = mode === 'flatten'
        ? Object.keys(result).length
        : Object.keys(typeof result === 'object' && !Array.isArray(result) ? result : {}).length;
      const modeLabel = mode === 'flatten' ? '展平' : '还原';
      stats.innerHTML = `✓ ${modeLabel}完成 | ${originalKeys} → ${resultKeys} 个键`;
      stats.style.color = 'var(--success)';
    }
  }

  function init() {
    if (!input || !actionBtn) return;

    actionBtn.addEventListener('click', processFlatten);

    // Ctrl+Enter
    input.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        processFlatten();
      }
    });

    // Mode change
    document.querySelectorAll('[name="jf-mode"]').forEach(r => {
      r.addEventListener('change', function() {
        const mode = getMode();
        input.placeholder = mode === 'flatten'
          ? '粘贴 JSON...'
          : '粘贴展平后的 JSON (点号键名)...';
        output.value = '';
        if (stats) stats.textContent = '';
      });
    });

    // Copy
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        const val = output.value;
        if (!val) return;
        navigator.clipboard.writeText(val).then(() => {
          copyBtn.textContent = '✅ 已复制';
          setTimeout(() => { copyBtn.textContent = '📋 复制'; }, 2000);
        }).catch(() => {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = val;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = '✅ 已复制';
          setTimeout(() => { copyBtn.textContent = '📋 复制'; }, 2000);
        });
      });
    }
  }

  if (document.getElementById('jf-input')) {
    init();
  }
})();