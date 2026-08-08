/**
 * JS Minifier / Beautifier - Pure JS, zero dependencies
 * Minifies and beautifies JavaScript entirely in-browser
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('jm-input');
    const output = document.getElementById('jm-output');
    const modeRadios = document.querySelectorAll('input[name="jm-mode"]');
    const actionBtn = document.getElementById('jm-action-btn');
    const copyBtn = document.getElementById('jm-copy-btn');
    const statsEl = document.getElementById('jm-stats');

    if (!input || !output) return;

    function getMode() {
      for (const r of modeRadios) {
        if (r.checked) return r.value;
      }
      return 'minify';
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showStats(before, after) {
      if (!statsEl) return;
      const beforeBytes = new Blob([before]).size;
      const afterBytes = new Blob([after]).size;
      const saved = before.length - after.length;
      const ratio = before.length > 0 ? ((1 - after.length / before.length) * 100).toFixed(1) : 0;
      statsEl.innerHTML =
        '<span>Original: ' + formatBytes(beforeBytes) + ' (' + before.length + ' chars)</span>' +
        '<span style="margin-left:12px">| Result: ' + formatBytes(afterBytes) + ' (' + after.length + ' chars)</span>' +
        '<span style="margin-left:12px">| Saved: ' + (saved > 0 ? '-' : '+') + formatBytes(Math.abs(saved)) + ' (' + ratio + '%)</span>';
    }

    // ========== Minify ==========
    function minifyJS(code) {
      if (!code.trim()) return '';

      let s = code;

      // Remove single-line comments (but not in strings)
      s = removeComments(s);

      // Remove trailing whitespace and collapse blank lines
      s = s.replace(/[ \t]+$/gm, '');
      s = s.replace(/\n{3,}/g, '\n\n');

      // Collapse multiple spaces/tabs
      s = s.replace(/[ \t]{2,}/g, ' ');

      // Remove spaces around operators where safe
      // = + - * / % && || == != === !== < > <= >= ? : , ; { } ( ) [ ]
      s = s.replace(/\s*([=+\-*\/%&|!<>,:;{}()\[\]])\s*/g, '$1');

      // Fix: put space after keywords like return, throw, typeof, delete, void
      s = s.replace(/\b(return|throw|typeof|delete|void|yield|case)\b([a-zA-Z0-9_$])/g, '$1 $2');

      // Fix: put space before { in functions/if/for/while/switch/try/catch
      // (but the above already removed it, so we need to add it back for some cases)

      // Remove unnecessary semicolons before closing braces
      s = s.replace(/;}/g, '}');

      // Remove newlines between statements where safe
      // Keep newlines after { and before }
      // Actually, let's do a more careful approach: remove all newlines
      // and re-add minimal ones for readability
      s = s.replace(/\n\s*/g, '');

      // Add back newlines after { and before } for multiple statements
      // But for true minification, we want everything on one line
      // Actually, let's keep it on one line for true minification
      // (unless we need to preserve some structure)

      // Remove redundant semicolons
      s = s.replace(/;;+/g, ';');

      // Remove leading/trailing whitespace
      s = s.trim();

      // If the result is empty, return empty
      if (!s) return '';

      return s;
    }

    function removeComments(code) {
      let result = '';
      let i = 0;
      const len = code.length;

      while (i < len) {
        // String literal - skip to end
        if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
          const quote = code[i];
          result += quote;
          i++;
          while (i < len) {
            result += code[i];
            if (code[i] === '\\') {
              i++;
              if (i < len) { result += code[i]; i++; }
              continue;
            }
            if (code[i] === quote) {
              i++;
              break;
            }
            if (code[i] === '\n' && quote !== '`') break;
            i++;
          }
          continue;
        }

        // Template literal ${...} expression
        // (handled by the ` skip above)

        // Regex literal - basic heuristic
        if (code[i] === '/' && (i === 0 || /[=(?:!&|,;{}[\]]/.test(code[i-1]))) {
          result += '/';
          i++;
          while (i < len) {
            result += code[i];
            if (code[i] === '\\') {
              i++;
              if (i < len) { result += code[i]; i++; }
              continue;
            }
            if (code[i] === '/') {
              i++;
              break;
            }
            if (code[i] === '\n') break;
            i++;
          }
          continue;
        }

        // Single-line comment
        if (code[i] === '/' && i + 1 < len && code[i + 1] === '/') {
          i += 2;
          while (i < len && code[i] !== '\n') i++;
          continue;
        }

        // Multi-line comment
        if (code[i] === '/' && i + 1 < len && code[i + 1] === '*') {
          i += 2;
          while (i < len) {
            if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
              i += 2;
              break;
            }
            i++;
          }
          // Add a space in place of JSDoc/block comments to avoid token merging
          result += ' ';
          continue;
        }

        result += code[i];
        i++;
      }

      return result;
    }

    // ========== Beautify ==========
    function beautifyJS(code) {
      if (!code.trim()) return '';

      let s = code;

      // Remove comments
      s = removeComments(s);

      // Normalize whitespace
      s = s.replace(/\r\n?/g, '\n');
      s = s.replace(/[ \t]+/g, ' ');
      s = s.replace(/\n\s*/g, '\n');
      s = s.replace(/\n{3,}/g, '\n\n');
      s = s.replace(/^\n+/, '');
      s = s.replace(/\n+$/, '');

      // Add spaces around operators
      s = s.replace(/(\w)([+\-*/%&|^<>]=?)/g, '$1 $2');
      s = s.replace(/([+\-*/%&|^<>]=?)(\w)/g, '$1 $2');

      // Add space after comma
      s = s.replace(/,(\S)/g, ', $1');

      // Add space before {
      s = s.replace(/\{/g, ' {\n');
      s = s.replace(/\}\)\s*\{/g, ') {\n');

      // Add newline after { and before }
      s = s.replace(/\{/g, '{\n');
      s = s.replace(/}/g, '\n}');

      // Add newline after ;
      s = s.replace(/;/g, ';\n');

      // Clean up excessive newlines
      s = s.replace(/\n{3,}/g, '\n\n');

      // Indentation
      const lines = s.split('\n');
      let indent = 0;
      const result = [];
      const indentStr = '  ';

      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          result.push('');
          continue;
        }

        // Decrease indent for closing braces
        if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
          indent = Math.max(0, indent - 1);
        }

        result.push(indentStr.repeat(indent) + trimmed);

        // Increase indent for opening braces
        if (trimmed.endsWith('{') || trimmed.endsWith('[') ||
            trimmed.endsWith('{;') || trimmed.endsWith('{ ;')) {
          indent++;
        }
      }

      return result.join('\n');
    }

    function process() {
      const code = input.value;
      if (!code.trim()) {
        output.value = '';
        if (statsEl) statsEl.innerHTML = '';
        return;
      }

      const mode = getMode();
      let result;

      try {
        if (mode === 'minify') {
          result = minifyJS(code);
        } else {
          result = beautifyJS(code);
        }
        showStats(code, result);
        output.value = result;
      } catch (e) {
        output.value = 'Error: ' + e.message;
        if (statsEl) statsEl.innerHTML = '<span style="color:red">Error: ' + e.message + '</span>';
      }
    }

    function copyResult() {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(function () {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✓ ' + (copyBtn.textContent.includes('Copy') ? 'Copied' : '已复制');
        setTimeout(function () { copyBtn.textContent = orig; }, 2000);
      }).catch(function () {
        // Fallback
        output.select();
        document.execCommand('copy');
      });
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      if (statsEl) statsEl.innerHTML = '';
    }

    // Event listeners
    actionBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', copyResult);
    document.getElementById('jm-clear-btn')?.addEventListener('click', clearAll);
    modeRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (input.value.trim()) process();
      });
    });

    // Auto-run on input change (debounced)
    let debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(process, 500);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();