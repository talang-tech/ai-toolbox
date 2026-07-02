// JSON Validator — Validate, Format, Minify with error location
(function () {
  'use strict';

  const input = document.getElementById('jvInput');
  const output = document.getElementById('jvOutput');
  const errorDiv = document.getElementById('jvError');
  const msg = document.getElementById('jvMsg');
  const validateBtn = document.getElementById('jvValidateBtn');
  const formatBtn = document.getElementById('jvFormatBtn');
  const minifyBtn = document.getElementById('jvMinifyBtn');
  const copyBtn = document.getElementById('jvCopyBtn');

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error)' : 'var(--success)';
  }

  function hideError() {
    if (errorDiv) errorDiv.style.display = 'none';
  }

  function showError(errorText) {
    if (!errorDiv) return;
    errorDiv.textContent = errorText;
    errorDiv.style.display = 'block';
    output.value = '';
  }

  function getNodeCount(obj) {
    if (obj === null || obj === undefined) return 1;
    if (typeof obj !== 'object') return 1;
    let count = 1;
    if (Array.isArray(obj)) {
      for (const item of obj) count += getNodeCount(item);
    } else {
      for (const key of Object.keys(obj)) count += getNodeCount(obj[key]);
    }
    return count;
  }

  function getDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    let maxDepth = 0;
    if (Array.isArray(obj)) {
      for (const item of obj) maxDepth = Math.max(maxDepth, getDepth(item));
    } else {
      for (const key of Object.keys(obj)) maxDepth = Math.max(maxDepth, getDepth(obj[key]));
    }
    return maxDepth + 1;
  }

  function validate(text) {
    hideError();
    if (!text.trim()) {
      showMsg('Please enter JSON data', true);
      return null;
    }

    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      output.value = formatted;

      const nodes = getNodeCount(parsed);
      const depth = getDepth(parsed);
      const typeName = Array.isArray(parsed) ? 'Array' : 'Object';
      const stats = `\u2705 Valid JSON | Type: ${typeName} | Nodes: ${nodes} | Depth: ${depth}`;
      showMsg(stats);
      return parsed;
    } catch (e) {
      // Extract detailed error info
      const errorMsg = e.message || 'Unknown error';
      output.value = '';

      // Try to get position info
      let lineInfo = '';
      let colInfo = '';
      let contextLines = '';

      // JSON.parse errors in modern browsers include position info
      // Format: "Unexpected token at position X" or "Unexpected token X in JSON at position Y"
      const posMatch = errorMsg.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const beforeError = text.substring(0, pos);
        const lineNumber = (beforeError.match(/\n/g) || []).length + 1;
        const lastNewline = beforeError.lastIndexOf('\n');
        const column = pos - lastNewline;
        lineInfo = `\nLine: ${lineNumber}`;
        colInfo = `, Column: ${column}`;

        // Show context: 2 lines before and after
        const lines = text.split('\n');
        const startLine = Math.max(0, lineNumber - 3);
        const endLine = Math.min(lines.length, lineNumber + 2);
        contextLines = '\n\nContext:\n';
        for (let i = startLine; i < endLine; i++) {
          const prefix = i === lineNumber - 1 ? '>>> ' : '    ';
          contextLines += prefix + (i + 1).toString().padStart(3) + ' | ' + lines[i] + '\n';
          if (i === lineNumber - 1) {
            contextLines += '    ' + ' '.repeat(5 + column) + '^\n';
          }
        }

        // Scroll output to show context (will be in error div)
      }

      // Also try: "at position X (>Y)" format from JSON.parse
      const colMatch = errorMsg.match(/column\s+(\d+)/i);
      if (colMatch && !lineInfo) {
        colInfo = `, Column: ${colMatch[1]}`;
      }

      const fullError = `\u274c ${errorMsg}${lineInfo}${colInfo}${contextLines}`;
      showError(fullError);
      showMsg('\u274c Invalid JSON', true);
      return null;
    }
  }

  function doMinify() {
    hideError();
    const text = input.value.trim();
    if (!text) { showMsg('Please enter JSON data', true); return; }

    try {
      const parsed = JSON.parse(text);
      output.value = JSON.stringify(parsed);
      showMsg('JSON minified');
    } catch (e) {
      showError(`\u274c ${e.message}`);
      showMsg('\u274c Invalid JSON', true);
    }
  }

  function doFormat() {
    hideError();
    const text = input.value.trim();
    if (!text) { showMsg('Please enter JSON data', true); return; }

    try {
      const parsed = JSON.parse(text);
      output.value = JSON.stringify(parsed, null, 2);
      showMsg('JSON formatted (2-space indent)');
    } catch (e) {
      showError(`\u274c ${e.message}`);
      showMsg('\u274c Invalid JSON', true);
    }
  }

  function copyResult() {
    if (!output.value.trim()) {
      showMsg('Nothing to copy', true);
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showMsg('Copied to clipboard');
    }).catch(() => {
      output.select();
      document.execCommand('copy');
      showMsg('Copied to clipboard');
    });
  }

  // Auto-validate with debounce
  let autoTimer = null;
  function onInputChange() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      const text = input.value.trim();
      if (!text) { output.value = ''; hideError(); showMsg(''); return; }
      // Only validate if it looks like JSON
      if (/^\s*[{[]/.test(text) || /^\s*["\dtnft]/.test(text)) {
        validate(text);
      }
    }, 500);
  }

  function init() {
    if (validateBtn) validateBtn.addEventListener('click', function() { validate(input.value); });
    if (formatBtn) formatBtn.addEventListener('click', doFormat);
    if (minifyBtn) minifyBtn.addEventListener('click', doMinify);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (input) input.addEventListener('input', onInputChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();