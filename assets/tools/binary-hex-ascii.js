// Binary/Hex/ASCII Converter - browser-local, no dependencies
(() => {
  const input = document.getElementById('bha-input');
  const fromSelect = document.getElementById('bha-from');
  const toSelect = document.getElementById('bha-to');
  const output = document.getElementById('bha-output');
  const convertBtn = document.getElementById('bha-convert');
  const copyBtn = document.getElementById('bha-copy');
  const swapBtn = document.getElementById('bha-swap');
  const info = document.getElementById('bha-info');
  const msg = document.getElementById('bha-msg');

  if (!input || !fromSelect || !toSelect || !output || !convertBtn) return;

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error,#e74c3c)' : 'var(--success,#27ae60)';
    setTimeout(() => { if (msg.textContent === text) msg.textContent = ''; }, 3000);
  }

  function detectFormat(text) {
    text = text.trim();
    if (!text) return 'text';
    // Check if it looks like hex (only 0-9, a-f, A-F, spaces)
    const hexClean = text.replace(/[^0-9a-fA-F]/g, '');
    if (hexClean.length > 0 && /^[0-9a-fA-F]+$/.test(text.replace(/[\s,]+/g, ''))) {
      // Check if it looks like binary (only 0, 1)
      const binaryClean = text.replace(/[^01]/g, '');
      if (binaryClean.length === text.replace(/[\s,]+/g, '').length && binaryClean.length > 0) {
        return 'binary';
      }
      // Check if it looks like bytes (0x prefixed)
      if (/0x[0-9a-fA-F]/i.test(text)) return 'bytes';
      // Check if it looks like octal (only 0-7)
      if (/^[0-7\s,]+$/.test(text.replace(/0o?/g, ''))) return 'octal';
      return 'hex';
    }
    // Check bytes format
    if (/0x[0-9a-fA-F]{2}/i.test(text)) return 'bytes';
    // Check binary
    const binClean = text.replace(/[^01\s]/g, '');
    if (binClean.length > 0 && binClean === text.replace(/[\s]+/g, ' ').trim()) {
      return 'binary';
    }
    // Check decimal
    if (/^\d+$/.test(text.trim())) return 'decimal';
    return 'text';
  }

  function textToCodePoints(str) {
    const points = [];
    for (let i = 0; i < str.length; i++) {
      points.push(str.charCodeAt(i));
    }
    return points;
  }

  function parseValue(text, format) {
    text = text.trim();
    if (!text) return null;

    switch (format) {
      case 'binary': {
        const bin = text.replace(/[^01]/g, '');
        if (!bin) return null;
        return BigInt('0b' + bin);
      }
      case 'octal': {
        const oct = text.replace(/[^0-7]/g, '');
        if (!oct) return null;
        return BigInt('0o' + oct);
      }
      case 'decimal': {
        const dec = text.replace(/[^0-9]/g, '');
        if (!dec) return null;
        return BigInt(dec);
      }
      case 'hex': {
        const hex = text.replace(/[^0-9a-fA-F]/g, '');
        if (!hex) return null;
        return BigInt('0x' + hex);
      }
      case 'bytes': {
        const bytes = text.match(/0x[0-9a-fA-F]{2}/g);
        if (!bytes) return null;
        let val = BigInt(0);
        for (let i = 0; i < bytes.length; i++) {
          val = (val << BigInt(8)) + BigInt(parseInt(bytes[i], 16));
        }
        return val;
      }
      case 'text':
        return null; // handled separately
      default:
        return null;
    }
  }

  function formatValueAs(val, format, originalText) {
    if (val === null || val === undefined) return '';

    switch (format) {
      case 'binary':
        return val.toString(2);
      case 'octal':
        return val.toString(8);
      case 'decimal':
        return val.toString(10);
      case 'hex':
        return val.toString(16).toUpperCase();
      case 'bytes': {
        const hex = val.toString(16);
        // Pad to even length
        const padded = hex.length % 2 ? '0' + hex : hex;
        const bytes = [];
        for (let i = 0; i < padded.length; i += 2) {
          bytes.push('0x' + padded.substring(i, i + 2).toUpperCase());
        }
        return bytes.join(' ');
      }
      case 'text': {
        // Convert BigInt to string bytes
        const hex = val.toString(16);
        const padded = hex.length % 2 ? '0' + hex : hex;
        let result = '';
        for (let i = 0; i < padded.length; i += 2) {
          const code = parseInt(padded.substring(i, i + 2), 16);
          if (code >= 32 && code <= 126) {
            result += String.fromCharCode(code);
          } else {
            result += '\\x' + padded.substring(i, i + 2).toUpperCase();
          }
        }
        return result;
      }
      default:
        return '';
    }
  }

  function convert() {
    const text = input.value;
    if (!text.trim()) {
      output.value = '';
      if (info) info.textContent = '';
      return;
    }

    let from = fromSelect.value;
    if (from === 'auto') {
      from = detectFormat(text);
    }

    const to = toSelect.value;

    if (from === 'text') {
      // Convert text to other formats
      const points = textToCodePoints(text);
      const results = [];
      for (let i = 0; i < points.length; i++) {
        const cp = points[i];
        const val = BigInt(cp);
        const formatted = formatValueAs(val, to, text);
        results.push(formatted);
      }

      switch (to) {
        case 'binary':
          output.value = results.join(' ');
          break;
        case 'octal':
          output.value = results.join(' ');
          break;
        case 'hex':
          output.value = results.join(' ');
          break;
        case 'decimal':
          output.value = results.join(' ');
          break;
        case 'bytes':
          output.value = results.map(b => '0x' + BigInt(b).toString(16).toUpperCase().padStart(2, '0')).join(' ');
          break;
        case 'text':
          output.value = text;
          break;
        default:
          output.value = results.join(' ');
      }

      if (info) {
        const charCount = text.length;
        info.textContent = `字符数: ${charCount} · 字节数: ${new TextEncoder().encode(text).length}`;
      }
      return;
    }

    // Parse number from source format
    const val = parseValue(text, from);
    if (val === null) {
      output.value = '';
      showMsg('无法解析输入，请检查格式', true);
      if (info) info.textContent = '';
      return;
    }

    const result = formatValueAs(val, to, text);
    output.value = result;

    if (info) {
      const textFormatted = formatValueAs(val, 'text', text);
      const hexFormatted = formatValueAs(val, 'hex', text);
      const decFormatted = formatValueAs(val, 'decimal', text);
      const binFormatted = formatValueAs(val, 'binary', text);
      const byteCount = Math.ceil(val.toString(16).length / 2);
      info.innerHTML = `十进制: ${decFormatted} · 二进制位数: ${binFormatted.length} · 字节数: ${byteCount}`;
    }
  }

  function copyResult() {
    if (!output.value) {
      showMsg('没有可复制的内容', true);
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showMsg('已复制到剪贴板');
    }).catch(() => {
      showMsg('复制失败，请手动复制', true);
    });
  }

  function swap() {
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    convert();
  }

  // Event listeners
  convertBtn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copyResult);
  swapBtn.addEventListener('click', swap);

  // Enter key triggers conversion
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      convert();
    }
  });

  // Auto-detect on format change
  fromSelect.addEventListener('change', convert);
  toSelect.addEventListener('change', convert);
})();