/**
 * HTML to SVG Converter — Convert HTML snippets to SVG vector graphics
 * AI Toolbox - Privacy-first browser-local tool
 *
 * Uses SVG foreignObject to embed HTML inline. All processing is local.
 */
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('hs-input');
    const output = document.getElementById('hs-output');
    const preview = document.getElementById('hs-preview');
    const msg = document.getElementById('hs-msg');
    const widthInput = document.getElementById('hs-width');
    const heightInput = document.getElementById('hs-height');
    const convertBtn = document.getElementById('hs-convert');
    const copyBtn = document.getElementById('hs-copy');
    const downloadBtn = document.getElementById('hs-download');
    const clearBtn = document.getElementById('hs-clear');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !preview) return;

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    function escapeXml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    function convert() {
      const html = input.value.trim();
      if (!html) {
        showMsg(isEN ? 'Please enter HTML code.' : '请输入 HTML 代码。', true);
        return;
      }

      const w = parseInt(widthInput.value) || 800;
      const h = parseInt(heightInput.value) || 600;

      try {
        // Build SVG with foreignObject
        // Wrap the HTML in a div with explicit sizing for foreignObject
        const wrappedHtml = '<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;overflow:auto;font-family:sans-serif;font-size:14px;color:#333;background:#fff;padding:16px;box-sizing:border-box">' + html + '</div>';

        const svgContent = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<svg xmlns="http://www.w3.org/2000/svg"',
          '     width="' + w + '" height="' + h + '"',
          '     viewBox="0 0 ' + w + ' ' + h + '"',
          '     xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          '  <defs>',
          '    <style>',
          '      /* Embedded styles for the HTML content */',
          '      * { margin: 0; padding: 0; box-sizing: border-box; }',
          '      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
          '    </style>',
          '  </defs>',
          '  <rect width="100%" height="100%" fill="#ffffff" />',
          '  <foreignObject x="0" y="0" width="100%" height="100%">',
          '    ' + wrappedHtml,
          '  </foreignObject>',
          '</svg>'
        ].join('\n');

        output.value = svgContent;
        if (preview) {
          preview.innerHTML = svgContent;
        }
        showMsg(isEN ? '✓ Conversion complete! SVG generated.' : '✓ 转换完成！SVG 已生成。');
      } catch (e) {
        showMsg(isEN ? 'Error: ' + e.message : '错误：' + e.message, true);
      }
    }

    function copySvg() {
      const code = output.value.trim();
      if (!code) {
        showMsg(isEN ? 'Nothing to copy. Generate SVG first.' : '没有可复制的内容，请先生成 SVG。', true);
        return;
      }
      navigator.clipboard.writeText(code).then(function () {
        showMsg(isEN ? '✓ SVG code copied to clipboard!' : '✓ SVG 代码已复制到剪贴板！');
      }).catch(function () {
        // Fallback
        output.select();
        document.execCommand('copy');
        showMsg(isEN ? '✓ Copied!' : '✓ 已复制！');
      });
    }

    function downloadSvg() {
      const code = output.value.trim();
      if (!code) {
        showMsg(isEN ? 'Nothing to download. Generate SVG first.' : '没有可下载的内容，请先生成 SVG。', true);
        return;
      }
      const blob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMsg(isEN ? '✓ SVG file downloaded!' : '✓ SVG 文件已下载！');
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      if (preview) preview.innerHTML = '';
      showMsg('');
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    copyBtn.addEventListener('click', copySvg);
    downloadBtn.addEventListener('click', downloadSvg);
    clearBtn.addEventListener('click', clearAll);

    // Allow Ctrl+Enter to convert
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