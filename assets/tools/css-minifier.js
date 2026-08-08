/**
 * CSS Minifier / Beautifier - Pure JS, zero dependencies
 * Minifies and beautifies CSS entirely in-browser
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('cm-input');
    const output = document.getElementById('cm-output');
    const modeRadios = document.querySelectorAll('input[name="cm-mode"]');
    const actionBtn = document.getElementById('cm-action-btn');
    const copyBtn = document.getElementById('cm-copy-btn');
    const statsEl = document.getElementById('cm-stats');

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

    // Strip CSS comments (block comments only)
    function stripCSSComments(css) {
      return css.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // ========== Minify ==========
    function minifyCSS(css) {
      if (!css.trim()) return '';

      let s = css;

      // Strip comments
      s = stripCSSComments(s);

      // Remove imports and charset if present (keep them at top)
      // Normalize line endings
      s = s.replace(/\r\n?/g, '\n');

      // Collapse whitespace
      s = s.replace(/\s+/g, ' ');

      // Remove spaces around: { } : ; , > + ~ =
      s = s.replace(/\s*([{}:;,>+~=])\s*/g, '$1');

      // Remove spaces before and after ()
      s = s.replace(/\s*\(\s*/g, '(');
      s = s.replace(/\s*\)\s*/g, ')');

      // Remove the last semicolon before }
      s = s.replace(/;}/g, '}');

      // Remove leading/trailing spaces
      s = s.trim();

      // Remove unnecessary 0 values
      // 0px -> 0, 0em -> 0, etc (but not in selectors like .item-0)
      // Be careful — only inside property values
      s = s.replace(/([: ])0(px|em|rem|pt|pc|mm|cm|in|vh|vw|vmin|vmax|ex|ch)/g, '$10');

      // Remove trailing zeros in decimal values
      s = s.replace(/(\d+)\.0+([a-z%]|(?=[;}),]))/g, '$1$2');
      s = s.replace(/(\d+\.\d*?)0+([a-z%]|(?=[;}),]))/g, '$1$2');

      // Convert #RRGGBB to #RGB if possible
      s = s.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');

      // Remove optional quotes from url() — keep for safety, skip

      // Remove the space after !important
      s = s.replace(/!important/g, '!important');

      return s;
    }

    // ========== Beautify ==========
    function beautifyCSS(css) {
      if (!css.trim()) return '';

      let s = css;

      // Strip comments
      s = stripCSSComments(s);

      // Normalize line endings
      s = s.replace(/\r\n?/g, '\n');

      // Collapse multiple spaces to single space
      s = s.replace(/[ \t]+/g, ' ');

      // Remove trailing spaces
      s = s.replace(/[ \t]+$/gm, '');

      // Remove excessive blank lines
      s = s.replace(/\n{3,}/g, '\n\n');

      // Add space after : in declarations
      s = s.replace(/:(\S)/g, ': $1');

      // Add space before { in rules
      s = s.replace(/\{/g, ' {\n');

      // Add newline after {
      s = s.replace(/\{/g, '{\n');

      // Add newline before }
      s = s.replace(/}/g, '\n}');

      // Add newline after ;
      s = s.replace(/;/g, ';\n');

      // Add newline after each selector comma
      s = s.replace(/,/g, ',\n');

      // Clean up: remove empty lines at start
      s = s.replace(/^\n+/, '');

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
        if (trimmed.startsWith('}')) {
          indent = Math.max(0, indent - 1);
        }

        // Skip if it's just a closing brace with content (e.g., "} .class {")
        // Handle the case where we have multiple selectors on one line
        result.push(indentStr.repeat(indent) + trimmed);

        // Increase indent for opening braces
        if (trimmed.endsWith('{')) {
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
          result = minifyCSS(code);
        } else {
          result = beautifyCSS(code);
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
    document.getElementById('cm-clear-btn')?.addEventListener('click', clearAll);
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