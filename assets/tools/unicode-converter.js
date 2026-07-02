// Unicode Converter — Convert between \\uXXXX, hex, decimal, HTML entities, and plain text
(function () {
  'use strict';

  const input = document.getElementById('ucInput');
  const output = document.getElementById('ucOutput');
  const msg = document.getElementById('ucMsg');
  const charCount = document.getElementById('ucCharCount');
  const fromSelect = document.getElementById('ucFrom');
  const toSelect = document.getElementById('ucTo');
  const convertBtn = document.getElementById('ucConvertBtn');
  const copyBtn = document.getElementById('ucCopyBtn');

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error)' : 'var(--success)';
  }

  // ── Decoders ──────────────────────────────────────────

  // Decode \\uXXXX escapes (supports \\uXXXX, \\u{XXXXX}, surrogate pairs)
  function decodeUEscape(text) {
    // Handle ES6 extended syntax \\u{XXXXX}
    text = text.replace(/\\u\{([0-9a-fA-F]+)\}/g, function(m, hex) {
      var cp = parseInt(hex, 16);
      return String.fromCodePoint(cp);
    });
    // Handle \\uXXXX (standard 4-digit hex)
    text = text.replace(/\\u([0-9a-fA-F]{4})/g, function(m, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
    // Also handle lower-case \u format (already fine but ensure we catch it)
    text = text.replace(/[\\]+u([0-9a-fA-F]{4})/g, function(m, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
    return text;
  }

  // Decode hex byte sequence (e.g. "E4 B8 AD E6 96 87" or "e4b8ade69687")
  function decodeHex(text) {
    // Remove spaces and split
    var clean = text.replace(/\s+/g, '').trim();
    if (!clean) return '';

    // Check if even length
    if (clean.length % 2 !== 0) {
      throw new Error('Hex string must have an even number of hex digits');
    }

    var bytes = [];
    for (var i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.substring(i, i + 2), 16));
    }

    // Decode as UTF-8
    var decoder = new TextDecoder('utf-8');
    return decoder.decode(new Uint8Array(bytes));
  }

  // Decode decimal codepoints (space or comma separated)
  function decodeDecimal(text) {
    var parts = text.split(/[\s,]+/).filter(Boolean);
    return parts.map(function(p) {
      var cp = parseInt(p, 10);
      if (isNaN(cp)) throw new Error('Invalid decimal codepoint: ' + p);
      return String.fromCodePoint(cp);
    }).join('');
  }

  // Decode HTML entities (&#xHEX; and &#DEC;)
  function decodeHTMLEntity(text) {
    var div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }

  // ── Encoders ──────────────────────────────────────────

  // Encode to \\uXXXX escapes
  function encodeUEscape(text) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var cp = text.charCodeAt(i);
      if (cp > 127 || cp < 32) {
        result += '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
      } else {
        result += text.charAt(i);
      }
    }
    return result;
  }

  // Encode to hex byte sequence (UTF-8)
  function encodeHex(text) {
    var encoder = new TextEncoder();
    var bytes = encoder.encode(text);
    var hexParts = [];
    for (var i = 0; i < bytes.length; i++) {
      hexParts.push(bytes[i].toString(16).toUpperCase().padStart(2, '0'));
    }
    return hexParts.join(' ');
  }

  // Encode to decimal codepoints (space separated)
  function encodeDecimal(text) {
    var result = [];
    for (var i = 0; i < text.length; i++) {
      result.push(text.charCodeAt(i).toString(10));
    }
    return result.join(' ');
  }

  // Encode to HTML entities
  function encodeHTMLEntity(text) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var cp = text.charCodeAt(i);
      if (cp > 127 || cp < 32) {
        result += '&#' + cp + ';';
      } else {
        result += text.charAt(i);
      }
    }
    return result;
  }

  // ── Auto-detect format ───────────────────────────────
  function detectFormat(text) {
    var trimmed = text.trim();
    if (!trimmed) return 'text';

    // Check if it contains \\uXXXX or \\u{XXXXX}
    if (/\\u[0-9a-fA-F]{4}/.test(trimmed) || /\\u\{[0-9a-fA-F]+\}/.test(trimmed)) {
      return 'uescape';
    }

    // Check if it contains HTML entities
    if (/&#\d+;/.test(trimmed) || /&#x[0-9a-fA-F]+;/.test(trimmed)) {
      return 'htmlentity';
    }

    // Check if it's mostly hex bytes (spaces between hex pairs or continuous even hex)
    var noSpace = trimmed.replace(/\s+/g, '');
    if (/^[0-9a-fA-F]+$/.test(noSpace) && noSpace.length % 2 === 0 && noSpace.length > 4) {
      // Verify it has mostly 2-char hex groups
      var groups = trimmed.split(/\s+/);
      if (groups.length > 1 && groups.every(function(g) { return /^[0-9a-fA-F]{2}$/.test(g); })) {
        return 'hex';
      }
      if (noSpace.length >= 6 && groups.length <= 2) {
        return 'hex';
      }
    }

    // Check if it's decimal codepoints (numbers separated by space/comma)
    var decimalParts = trimmed.split(/[\s,]+/).filter(Boolean);
    if (decimalParts.length >= 2 && decimalParts.every(function(p) { return /^\d+$/.test(p); })) {
      // Verify not too large (codepoint range)
      var maxVal = Math.max.apply(null, decimalParts.map(function(p) { return parseInt(p, 10); }));
      if (maxVal <= 0x10FFFF) {
        return 'decimal';
      }
    }

    return 'text';
  }

  // ── Main Convert Function ────────────────────────────
  function doConvert() {
    showMsg('');
    var text = input.value;
    if (!text.trim()) {
      output.value = '';
      if (charCount) charCount.textContent = '';
      showMsg('Please enter text to convert', true);
      return;
    }

    var fromFormat = fromSelect.value;
    var toFormat = toSelect.value;

    // Auto-detect source format
    if (fromFormat === 'auto') {
      fromFormat = detectFormat(text);
    }

    var decoded;
    try {
      switch (fromFormat) {
        case 'text':
          decoded = text;
          break;
        case 'uescape':
          decoded = decodeUEscape(text);
          break;
        case 'hex':
          decoded = decodeHex(text);
          break;
        case 'decimal':
          decoded = decodeDecimal(text);
          break;
        case 'htmlentity':
          decoded = decodeHTMLEntity(text);
          break;
        default:
          showMsg('Unknown source format', true);
          return;
      }
    } catch (e) {
      showMsg('Decode error: ' + e.message, true);
      output.value = '';
      return;
    }

    var result;
    try {
      switch (toFormat) {
        case 'text':
          result = decoded;
          break;
        case 'uescape':
          result = encodeUEscape(decoded);
          break;
        case 'hex':
          result = encodeHex(decoded);
          break;
        case 'decimal':
          result = encodeDecimal(decoded);
          break;
        case 'htmlentity':
          result = encodeHTMLEntity(decoded);
          break;
        default:
          showMsg('Unknown target format', true);
          return;
      }
    } catch (e) {
      showMsg('Encode error: ' + e.message, true);
      output.value = '';
      return;
    }

    output.value = result;

    // Update char count
    if (charCount) {
      var fromName = fromSelect.options[fromSelect.selectedIndex].text;
      var toName = toSelect.options[toSelect.selectedIndex].text;
      charCount.textContent = decoded.length + ' chars \u2192 ' + result.length + ' chars (' +
        (fromFormat === 'auto' ? 'auto: ' + fromName.split(' ')[0] : fromName) + ' \u2192 ' + toName + ')';
    }

    var statusMsg = 'Converted';
    if (fromFormat === 'auto') {
      statusMsg += ' (auto-detected: ' + fromFormat + ')';
    }
    showMsg(statusMsg);
  }

  function copyResult() {
    if (!output.value.trim()) {
      showMsg('Nothing to copy', true);
      return;
    }
    navigator.clipboard.writeText(output.value).then(function() {
      showMsg('Copied to clipboard');
    }).catch(function() {
      output.select();
      document.execCommand('copy');
      showMsg('Copied to clipboard');
    });
  }

  // Auto-convert with debounce
  var autoTimer = null;
  function onInputChange() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function() {
      if (input.value.trim()) {
        doConvert();
      } else {
        output.value = '';
        if (charCount) charCount.textContent = '';
        showMsg('');
      }
    }, 400);
  }

  function init() {
    if (convertBtn) convertBtn.addEventListener('click', doConvert);
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (input) input.addEventListener('input', onInputChange);
    // Also convert on format change
    if (fromSelect) fromSelect.addEventListener('change', function() { if (input.value.trim()) doConvert(); });
    if (toSelect) toSelect.addEventListener('change', function() { if (input.value.trim()) doConvert(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();