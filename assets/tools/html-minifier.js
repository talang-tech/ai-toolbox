/**
 * HTML Minifier/Beautifier - Pure JS, zero dependencies
 * Handles HTML minify and beautify entirely in-browser
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('hm-input');
    const output = document.getElementById('hm-output');
    const modeRadios = document.querySelectorAll('input[name="hm-mode"]');
    const actionBtn = document.getElementById('hm-action-btn');
    const copyBtn = document.getElementById('hm-copy-btn');
    const statsEl = document.getElementById('hm-stats');

    if (!input || !output) return;

    function getMode() {
      for (const r of modeRadios) {
        if (r.checked) return r.value;
      }
      return 'beautify';
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showStats(before, after) {
      if (!statsEl) return;
      const saved = before.length - after.length;
      const ratio = before.length > 0 ? ((1 - after.length / before.length) * 100).toFixed(1) : 0;
      const beforeBytes = new Blob([before]).size;
      const afterBytes = new Blob([after]).size;
      statsEl.innerHTML =
        '<span>原大小: ' + formatBytes(beforeBytes) + ' (' + before.length + ' 字符)</span>' +
        '<span style="margin-left:12px">| 结果大小: ' + formatBytes(afterBytes) + ' (' + after.length + ' 字符)</span>' +
        '<span style="margin-left:12px">| 减少: ' + (saved > 0 ? '-' : '+') + formatBytes(Math.abs(saved)) + ' (' + ratio + '%)</span>';
    }

    function beautifyHTML(html) {
      // Normalize line endings
      let s = html.replace(/\r\n?/g, '\n');
      // Remove excessive blank lines
      s = s.replace(/\n{3,}/g, '\n\n');
      // Strip leading/trailing whitespace per line
      s = s.replace(/[ \t]+\n/g, '\n');
      s = s.replace(/\n[ \t]+/g, '\n');
      // Trim surrounding whitespace
      s = s.trim();

      // Tokenize: split by tags but preserve text content
      const tokens = [];
      let remaining = s;
      while (remaining.length > 0) {
        const tagMatch = remaining.match(/^(\s*)(<[^>]*>)(\s*)/);
        if (tagMatch) {
          // If there's leading text before this tag, capture it
          const textBefore = remaining.slice(0, remaining.indexOf(tagMatch[2]));
          if (textBefore.trim()) {
            tokens.push({ type: 'text', value: textBefore.trim() });
          }
          tokens.push({ type: 'tag', value: tagMatch[2] });
          remaining = remaining.slice(remaining.indexOf(tagMatch[2]) + tagMatch[2].length);
        } else {
          // No more tags, remaining is text
          const text = remaining.trim();
          if (text) tokens.push({ type: 'text', value: text });
          break;
        }
      }

      // Indent by depth
      let depth = 0;
      const inlineTags = new Set([
        'a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'button',
        'cite', 'code', 'del', 'dfn', 'em', 'i', 'img', 'input',
        'ins', 'kbd', 'label', 'map', 'mark', 'meter', 'output',
        'q', 'ruby', 's', 'samp', 'select', 'small', 'span',
        'strong', 'sub', 'sup', 'textarea', 'time', 'u', 'tt', 'var',
        'wbr',
      ]);
      const voidElements = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr',
      ]);

      const resultLines = [];
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'tag') {
          const tag = token.value;
          const isClosing = /^<\//.test(tag);
          const tagNameMatch = tag.match(/^<\/?([a-zA-Z0-9-]+)/);
          const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
          const isVoid = voidElements.has(tagName);
          const isSelfClosing = /\/>$/.test(tag) || isVoid;
          const isInline = inlineTags.has(tagName) && !isClosing && !isSelfClosing;
          const isComment = /^<!--/.test(tag);
          const isDoctype = /^<!doctype/i.test(tag) || /^<!DOCTYPE/.test(tag);

          if (isClosing || isSelfClosing || isComment || isDoctype) {
            // Don't change depth for these
          }

          // Build the line with proper indent
          let indent = '  '.repeat(Math.max(0, depth));
          let line = indent + tag;

          // For opening tags that aren't void, self-closing, or inline
          if (!isClosing && !isSelfClosing && !isComment && !isDoctype && !isInline) {
            const nextToken = tokens[i + 1];
            // Check if the next token is inline text
            if (nextToken && nextToken.type === 'text' && nextToken.value.length < 100) {
              line += ' ' + nextToken.value;
              i++; // skip the text token
              // Look for the closing tag inline too
              const afterToken = tokens[i + 1];
              if (afterToken && afterToken.type === 'tag' && /^<\//.test(afterToken.value)) {
                const ctName = afterToken.value.match(/<\/([a-zA-Z0-9-]+)>/);
                if (ctName && ctName[1].toLowerCase() === tagName) {
                  line += afterToken.value;
                  i++;
                }
              }
            }
            resultLines.push(line);
            depth++;
            continue;
          }

          if (isClosing) {
            depth = Math.max(0, depth - 1);
            indent = '  '.repeat(Math.max(0, depth));
            line = indent + tag;
          }

          if (isComment || isDoctype) {
            // comments and doctype at current indent
          }

          resultLines.push(line);
        } else {
          // Text content
          const text = token.value;
          // If short text, keep inline with parent
          if (text.length < 120 && !text.includes('\n')) {
            resultLines.push('  '.repeat(Math.max(0, depth)) + text);
          } else {
            // Long text, split by sentences
            const textLines = text.split('\n');
            for (const tl of textLines) {
              if (tl.trim()) {
                resultLines.push('  '.repeat(Math.max(0, depth)) + tl.trim());
              }
            }
          }
        }
      }

      return resultLines.join('\n');
    }

    function minifyHTML(html) {
      // Remove comments (except IE conditional comments which we keep)
      let result = html.replace(/<!--[^\[][\s\S]*?-->/g, '');

      // Remove whitespace between tags
      result = result.replace(/>\s+</g, '><');
      // Remove leading/trailing whitespace inside tags
      result = result.replace(/(\S)\s+</g, '$1<');
      result = result.replace(/>\s+(\S)/g, '>$1');
      // Collapse multiple spaces in text to single
      result = result.replace(/\s{2,}/g, ' ');
      // Remove whitespace around = and " in attributes
      result = result.replace(/\s*=\s*/g, '=');
      // Remove quotes around attribute values where safe (simple cases)
      result = result.replace(/="([a-zA-Z0-9_\-]+)"/g, '=$1');
      // Remove optional closing tags (simple cases)
      result = result.replace(/<\/li>/gi, '');
      result = result.replace(/<\/dt>/gi, '');
      result = result.replace(/<\/dd>/gi, '');
      result = result.replace(/<\/p>/gi, '');
      result = result.replace(/<\/th>/gi, '');
      result = result.replace(/<\/td>/gi, '');
      result = result.replace(/<\/thead>/gi, '');
      result = result.replace(/<\/tbody>/gi, '');
      result = result.replace(/<\/tfoot>/gi, '');
      result = result.replace(/<\/tr>/gi, '');
      result = result.replace(/<\/option>/gi, '');
      result = result.replace(/<\/optgroup>/gi, '');

      // Normalize line endings to newline
      result = result.replace(/\r\n?/g, '\n');

      result = result.trim();
      return result;
    }

    function process() {
      const html = input.value;
      if (!html.trim()) {
        output.value = '';
        if (statsEl) statsEl.textContent = '';
        return;
      }

      let result;
      if (getMode() === 'beautify') {
        result = beautifyHTML(html);
      } else {
        result = minifyHTML(html);
      }

      output.value = result;
      showStats(html, result);
    }

    actionBtn.addEventListener('click', process);

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        process();
      }
    });

    copyBtn.addEventListener('click', function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(function () {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✅ 已复制!';
        setTimeout(function () { copyBtn.textContent = orig; }, 2000);
      }).catch(function () {
        // Fallback
        output.select();
        document.execCommand('copy');
      });
    });

    // Mode switch auto-process
    for (const r of modeRadios) {
      r.addEventListener('change', function () {
        if (input.value.trim()) process();
      });
    }

    // Auto-process on input change with debounce
    let debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(process, 500);
    });
  }

  // Wait for DOM and specific tool container
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Use MutationObserver to wait for our specific section to appear
    const observer = new MutationObserver(function () {
      if (document.getElementById('hm-input')) {
        observer.disconnect();
        init();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();