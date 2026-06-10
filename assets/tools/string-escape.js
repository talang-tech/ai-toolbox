// String Escape / Unescape - browser-local converters
(() => {
  'use strict';

  const input = document.getElementById('seInput');
  const output = document.getElementById('seOutput');
  const mode = document.getElementById('seMode');
  const escapeBtn = document.getElementById('seEscape');
  const unescapeBtn = document.getElementById('seUnescape');
  const copyBtn = document.getElementById('seCopy');
  const clearBtn = document.getElementById('seClear');
  const status = document.getElementById('seStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !mode) return;

  const namedEntities = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '©': '&copy;', '®': '&reg;', '€': '&euro;', '£': '&pound;', '¥': '&yen;',
    '°': '&deg;', '±': '&plusmn;', '×': '&times;', '÷': '&divide;',
    '…': '&hellip;', '–': '&ndash;', '—': '&mdash;'
  };
  const reverseEntities = Object.fromEntries(Object.entries(namedEntities).map(([char, entity]) => [entity, char]));

  const messages = {
    empty: isEN ? 'Enter a string first.' : '请先输入字符串。',
    escaped: isEN ? 'Escaped locally.' : '已在浏览器本地转义。',
    unescaped: isEN ? 'Unescaped locally.' : '已在浏览器本地反转义。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    error: isEN ? 'Conversion error: ' : '转换错误：'
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function encodeHtml(text) {
    return text.replace(/[&<>"'©®€£¥°±×÷…–—]/g, char => namedEntities[char] || char);
  }

  function decodeHtml(text) {
    const textarea = document.createElement('textarea');
    let result = text;
    for (const [entity, char] of Object.entries(reverseEntities)) {
      result = result.split(entity).join(char);
    }
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
    // Let the browser handle additional safe named entities such as &nbsp;.
    textarea.innerHTML = result;
    return textarea.value;
  }

  function unicodeEscape(text) {
    let result = '';
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code >= 0x20 && code <= 0x7e) {
        if (char === '\\') result += '\\\\';
        else result += char;
      } else if (code <= 0xffff) {
        result += `\\u${code.toString(16).padStart(4, '0')}`;
      } else {
        const high = Math.floor((code - 0x10000) / 0x400) + 0xd800;
        const low = ((code - 0x10000) % 0x400) + 0xdc00;
        result += `\\u${high.toString(16)}\\u${low.toString(16)}`;
      }
    }
    return result;
  }

  function unicodeUnescape(text) {
    return text
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  function jsEscape(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/[\b]/g, '\\b')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'");
  }

  function jsUnescape(text) {
    return unicodeUnescape(text)
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }

  function convert(action) {
    const text = input.value;
    if (!text) {
      output.value = '';
      show(messages.empty, 'warning');
      return;
    }

    try {
      const currentMode = mode.value;
      let result = '';
      if (action === 'escape') {
        if (currentMode === 'json') result = JSON.stringify(text).slice(1, -1);
        else if (currentMode === 'js') result = jsEscape(text);
        else if (currentMode === 'unicode') result = unicodeEscape(text);
        else if (currentMode === 'url') result = encodeURIComponent(text);
        else if (currentMode === 'html') result = encodeHtml(text);
      } else {
        if (currentMode === 'json') result = JSON.parse(`"${text.replace(/"/g, '\\"')}"`);
        else if (currentMode === 'js') result = jsUnescape(text);
        else if (currentMode === 'unicode') result = unicodeUnescape(text);
        else if (currentMode === 'url') result = decodeURIComponent(text.replace(/\+/g, ' '));
        else if (currentMode === 'html') result = decodeHtml(text);
      }
      output.value = result;
      show(action === 'escape' ? messages.escaped : messages.unescaped, 'success');
    } catch (err) {
      output.value = '';
      show(messages.error + err.message.slice(0, 220), 'error');
    }
  }

  escapeBtn?.addEventListener('click', () => convert('escape'));
  unescapeBtn?.addEventListener('click', () => convert('unescape'));
  mode.addEventListener('change', () => convert('escape'));
  input.addEventListener('input', () => {
    if (input.value.length < 10000) convert('escape');
  });
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value || '');
      if (typeof toast === 'function') toast(messages.copied);
      show(messages.copied, 'success');
    } catch (err) {
      output.select();
      document.execCommand('copy');
      show(messages.copied, 'success');
    }
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    show(messages.cleared, 'info');
  });

  convert('escape');
})();
