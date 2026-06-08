// YAML Formatter & Validator - lightweight browser-local checker
(() => {
  const input = document.getElementById('yamlInput');
  const output = document.getElementById('yamlOutput');
  const formatBtn = document.getElementById('yamlFormat');
  const minifyBtn = document.getElementById('yamlMinify');
  const copyBtn = document.getElementById('yamlCopy');
  const clearBtn = document.getElementById('yamlClear');
  const status = document.getElementById('yamlStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output) return;

  const msg = {
    empty: isEN ? 'Paste YAML first.' : '请先粘贴 YAML。',
    ok: isEN ? 'YAML looks OK. Formatted locally in your browser.' : 'YAML 看起来正常。已在浏览器本地格式化。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    issues: isEN ? 'Found possible YAML issues:' : '发现可能的 YAML 问题：',
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.innerHTML = text;
  }

  function lineMessage(lineNo, text) {
    return isEN ? `Line ${lineNo}: ${text}` : `第 ${lineNo} 行：${text}`;
  }

  function stripComment(line) {
    let quote = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = line[i - 1];
      if ((ch === '"' || ch === "'") && prev !== '\\') quote = quote === ch ? null : (quote || ch);
      if (ch === '#' && !quote) return line.slice(0, i);
    }
    return line;
  }

  function hasUnclosedQuote(text) {
    let single = false;
    let dbl = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const prev = text[i - 1];
      if (ch === "'" && !dbl) single = !single;
      if (ch === '"' && !single && prev !== '\\') dbl = !dbl;
    }
    return single || dbl;
  }

  function validate(text) {
    const issues = [];
    const scopes = new Map();
    const lines = text.replace(/\r\n?/g, '\n').split('\n');

    lines.forEach((raw, idx) => {
      const lineNo = idx + 1;
      if (!raw.trim() || raw.trim().startsWith('#')) return;
      const leading = raw.match(/^\s*/)[0];
      const indent = leading.replace(/\t/g, '  ').length;
      const content = raw.trim();
      const clean = stripComment(raw).trim();

      if (/\t/.test(leading)) {
        issues.push(lineMessage(lineNo, isEN ? 'Tab indentation detected. YAML usually expects spaces.' : '检测到 Tab 缩进，YAML 通常应使用空格。'));
      }
      if (indent % 2 !== 0) {
        issues.push(lineMessage(lineNo, isEN ? 'Odd indentation; 2-space indentation is recommended.' : '缩进为空格奇数，建议使用 2 空格层级。'));
      }
      if (hasUnclosedQuote(clean)) {
        issues.push(lineMessage(lineNo, isEN ? 'Possible unclosed quote.' : '可能存在未闭合引号。'));
      }
      if (/^[-?]\s*$/.test(content)) {
        issues.push(lineMessage(lineNo, isEN ? 'List marker has no value.' : '列表标记后缺少值。'));
      }
      if (!content.startsWith('- ') && !content.startsWith('? ') && !content.startsWith('|') && !content.startsWith('>') && !/^[\w'".$/{}()[\]-][^:]*:\s*(.*)$/.test(content) && !/^[\w'".-]+$/.test(content)) {
        issues.push(lineMessage(lineNo, isEN ? 'This line may be missing a colon or valid YAML marker.' : '这一行可能缺少冒号或合法 YAML 标记。'));
      }

      const keyMatch = content.match(/^([^:#][^:]*):(?:\s|$)/);
      if (keyMatch) {
        const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
        const seen = scopes.get(indent) || new Set();
        if (seen.has(key)) {
          issues.push(lineMessage(lineNo, (isEN ? 'Duplicate key at this level: ' : '同层级重复键：') + key));
        }
        seen.add(key);
        scopes.set(indent, seen);
        for (const k of [...scopes.keys()]) if (k > indent) scopes.delete(k);
      }
    });

    return issues;
  }

  function normalizeLine(raw) {
    return raw.replace(/\t/g, '  ').replace(/[ \t]+$/g, '');
  }

  function formatYaml() {
    const text = input.value.replace(/\r\n?/g, '\n');
    if (!text.trim()) {
      output.value = '';
      show(msg.empty, 'warning');
      return;
    }

    const formatted = text
      .split('\n')
      .map(normalizeLine)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n';

    output.value = formatted;
    const issues = validate(formatted);
    if (issues.length) {
      show(`${msg.issues}<ul style="margin:8px 0 0 20px">${issues.slice(0, 12).map(i => `<li>${i}</li>`).join('')}${issues.length > 12 ? '<li>…</li>' : ''}</ul>`, 'warning');
    } else {
      show(msg.ok, 'success');
    }
  }

  function compactYaml() {
    const text = (output.value || input.value).replace(/\r\n?/g, '\n');
    if (!text.trim()) {
      show(msg.empty, 'warning');
      return;
    }
    output.value = text.split('\n').map(l => l.trim()).filter(Boolean).join(' ');
    show(isEN ? 'Compacted locally. Use only where whitespace-insensitive output is acceptable.' : '已本地压缩。仅建议在目标场景不依赖换行缩进时使用。', 'success');
  }

  formatBtn?.addEventListener('click', formatYaml);
  minifyBtn?.addEventListener('click', compactYaml);
  copyBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value || '');
    show(msg.copied, 'success');
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    show(msg.cleared, 'info');
  });

  input.addEventListener('input', () => {
    if (input.value.length < 12000) formatYaml();
  });
  formatYaml();
})();
