/**
 * CSS Inliner — Inline CSS styles from style tags into HTML element attributes
 * AI Toolbox - Privacy-first browser-local tool
 *
 * Pure JS implementation, all processing is local.
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('ci-input');
    const output = document.getElementById('ci-output');
    const msg = document.getElementById('ci-msg');
    const convertBtn = document.getElementById('ci-convert');
    const copyBtn = document.getElementById('ci-copy');
    const downloadBtn = document.getElementById('ci-download');
    const clearBtn = document.getElementById('ci-clear');
    const previewToggle = document.getElementById('ci-preview');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !convertBtn) return;

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    /**
     * Simple CSS parser — extract rules from a CSS string
     * Returns array of { selectorText, cssText, pseudoClass }
     */
    function parseCSS(cssText) {
      const rules = [];
      // Remove comments
      cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
      // Match rule blocks: selector { properties }
      const ruleRegex = /([^{]+)\{([^}]*)\}/g;
      let match;
      while ((match = ruleRegex.exec(cssText)) !== null) {
        const selector = match[1].trim();
        const declarations = match[2].trim();
        if (!selector || !declarations) continue;

        // Check for pseudo-class
        const pseudoMatch = selector.match(/:(hover|active|focus|visited|link|focus-within|focus-visible|disabled|checked|before|after|first-child|last-child|nth-child|nth-of-type)/);
        const pseudoClass = pseudoMatch ? pseudoMatch[0] : null;

        // Parse declarations
        const props = {};
        declarations.split(';').forEach(function (decl) {
          decl = decl.trim();
          if (!decl) return;
          const colonIdx = decl.indexOf(':');
          if (colonIdx > 0) {
            const prop = decl.substring(0, colonIdx).trim().toLowerCase();
            const val = decl.substring(colonIdx + 1).trim();
            if (prop && val) {
              props[prop] = val;
            }
          }
        });

        if (Object.keys(props).length > 0) {
          rules.push({
            selectorText: selector,
            cssText: declarations,
            props: props,
            pseudoClass: pseudoClass
          });
        }
      }
      return rules;
    }

    /**
     * Check if a selector matches an element
     */
    function matchesSelector(el, selector) {
      // Remove pseudo-class suffix for matching
      const cleanSelector = selector.replace(/:(hover|active|focus|visited|link|focus-within|focus-visible|disabled|checked|before|after|first-child|last-child|nth-child|nth-of-type\([^)]*\))/g, '').trim();
      if (!cleanSelector) return false;

      try {
        return el.matches(cleanSelector);
      } catch (e) {
        return false;
      }
    }

    /**
     * Convert a props object to a style string
     */
    function propsToStyle(props) {
      return Object.keys(props).map(function (k) {
        return k + ': ' + props[k] + ';';
      }).join(' ');
    }

    /**
     * Merge source props into target props (source has higher priority)
     */
    function mergeProps(target, source) {
      Object.keys(source).forEach(function (k) {
        target[k] = source[k];
      });
      return target;
    }

    /**
     * Main inline function
     */
    function inlineCSS(html) {
      // Extract style blocks
      const styleBlocks = [];
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let styleMatch;
      while ((styleMatch = styleRegex.exec(html)) !== null) {
        styleBlocks.push(styleMatch[1]);
      }

      // Remove style blocks from HTML temporarily
      let cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // Remove media query blocks for now (will be re-added)
      const mediaQueries = [];
      const mediaRegex = /@media[^{]*\{([\s\S]*?)\}/gi;
      let mediaMatch;
      while ((mediaMatch = mediaRegex.exec(styleBlocks.join('\n'))) !== null) {
        mediaQueries.push(mediaMatch[0]);
      }

      // Extract rules from all style blocks
      const allRules = [];
      styleBlocks.forEach(function (block) {
        // Remove @media blocks for selector parsing
        const noMedia = block.replace(/@media[^{]*\{[\s\S]*?\}/gi, '');
        const rules = parseCSS(noMedia);
        allRules.push.apply(allRules, rules);
      });

      // Separate pseudo-class rules and regular rules
      const pseudoRules = allRules.filter(function (r) { return r.pseudoClass; });
      const regularRules = allRules.filter(function (r) { return !r.pseudoClass; });

      // Sort regular rules by specificity (ID > class > tag)
      regularRules.sort(function (a, b) {
        var aSpec = 0, bSpec = 0;
        aSpec += (a.selectorText.match(/#[a-zA-Z_]/g) || []).length * 100;
        bSpec += (b.selectorText.match(/#[a-zA-Z_]/g) || []).length * 100;
        aSpec += (a.selectorText.match(/\.([a-zA-Z_])/g) || []).length * 10;
        bSpec += (b.selectorText.match(/\.([a-zA-Z_])/g) || []).length * 10;
        return aSpec - bSpec; // lower specificity first so higher overrides
      });

      // Parse the HTML
      var parser = new DOMParser();
      var doc = parser.parseFromString(cleanHtml, 'text/html');

      // Apply rules to all matching elements
      var allElements = doc.body.querySelectorAll('*');
      allElements.forEach(function (el) {
        var existingStyle = el.getAttribute('style') || '';
        var existingProps = {};
        if (existingStyle) {
          existingStyle.split(';').forEach(function (decl) {
            decl = decl.trim();
            if (!decl) return;
            var colonIdx = decl.indexOf(':');
            if (colonIdx > 0) {
              existingProps[decl.substring(0, colonIdx).trim().toLowerCase()] = decl.substring(colonIdx + 1).trim();
            }
          });
        }

        var mergedProps = {};
        // First apply existing inline styles
        Object.keys(existingProps).forEach(function (k) {
          mergedProps[k] = existingProps[k];
        });

        // Apply rules in order (lower specificity first, higher overrides)
        regularRules.forEach(function (rule) {
          if (matchesSelector(el, rule.selectorText)) {
            mergedProps = mergeProps(mergedProps, rule.props);
          }
        });

        // Also check if the element itself matches any tag/class/id simple selectors
        // For elements that are directly targeted
        regularRules.forEach(function (rule) {
          var sel = rule.selectorText;
          // Check if it's a simple tag selector
          if (sel === el.tagName.toLowerCase() && !sel.includes('.') && !sel.includes('#')) {
            mergedProps = mergeProps(mergedProps, rule.props);
          }
        });

        // Set the style attribute
        var styleStr = propsToStyle(mergedProps);
        if (styleStr) {
          el.setAttribute('style', styleStr);
        }
      });

      // Get the resulting HTML
      var result = doc.body.innerHTML;

      // Preserve pseudo-class styles in a style block
      if (pseudoRules.length > 0) {
        var pseudoCss = '<style>\n';
        pseudoRules.forEach(function (rule) {
          pseudoCss += rule.selectorText + ' {\n  ' + rule.cssText + '\n}\n';
        });
        pseudoCss += '</style>\n';
        result = pseudoCss + result;
      }

      // Re-add media queries
      if (mediaQueries.length > 0) {
        var mqHtml = '<style>\n';
        mediaQueries.forEach(function (mq) {
          mqHtml += mq + '\n';
        });
        mqHtml += '</style>\n';
        result = mqHtml + result;
      }

      return result;
    }

    function convert() {
      var html = input.value.trim();
      if (!html) {
        showMsg(isEN ? 'Please enter HTML code with CSS.' : '请输入包含 CSS 的 HTML 代码。', true);
        return;
      }

      try {
        var result = inlineCSS(html);
        output.value = result;

        // Update preview if available
        if (previewToggle && previewToggle.checked) {
          var previewFrame = document.getElementById('ci-preview-frame');
          if (previewFrame) {
            var previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            previewDoc.open();
            previewDoc.write('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + result + '</body></html>');
            previewDoc.close();
          }
        }

        showMsg(isEN ? '✓ CSS inlined successfully! ' + (html.match(/<style/gi) ? 'Style blocks preserved for pseudo-classes.' : '') : '✓ CSS 内联完成！' + (html.match(/<style/gi) ? '样式块已保留伪类。' : ''));
      } catch (e) {
        showMsg(isEN ? 'Error: ' + e.message : '错误：' + e.message, true);
      }
    }

    function copyResult() {
      var code = output.value.trim();
      if (!code) {
        showMsg(isEN ? 'Nothing to copy. Convert first.' : '没有可复制的内容，请先转换。', true);
        return;
      }
      navigator.clipboard.writeText(code).then(function () {
        showMsg(isEN ? '✓ Copied to clipboard!' : '✓ 已复制到剪贴板！');
      }).catch(function () {
        output.select();
        document.execCommand('copy');
        showMsg(isEN ? '✓ Copied!' : '✓ 已复制！');
      });
    }

    function downloadResult() {
      var code = output.value.trim();
      if (!code) {
        showMsg(isEN ? 'Nothing to download. Convert first.' : '没有可下载的内容，请先转换。', true);
        return;
      }
      var blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'inlined.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMsg(isEN ? '✓ File downloaded as inlined.html' : '✓ 文件已下载为 inlined.html');
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      if (previewToggle && previewToggle.checked) {
        var previewFrame = document.getElementById('ci-preview-frame');
        if (previewFrame) {
          previewFrame.src = 'about:blank';
        }
      }
      showMsg('');
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    copyBtn.addEventListener('click', copyResult);
    downloadBtn.addEventListener('click', downloadResult);
    clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter shortcut
    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        convert();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();