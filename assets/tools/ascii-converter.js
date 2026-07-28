/**
 * ASCII Converter — Convert between ASCII chars, decimal, hex, binary, HTML entities
 * AI Toolbox - Privacy-first browser-local tool
 *
 * All processing is done locally in the browser.
 */
(function () {
  'use strict';

  function init() {
    var input = document.getElementById('ac-input');
    var dec = document.getElementById('ac-dec');
    var hex = document.getElementById('ac-hex');
    var bin = document.getElementById('ac-bin');
    var html = document.getElementById('ac-html');
    var msg = document.getElementById('ac-msg');
    var copyDec = document.getElementById('ac-copy-dec');
    var copyHex = document.getElementById('ac-copy-hex');
    var copyBin = document.getElementById('ac-copy-bin');
    var clearBtn = document.getElementById('ac-clear');
    var isEN = document.documentElement.lang === 'en';

    var T = function (zh, en) { return isEN ? en : zh; };

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    function convert() {
      var text = input.value;
      if (!text) {
        dec.value = '';
        hex.value = '';
        bin.value = '';
        html.value = '';
        showMsg('');
        return;
      }

      var decParts = [];
      var hexParts = [];
      var binParts = [];
      var htmlParts = [];

      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        decParts.push(code);
        hexParts.push('0x' + code.toString(16).toUpperCase().padStart(2, '0'));
        binParts.push(code.toString(2).padStart(8, '0'));
        // HTML entity for special chars
        if (code > 127 || code < 32) {
          htmlParts.push('&#' + code + ';');
        } else if (code === 38) {
          htmlParts.push('&amp;');
        } else if (code === 60) {
          htmlParts.push('&lt;');
        } else if (code === 62) {
          htmlParts.push('&gt;');
        } else if (code === 34) {
          htmlParts.push('&quot;');
        } else if (code === 39) {
          htmlParts.push('&#39;');
        } else {
          htmlParts.push(text.charAt(i));
        }
      }

      dec.value = decParts.join(' ');
      hex.value = hexParts.join(' ');
      bin.value = binParts.join(' ');
      html.value = htmlParts.join('');
      showMsg(T('已转换 ' + text.length + ' 个字符', 'Converted ' + text.length + ' characters'));
    }

    // Handle escape sequences like \u0041
    function handleInput() {
      var val = input.value;
      // Check if input contains \u escape sequences
      if (/\\u[0-9a-fA-F]{4}/.test(val)) {
        var decoded = val.replace(/\\u([0-9a-fA-F]{4})/g, function (m, g) {
          return String.fromCharCode(parseInt(g, 16));
        });
        // Temporarily replace to show decoded result
        input.value = decoded;
        convert();
        input.value = val;
        showMsg(T('检测到 \\\\uXXXX 转义序列，已解码显示', 'Detected \\\\uXXXX escape sequences, decoded in results'));
      } else {
        convert();
      }
    }

    // Event listeners
    input.addEventListener('input', handleInput);

    copyDec.addEventListener('click', function () {
      if (!dec.value) { showMsg(T('没有可复制的内容', 'Nothing to copy'), true); return; }
      navigator.clipboard.writeText(dec.value).then(function () {
        showMsg(T('十进制已复制到剪贴板', 'Decimal copied to clipboard'));
      }).catch(function () {
        showMsg(T('复制失败，请手动选择复制', 'Copy failed, please select manually'), true);
      });
    });

    copyHex.addEventListener('click', function () {
      if (!hex.value) { showMsg(T('没有可复制的内容', 'Nothing to copy'), true); return; }
      navigator.clipboard.writeText(hex.value).then(function () {
        showMsg(T('十六进制已复制到剪贴板', 'Hex copied to clipboard'));
      }).catch(function () {
        showMsg(T('复制失败，请手动选择复制', 'Copy failed, please select manually'), true);
      });
    });

    copyBin.addEventListener('click', function () {
      if (!bin.value) { showMsg(T('没有可复制的内容', 'Nothing to copy'), true); return; }
      navigator.clipboard.writeText(bin.value).then(function () {
        showMsg(T('二进制已复制到剪贴板', 'Binary copied to clipboard'));
      }).catch(function () {
        showMsg(T('复制失败，请手动选择复制', 'Copy failed, please select manually'), true);
      });
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      dec.value = '';
      hex.value = '';
      bin.value = '';
      html.value = '';
      showMsg(T('已清空', 'Cleared'));
      input.focus();
    });

    // Initial conversion with placeholder
    convert();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();