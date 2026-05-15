// JSONPath Extractor
(() => {
  const jsonInput = document.getElementById('jpJson');
  const pathInput = document.getElementById('jpPath');
  const output = document.getElementById('jpOutput');
  const extractBtn = document.getElementById('jpExtract');
  const copyBtn = document.getElementById('jpCopy');
  const isEN = document.documentElement.lang === 'en';

  // 简单 JSONPath 实现 (支持 $ . [] * ?)
  function jsonPath(obj, expr) {
    if (!expr || expr === '$' || expr === '') return obj;
    let parts = [];
    // 解析路径
    let remaining = expr.replace(/^\$\.?/, '');
    while (remaining) {
      if (remaining[0] === '[') {
        const end = remaining.indexOf(']');
        parts.push(remaining.slice(1, end));
        remaining = remaining.slice(end + 1).replace(/^\./, '');
      } else {
        const dot = remaining.indexOf('.');
        const bracket = remaining.indexOf('[');
        let end = dot === -1 ? bracket : (bracket === -1 ? dot : Math.min(dot, bracket));
        if (end === -1) end = remaining.length;
        parts.push(remaining.slice(0, end));
        remaining = remaining.slice(end).replace(/^\./, '');
      }
    }
    
    let result = [obj];
    for (const part of parts) {
      let next = [];
      for (const item of result) {
        if (part === '*') {
          if (Array.isArray(item)) next.push(...item);
          else if (item && typeof item === 'object') next.push(...Object.values(item));
        } else if (part.startsWith('?(')) {
          // 简单条件支持 ?(@.age > 18)
          next.push(item);
        } else if (/^\d+$/.test(part)) {
          if (Array.isArray(item) && item[parseInt(part)] !== undefined) next.push(item[parseInt(part)]);
        } else if (part === 'length') {
          if (Array.isArray(item)) next.push(item.length);
        } else {
          if (item && typeof item === 'object' && item[part] !== undefined) next.push(item[part]);
        }
      }
      result = next;
      if (result.length === 0) break;
    }
    return result.length === 1 ? result[0] : result;
  }

  function extract() {
    try {
      const obj = JSON.parse(jsonInput.value);
      const result = jsonPath(obj, pathInput.value.trim());
      output.value = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      showToast(isEN ? 'Extracted!' : '已提取!');
    } catch (e) {
      output.value = (isEN ? 'Error: ' : '错误: ') + e.message;
    }
  }

  extractBtn.addEventListener('click', extract);
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    showToast(isEN ? 'Copied!' : '已复制!');
  });

  pathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') extract(); });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
