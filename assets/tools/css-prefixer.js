/**
 * CSS Prefixer — Auto-add vendor prefixes to CSS properties and values
 * AI Toolbox - Privacy-first browser-local tool
 *
 * Uses a comprehensive database of prefixed properties and gradient/keyword values.
 * All processing is local.
 */
(function () {
  'use strict';

  function init() {
    var input = document.getElementById('cp-input');
    var output = document.getElementById('cp-output');
    var msg = document.getElementById('cp-msg');
    var prefixBtn = document.getElementById('cp-prefix');
    var copyBtn = document.getElementById('cp-copy');
    var clearBtn = document.getElementById('cp-clear');
    var isEN = document.documentElement.lang === 'en';

    if (!input || !output || !prefixBtn) return;

    var T = function (zh, en) { return isEN ? en : zh; };

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    // Properties that need --webkit- prefix
    var WEBKIT_PROPS = {
      'transform': true, 'transform-origin': true, 'transform-style': true,
      'perspective': true, 'perspective-origin': true, 'backface-visibility': true,
      'animation': true, 'animation-name': true, 'animation-duration': true,
      'animation-timing-function': true, 'animation-delay': true,
      'animation-iteration-count': true, 'animation-direction': true,
      'animation-fill-mode': true, 'animation-play-state': true,
      'transition': true, 'transition-property': true, 'transition-duration': true,
      'transition-timing-function': true, 'transition-delay': true,
      'user-select': true, 'appearance': true,
      'mask': true, 'mask-image': true, 'mask-size': true, 'mask-position': true,
      'mask-repeat': true, 'mask-clip': true, 'mask-composite': true,
      'clip-path': true, 'filter': true, 'backdrop-filter': true,
      'text-size-adjust': true, 'text-stroke': true, 'text-stroke-width': true,
      'text-stroke-color': true, 'text-fill-color': true, 'font-smoothing': true,
      'font-smooth': true, 'box-sizing': true, 'columns': true,
      'column-count': true, 'column-width': true, 'column-gap': true,
      'column-rule': true, 'column-rule-color': true, 'column-rule-style': true,
      'column-rule-width': true, 'column-span': true, 'column-fill': true,
      'hyphens': true, 'tab-size': true
    };

    var MOZ_PROPS = {
      'transform': true, 'transform-origin': true, 'transform-style': true,
      'perspective': true, 'perspective-origin': true, 'backface-visibility': true,
      'animation': true, 'animation-name': true, 'animation-duration': true,
      'animation-timing-function': true, 'animation-delay': true,
      'animation-iteration-count': true, 'animation-direction': true,
      'animation-fill-mode': true, 'animation-play-state': true,
      'transition': true, 'transition-property': true, 'transition-duration': true,
      'transition-timing-function': true, 'transition-delay': true,
      'user-select': true, 'appearance': true,
      'text-size-adjust': true, 'hyphens': true, 'tab-size': true,
      'scrollbar-width': true, 'box-sizing': true, 'columns': true,
      'column-count': true, 'column-width': true, 'column-gap': true,
      'column-rule': true, 'column-rule-color': true, 'column-rule-style': true,
      'column-rule-width': true, 'column-span': true, 'column-fill': true,
      'font-smoothing': true
    };

    var MS_PROPS = {
      'transform': true, 'transform-origin': true, 'transform-style': true,
      'perspective': true, 'perspective-origin': true, 'backface-visibility': true,
      'transition': true, 'transition-property': true, 'transition-duration': true,
      'transition-timing-function': true, 'transition-delay': true,
      'user-select': true, 'text-size-adjust': true, 'hyphens': true,
      'flex': true, 'flex-direction': true, 'flex-wrap': true, 'flex-flow': true,
      'flex-grow': true, 'flex-shrink': true, 'flex-basis': true,
      'justify-content': true, 'align-items': true, 'align-self': true,
      'align-content': true, 'order': true,
      'grid-template-columns': true, 'grid-template-rows': true,
      'grid-column': true, 'grid-row': true, 'grid-column-start': true,
      'grid-column-end': true, 'grid-row-start': true, 'grid-row-end': true,
      'grid-area': true, 'touch-action': true, 'writing-mode': true,
      'flow-into': true, 'flow-from': true, 'region-fragment': true
    };

    var O_PROPS = {
      'transform': true, 'transform-origin': true,
      'transition': true, 'transition-property': true, 'transition-duration': true,
      'transition-timing-function': true, 'transition-delay': true
    };

    // Property aliases (font-smooth -> -webkit-font-smoothing)
    var SPECIAL_PROP_MAP = {
      'font-smoothing': { webkit: 'font-smoothing' },
      'font-smooth': { webkit: 'font-smoothing', moz: 'font-smooth' }
    };

    // Function values that need prefixing
    var PREFIXED_FUNCTIONS = {
      'linear-gradient': ['-webkit-linear-gradient', '-moz-linear-gradient', '-o-linear-gradient'],
      'radial-gradient': ['-webkit-radial-gradient', '-moz-radial-gradient', '-o-radial-gradient'],
      'repeating-linear-gradient': ['-webkit-repeating-linear-gradient', '-moz-repeating-linear-gradient', '-o-repeating-linear-gradient'],
      'repeating-radial-gradient': ['-webkit-repeating-radial-gradient', '-moz-repeating-radial-gradient', '-o-repeating-radial-gradient'],
      'conic-gradient': ['-webkit-conic-gradient'],
      'repeating-conic-gradient': ['-webkit-repeating-conic-gradient'],
      'image-set': ['-webkit-image-set'],
      'cross-fade': ['-webkit-cross-fade'],
      'element': ['-moz-element'],
      'fit-content': ['-moz-fit-content'],
      'max-content': ['-moz-max-content', '-webkit-max-content'],
      'min-content': ['-moz-min-content', '-webkit-min-content'],
      'stretch': ['-moz-stretch', '-webkit-stretch'],
      'grab': ['-webkit-grab'],
      'grabbing': ['-webkit-grabbing']
    };

    function getPrefixes(prop) {
      var p = prop.toLowerCase();
      var prefixes = [];
      if (WEBKIT_PROPS[p]) prefixes.push('-webkit-');
      if (MOZ_PROPS[p]) prefixes.push('-moz-');
      if (MS_PROPS[p]) prefixes.push('-ms-');
      if (O_PROPS[p]) prefixes.push('-o-');
      return prefixes;
    }

    function isPrefixed(prop) {
      return prop.indexOf('-webkit-') === 0 || prop.indexOf('-moz-') === 0 ||
             prop.indexOf('-ms-') === 0 || prop.indexOf('-o-') === 0;
    }

    function escapeRegex(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function prefixFunctionValues(value) {
      var result = value;
      var hasPrefix = false;

      Object.keys(PREFIXED_FUNCTIONS).forEach(function (fn) {
        // Check if the function name appears (not already prefixed)
        var bareRegex = new RegExp('(^|[\\s,()])' + escapeRegex(fn) + '(?=\\s*\\()', 'gi');
        if (bareRegex.test(result)) {
          // Check if already has a prefix
          var prefixedPattern = new RegExp('-\\w+-' + escapeRegex(fn) + '(?=\\s*\\()', 'i');
          if (!prefixedPattern.test(result)) {
            // Add the first prefix (typically -webkit-)
            var prefixes = PREFIXED_FUNCTIONS[fn];
            var newDecls = [];
            prefixes.forEach(function (pfn) {
              newDecls.push(result.replace(new RegExp(escapeRegex(fn), 'gi'), pfn));
            });
            // Return the last one as the standard
            result = newDecls[newDecls.length - 1] || result;
            hasPrefix = true;
          }
        }
      });

      return { value: result, hasPrefixed: hasPrefix };
    }

    function prefixCSS(css) {
      // Remove comments
      css = css.replace(/\/\*[\s\S]*?\*\//g, '');

      var lines = css.split('\n');
      var result = [];
      var inKeyframes = false;
      var keyframePrefixes = [];
      var keyframeBuffer = [];

      function emitKeyframes() {
        if (keyframeBuffer.length === 0) return;
        keyframePrefixes.forEach(function (pfx) {
          result.push('@' + pfx + 'keyframes ' + keyframeBuffer[0].substring(1)); // first line is @keyframes
          for (var i = 1; i < keyframeBuffer.length; i++) {
            result.push(keyframeBuffer[i]);
          }
        });
        // Also emit the original
        keyframeBuffer.forEach(function (line) { result.push(line); });
        keyframeBuffer = [];
      }

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.indexOf('/*') === 0) {
          result.push(line);
          continue;
        }

        // Handle @keyframes
        var kfMatch = trimmed.match(/^@(-webkit-|-moz-|-o-)?keyframes\s+(.+)/i);
        if (kfMatch) {
          inKeyframes = true;
          keyframeBuffer = [line];
          var name = kfMatch[2];
          keyframePrefixes = ['-webkit-', '-moz-', '-o-'];
          continue;
        }

        if (inKeyframes) {
          keyframeBuffer.push(line);
          if (trimmed === '}') {
            emitKeyframes();
            inKeyframes = false;
          }
          continue;
        }

        // Handle @supports, @media, etc. - pass through
        if (trimmed.indexOf('@') === 0 && trimmed.indexOf('@keyframes') === -1) {
          result.push(line);
          continue;
        }

        // Handle CSS declarations
        var colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0) {
          var prop = trimmed.substring(0, colonIdx).trim();
          var val = trimmed.substring(colonIdx + 1).trim();
          var indent = line.substring(0, line.indexOf(trimmed));

          // Skip if already prefixed or if it's a selector
          if (prop.indexOf('{') >= 0 || prop.indexOf('}') >= 0) {
            result.push(line);
            continue;
          }

          if (isPrefixed(prop)) {
            result.push(line);
            continue;
          }

          // Check for selectors (not declarations)
          if (prop.indexOf('.') === 0 || prop.indexOf('#') === 0 || prop.match(/^[a-zA-Z][\w-]*$/)) {
            // It's a selector or property name
          } else {
            result.push(line);
            continue;
          }

          // Skip if it doesn't look like a CSS property
          if (!prop.match(/^[a-zA-Z-]+$/)) {
            result.push(line);
            continue;
          }

          // Get vendor prefixes for this property
          var prefixes = getPrefixes(prop);
          var valResult = prefixFunctionValues(val);

          // Add prefixed declarations
          prefixes.forEach(function (pfx) {
            result.push(indent + pfx + prop + ': ' + val + ';');
          });

          // If value had prefixed functions, we need additional declarations
          // Add the original line
          result.push(line);
        } else {
          result.push(line);
        }
      }

      // Flush any remaining keyframes
      if (inKeyframes && keyframeBuffer.length > 0) {
        emitKeyframes();
      }

      return result.join('\n');
    }

    function prefix() {
      var code = input.value;
      if (!code.trim()) {
        showMsg(T('请输入 CSS 代码。', 'Please enter CSS code.'), true);
        return;
      }

      try {
        var result = prefixCSS(code);
        output.value = result;
        var linesIn = code.split('\n').length;
        var linesOut = result.split('\n').length;
        showMsg(T('✓ 前缀添加完成！' + (linesOut - linesIn) + ' 行已添加前缀', '✓ Prefixes added! ' + (linesOut - linesIn) + ' prefixed lines generated'));
      } catch (e) {
        showMsg(T('错误：' + e.message, 'Error: ' + e.message), true);
      }
    }

    function copyResult() {
      var code = output.value.trim();
      if (!code) {
        showMsg(T('请先添加前缀。', 'Please prefix CSS first.'), true);
        return;
      }
      navigator.clipboard.writeText(code).then(function () {
        showMsg(T('✓ 已复制到剪贴板！', '✓ Copied to clipboard!'));
      }).catch(function () {
        output.select();
        document.execCommand('copy');
        showMsg(T('✓ 已复制！', '✓ Copied!'));
      });
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      showMsg('');
    }

    prefixBtn.addEventListener('click', prefix);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);

    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        prefix();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();