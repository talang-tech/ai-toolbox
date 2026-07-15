// YAML Syntax Validator - browser-local, no dependencies
(() => {
  const input = document.getElementById('yv-input');
  const output = document.getElementById('yv-output');
  const validateBtn = document.getElementById('yv-validate');
  const copyBtn = document.getElementById('yv-copy');
  const clearBtn = document.getElementById('yv-clear');
  const summary = document.getElementById('yv-summary');
  const msg = document.getElementById('yv-msg');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !validateBtn || !output) return;

  function showMsg(text, type) {
    if (!msg) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    msg.style.color = colors[type] || colors.info;
    msg.textContent = text;
  }

  function lineMsg(lineNo, text) {
    return isEN ? `Line ${lineNo}: ${text}` : `第 ${lineNo} 行：${text}`;
  }

  function stripComment(line) {
    let quote = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = line[i - 1];
      if ((ch === '"' || ch === "'") && prev !== '\\') {
        quote = quote === ch ? null : (quote || ch);
      }
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

  function validate() {
    const text = input.value;
    if (!text.trim()) {
      showMsg(isEN ? 'Please paste YAML content first.' : '请先粘贴 YAML 内容。', 'error');
      output.value = isEN ? 'No input provided.' : '未提供输入。';
      if (summary) summary.textContent = '';
      return;
    }

    const issues = [];
    const warnings = [];
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const scopeKeys = {}; // Track keys per indentation scope
    let prevIndent = 0;
    let prevLineType = '';

    lines.forEach((raw, idx) => {
      const lineNo = idx + 1;
      if (!raw.trim() || raw.trim().startsWith('#')) return;

      const leading = raw.match(/^\s*/)[0];
      const indent = leading.replace(/\t/g, '  ').length;
      const content = raw.trim();
      const clean = stripComment(raw).trim();

      // 1. Tab check
      if (/\t/.test(leading)) {
        issues.push(lineMsg(lineNo, isEN ? 'Tab indentation detected. YAML expects spaces. Replace tabs with spaces.' : '检测到 Tab 缩进，YAML 应使用空格。请将 Tab 替换为空格。'));
      }

      // 2. Odd indentation
      if (indent % 2 !== 0 && indent > 0) {
        warnings.push(lineMsg(lineNo, isEN ? 'Odd indentation (not a multiple of 2). Recommended: 2-space indentation.' : '缩进为奇数（不是 2 的倍数），建议使用 2 空格缩进。'));
      }

      // 3. Unclosed quotes
      if (hasUnclosedQuote(clean)) {
        issues.push(lineMsg(lineNo, isEN ? 'Unclosed quote detected. Check for missing closing quote.' : '检测到未闭合的引号，请检查是否缺少闭合引号。'));
      }

      // 4. Missing colon after key
      if (/^[a-zA-Z_][\w.-]*\s*[^:]\s*$/.test(content) && !content.includes(':') && !content.startsWith('-')) {
        const possible = content.replace(/\s*$/, '');
        issues.push(lineMsg(lineNo, isEN ? `Possible missing colon after "${possible}". Add ":" after key name.` : `"${possible}" 可能缺少冒号，请在键名后添加 ":"。`));
      }

      // 5. Duplicate key detection (same scope)
      const colonIdx = clean.indexOf(':');
      if (colonIdx > 0 && !content.startsWith('-')) {
        const key = clean.substring(0, colonIdx).trim();
        if (key && /^[a-zA-Z_][\w.-]*$/.test(key) && !key.startsWith('#')) {
          if (!scopeKeys[indent]) scopeKeys[indent] = {};
          if (scopeKeys[indent][key]) {
            issues.push(lineMsg(lineNo, isEN ? `Duplicate key "${key}" at indentation level ${indent}. Keys should be unique within the same scope.` : `同层级存在重复键 "${key}"（缩进 ${indent}），键名应唯一。`));
          } else {
            scopeKeys[indent][key] = true;
          }
        }
      }

      // 6. Empty value after colon
      if (clean.endsWith(':') && !clean.endsWith('::')) {
        warnings.push(lineMsg(lineNo, isEN ? 'Key with colon but no value. This is valid YAML (null value), but may be unintentional.' : '键名后有冒号但缺少值。YAML 中合法（null 值），但可能不是预期行为。'));
      }

      // 7. List indentation inconsistency
      if (content.startsWith('- ')) {
        if (prevLineType === 'list' && prevIndent !== indent) {
          warnings.push(lineMsg(lineNo, isEN ? `List item indentation (${indent}) does not match previous list item (${prevIndent}).` : `列表项缩进（${indent}）与前一个列表项缩进（${prevIndent}）不一致。`));
        }
        prevLineType = 'list';
        prevIndent = indent;
      } else if (content.startsWith('-')) {
        // List marker with no space
        issues.push(lineMsg(lineNo, isEN ? 'List marker "-" should be followed by a space. Use "- " instead of "-".' : '列表标记 "-" 后应有空格，请使用 "- " 而不是 "-"。'));
      } else {
        prevLineType = 'key';
      }

      // 8. Invalid boolean detection
      const lower = content.toLowerCase();
      if (lower === 'yes' || lower === 'no' || lower === 'true' || lower === 'false' || lower === 'on' || lower === 'off') {
        // These are valid YAML booleans, but check if they are unintentional
        if (!clean.includes(':') && !content.startsWith('-')) {
          warnings.push(lineMsg(lineNo, isEN ? `"${content}" is interpreted as a boolean in YAML. If you mean a string, use quotes.` : `"${content}" 在 YAML 中会被解释为布尔值。如果期望字符串，请使用引号。`));
        }
      }

      // 9. Invalid number format
      if (/^0\d+$/.test(content) && !content.startsWith('-') && !clean.includes(':')) {
        warnings.push(lineMsg(lineNo, isEN ? `"${content}" starts with 0. In YAML this is a string, not a number. Use quotes if you mean a string.` : `"${content}" 以 0 开头。在 YAML 中这是字符串而非数字。如果期望字符串，请使用引号。`));
      }

      // 10. Colon inside value without quotes
      if (colonIdx > 0) {
        const value = clean.substring(colonIdx + 1).trim();
        if (value.includes(':') && !value.startsWith('"') && !value.startsWith("'")) {
          warnings.push(lineMsg(lineNo, isEN ? 'Value contains a colon. Consider wrapping in quotes to avoid ambiguity.' : '值中包含冒号，建议使用引号包裹以避免歧义。'));
        }
      }
    });

    // Build result
    let result = '';
    if (issues.length === 0 && warnings.length === 0) {
      result = isEN ? '✅ No YAML syntax issues found. The configuration looks valid.' : '✅ 未发现 YAML 语法问题。配置文件看起来有效。';
      if (summary) summary.textContent = isEN ? '✅ Valid - No issues' : '✅ 有效 - 无问题';
      summary.style.color = 'var(--success)';
    } else {
      result = isEN ? `🔍 YAML Validation Report\n${'='.repeat(40)}\n` : `🔍 YAML 验证报告\n${'='.repeat(40)}\n`;
      if (issues.length > 0) {
        result += '\n' + (isEN ? '❌ ERRORS (must fix):\n' : '❌ 错误（必须修复）：\n') + '-'.repeat(30) + '\n';
        issues.forEach(issue => { result += `  ${issue}\n`; });
      }
      if (warnings.length > 0) {
        result += '\n' + (isEN ? '⚠️ WARNINGS (should review):\n' : '⚠️ 警告（建议检查）：\n') + '-'.repeat(30) + '\n';
        warnings.forEach(w => { result += `  ${w}\n`; });
      }
      result += `\n${isEN ? 'Total: ' : '总计：'}${issues.length} ${isEN ? 'error(s)' : '错误'}, ${warnings.length} ${isEN ? 'warning(s)' : '警告'}`;
      if (summary) summary.textContent = isEN ? `❌ ${issues.length} errors, ${warnings.length} warnings` : `❌ ${issues.length} 个错误，${warnings.length} 个警告`;
      summary.style.color = issues.length > 0 ? 'var(--error)' : '#f59e0b';
    }

    output.value = result;
    showMsg(isEN ? 'Validation complete.' : '验证完成。', issues.length > 0 ? 'error' : 'success');
  }

  function copyReport() {
    if (!output.value) {
      showMsg(isEN ? 'No report to copy.' : '没有可复制的报告。', 'error');
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showMsg(isEN ? 'Copied!' : '已复制!', 'success');
    }).catch(() => {
      showMsg(isEN ? 'Copy failed.' : '复制失败。', 'error');
    });
  }

  function clear() {
    if (input) input.value = '';
    if (output) output.value = '';
    if (summary) summary.textContent = '';
    showMsg(isEN ? 'Cleared.' : '已清空。', 'info');
  }

  validateBtn.addEventListener('click', validate);
  if (copyBtn) copyBtn.addEventListener('click', copyReport);
  if (clearBtn) clearBtn.addEventListener('click', clear);
})();