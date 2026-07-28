/**
 * CSS Media Query Generator — Visually generate responsive CSS @media queries
 * AI Toolbox - Privacy-first browser-local tool
 *
 * All processing is done locally in the browser.
 */
(function () {
  'use strict';

  function init() {
    var preset = document.getElementById('mq-preset');
    var width = document.getElementById('mq-width');
    var mode = document.getElementById('mq-mode');
    var orientation = document.getElementById('mq-orientation');
    var output = document.getElementById('mq-output');
    var msg = document.getElementById('mq-msg');
    var generateBtn = document.getElementById('mq-generate');
    var copyBtn = document.getElementById('mq-copy');
    var clearBtn = document.getElementById('mq-clear');
    var isEN = document.documentElement.lang === 'en';

    var T = function (zh, en) { return isEN ? en : zh; };

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    function generate() {
      var w = parseInt(width.value, 10);
      if (isNaN(w) || w < 0) {
        showMsg(T('请输入有效的宽度值', 'Please enter a valid width value'), true);
        return;
      }

      var modeVal = mode.value;
      var orientVal = orientation.value;
      var conditions = [];

      // Build condition
      if (modeVal === 'min-width') {
        conditions.push('(min-width: ' + w + 'px)');
      } else {
        conditions.push('(max-width: ' + w + 'px)');
      }

      if (orientVal) {
        conditions.push('(orientation: ' + orientVal + ')');
      }

      var query = conditions.join(' and ');
      var code = '@media ' + query + ' {\n  /* ' + T('你的样式代码', 'Your styles here') + ' */\n}';

      output.value = code;
      showMsg(T('已生成 @media 规则', '@media rule generated'));
    }

    // Preset change updates width
    preset.addEventListener('change', function () {
      if (preset.value) {
        width.value = preset.value;
        generate();
      }
    });

    // Generate on button click
    generateBtn.addEventListener('click', generate);

    // Auto-generate on width/mode/orientation change
    width.addEventListener('input', generate);
    mode.addEventListener('change', generate);
    orientation.addEventListener('change', generate);

    copyBtn.addEventListener('click', function () {
      if (!output.value) {
        showMsg(T('没有可复制的内容', 'Nothing to copy'), true);
        return;
      }
      navigator.clipboard.writeText(output.value).then(function () {
        showMsg(T('代码已复制到剪贴板', 'Code copied to clipboard'));
      }).catch(function () {
        showMsg(T('复制失败，请手动选择复制', 'Copy failed, please select manually'), true);
      });
    });

    clearBtn.addEventListener('click', function () {
      output.value = '';
      width.value = '768';
      preset.value = '';
      mode.value = 'min-width';
      orientation.value = '';
      showMsg(T('已重置', 'Reset'));
    });

    // Generate initial
    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();