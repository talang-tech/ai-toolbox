// ROT13 / Caesar Cipher — local-only text transformation
(function () {
  const input = document.getElementById('rot13-input');
  const output = document.getElementById('rot13-output');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output) return;

  function rot13(s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
      const code = c.charCodeAt(0);
      const base = code < 97 ? 65 : 97;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  }

  function rot47(s) {
    return s.replace(/[\x21-\x7e]/g, function (c) {
      return String.fromCharCode(33 + ((c.charCodeAt(0) - 33 + 47) % 94));
    });
  }

  function rot5(s) {
    return s.replace(/[0-9]/g, function (c) {
      return String.fromCharCode(48 + ((c.charCodeAt(0) - 48 + 5) % 10));
    });
  }

  function caesar(s, shift) {
    shift = parseInt(shift, 10) || 0;
    shift = ((shift % 26) + 26) % 26;
    return s.replace(/[a-zA-Z]/g, function (c) {
      const code = c.charCodeAt(0);
      const base = code < 97 ? 65 : 97;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    });
  }

  function getMode() {
    const radios = document.querySelectorAll('input[name="mode"]');
    for (const r of radios) {
      if (r.checked) return r.value;
    }
    return 'rot13';
  }

  function transform() {
    const text = input.value;
    if (!text) { output.value = ''; return; }
    const mode = getMode();
    try {
      switch (mode) {
        case 'rot13':
          output.value = rot13(text);
          break;
        case 'rot47':
          output.value = rot47(text);
          break;
        case 'rot5':
          output.value = rot5(text);
          break;
        case 'rot135':
          output.value = rot5(rot13(text));
          break;
        case 'caesar': {
          const shiftEl = document.getElementById('caesar-shift');
          output.value = caesar(text, shiftEl ? shiftEl.value : 3);
          break;
        }
        default:
          output.value = rot13(text);
      }
    } catch (e) {
      output.value = (isEN ? 'Error: ' : '错误：') + e.message;
    }
  }

  // Show/hide Caesar shift control
  document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const ctrl = document.getElementById('caesar-control');
      if (ctrl) {
        ctrl.style.display = this.value === 'caesar' ? 'inline-flex' : 'none';
      }
      transform();
    });
  });

  const shiftEl = document.getElementById('caesar-shift');
  if (shiftEl) {
    shiftEl.addEventListener('input', transform);
  }

  document.getElementById('rot13-encode').addEventListener('click', transform);
  document.getElementById('rot13-clear').addEventListener('click', function () {
    input.value = '';
    output.value = '';
    input.focus();
  });
  document.getElementById('rot13-copy').addEventListener('click', function () {
    if (output.value) copyToClipboard(output.value);
  });

  // Live transform on input
  input.addEventListener('input', transform);
})();