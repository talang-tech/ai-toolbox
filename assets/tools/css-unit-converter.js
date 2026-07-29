/**
 * CSS Unit Converter — Convert between px, em, rem, %, vw, vh, vmin, vmax, pt, ch, ex
 * AI Toolbox - Privacy-first browser-local tool
 *
 * All processing is done locally in the browser.
 */
(function () {
  'use strict';

  function init() {
    var input = document.getElementById('cuc-input');
    var fromUnit = document.getElementById('cuc-from');
    var toUnit = document.getElementById('cuc-to');
    var baseSize = document.getElementById('cuc-base');
    var viewportW = document.getElementById('cuc-vw');
    var viewportH = document.getElementById('cuc-vh');
    var output = document.getElementById('cuc-output');
    var msg = document.getElementById('cuc-msg');
    var convertBtn = document.getElementById('cuc-convert');
    var copyBtn = document.getElementById('cuc-copy');
    var clearBtn = document.getElementById('cuc-clear');
    var isEN = document.documentElement.lang === 'en';

    var T = function (zh, en) { return isEN ? en : zh; };

    // Unit definitions: to-px factor or formula
    var UNIT_DEFS = {
      px: { label: 'px', toPx: 1 },
      em: { label: 'em', toPx: function(v, ctx) { return v * ctx.base; } },
      rem: { label: 'rem', toPx: function(v, ctx) { return v * ctx.base; } },
      '%': { label: '%', toPx: function(v, ctx) { return v * ctx.vw / 100; } },
      vw: { label: 'vw', toPx: function(v, ctx) { return v * ctx.vw / 100; } },
      vh: { label: 'vh', toPx: function(v, ctx) { return v * ctx.vh / 100; } },
      vmin: { label: 'vmin', toPx: function(v, ctx) { return v * Math.min(ctx.vw, ctx.vh) / 100; } },
      vmax: { label: 'vmax', toPx: function(v, ctx) { return v * Math.max(ctx.vw, ctx.vh) / 100; } },
      pt: { label: 'pt', toPx: function(v) { return v * 1.33333; } },
      ch: { label: 'ch', toPx: function(v, ctx) { return v * ctx.base * 0.5; } },
      ex: { label: 'ex', toPx: function(v, ctx) { return v * ctx.base * 0.5; } },
    };

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    function toPixels(value, unit, ctx) {
      var def = UNIT_DEFS[unit];
      if (!def) return null;
      if (typeof def.toPx === 'function') return def.toPx(value, ctx);
      return value * def.toPx;
    }

    function fromPixels(px, unit, ctx) {
      var def = UNIT_DEFS[unit];
      if (!def) return null;
      if (unit === 'px') return px;
      // Inverse: for each unit, calculate how to get from px back
      switch (unit) {
        case 'em':
        case 'rem': return px / ctx.base;
        case '%': return (px / ctx.vw) * 100;
        case 'vw': return (px / ctx.vw) * 100;
        case 'vh': return (px / ctx.vh) * 100;
        case 'vmin': return (px / Math.min(ctx.vw, ctx.vh)) * 100;
        case 'vmax': return (px / Math.max(ctx.vw, ctx.vh)) * 100;
        case 'pt': return px / 1.33333;
        case 'ch': return px / (ctx.base * 0.5);
        case 'ex': return px / (ctx.base * 0.5);
        default: return null;
      }
    }

    function convert() {
      var raw = input.value.trim();
      if (!raw) {
        showMsg(T('请输入数值', 'Enter a value'), true);
        return;
      }
      var num = parseFloat(raw);
      if (isNaN(num)) {
        showMsg(T('请输入有效数字', 'Enter a valid number'), true);
        return;
      }

      var from = fromUnit.value;
      var to = toUnit.value;
      var base = parseFloat(baseSize.value) || 16;
      var vw = parseFloat(viewportW.value) || 1920;
      var vh = parseFloat(viewportH.value) || 1080;

      if (base <= 0) { base = 16; baseSize.value = 16; }
      if (vw <= 0) { vw = 1920; viewportW.value = 1920; }
      if (vh <= 0) { vh = 1080; viewportH.value = 1080; }

      var ctx = { base: base, vw: vw, vh: vh };

      var px = toPixels(num, from, ctx);
      if (px === null) {
        showMsg(T('不支持的源单位', 'Unsupported source unit'), true);
        return;
      }

      var result = fromPixels(px, to, ctx);
      if (result === null) {
        showMsg(T('不支持的目标单位', 'Unsupported target unit'), true);
        return;
      }

      // Format result
      var formatted;
      if (to === 'px' || to === 'pt') {
        formatted = Math.round(result * 100) / 100 + to;
      } else {
        formatted = Math.round(result * 10000) / 10000 + to;
      }

      // Show conversion chain
      var chain = num + from + ' = ' + Math.round(px * 100) / 100 + 'px = ' + formatted;
      output.value = formatted;
      showMsg(chain, false);
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      showMsg('', false);
    }

    // Event bindings
    if (convertBtn) convertBtn.addEventListener('click', convert);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', function () {
      if (output.value) {
        navigator.clipboard.writeText(output.value).then(function () {
          showMsg(T('已复制到剪贴板', 'Copied to clipboard'), false);
        });
      }
    });

    // Enter key on input
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') convert();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();