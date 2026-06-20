// Punycode / IDN Converter — local-only domain encoding
// Uses a minimal JS punycode implementation (RFC 3492) with native TextEncoder/Decoder
(function () {
  const input = document.getElementById('punycode-input');
  const resEnc = document.getElementById('punycode-result-enc');
  const resDec = document.getElementById('punycode-result-dec');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !resEnc || !resDec) return;

  // Minimal Punycode implementation (RFC 3492)
  const BASE = 36;
  const TMIN = 1;
  const TMAX = 26;
  const SKEW = 38;
  const DAMP = 700;
  const INITIAL_BIAS = 72;
  const INITIAL_N = 0x80;
  const DELIMITER = '-';

  function adapt(delta, numPoints, firstTime) {
    delta = Math.floor(delta / (firstTime ? DAMP : 2));
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((BASE - TMIN) * TMAX) / 2) {
      delta = Math.floor(delta / (BASE - TMIN));
      k += BASE;
    }
    return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
  }

  function isBasic(cp) {
    return cp < 0x80;
  }

  function isDelimiter(cp) {
    return cp === 0x2D;
  }

  function decode(input) {
    let output = [];
    let inputLen = input.length;
    let n = INITIAL_N;
    let i = 0;
    let bias = INITIAL_BIAS;
    let basic = input.lastIndexOf(DELIMITER);
    if (basic < 0) basic = 0;
    for (let j = 0; j < basic; j++) {
      let cp = input.charCodeAt(j);
      if (!isBasic(cp)) throw new Error('Invalid punycode input');
      output.push(cp);
    }
    let inPos = basic > 0 ? basic + 1 : 0;
    while (inPos < inputLen) {
      let oldi = i;
      let w = 1;
      for (let k = BASE; ; k += BASE) {
        if (inPos >= inputLen) throw new Error('Invalid punycode input');
        let digit = input.charCodeAt(inPos++) - 48;
        if (digit > 25) digit -= 9; // a-z = 0-25, 0-9 = 26-35
        if (digit < 0 || digit > 35) throw new Error('Invalid punycode input');
        i += digit * w;
        let t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
        if (digit < t) break;
        w *= BASE - t;
      }
      output.splice(i - oldi, 0, n);
      bias = adapt(i - oldi, output.length + 1, oldi === 0);
      n++;
      i++;
    }
    return String.fromCodePoint.apply(null, output);
  }

  function encode(input) {
    let cpArray = Array.from(input).map(function (ch) {
      return ch.codePointAt(0);
    });
    let n = INITIAL_N;
    let delta = 0;
    let bias = INITIAL_BIAS;
    let h = 0;
    let b = 0;
    let output = [];
    for (let j = 0; j < cpArray.length; j++) {
      if (isBasic(cpArray[j])) {
        output.push(cpArray[j]);
        b++;
        h++;
      }
    }
    if (b > 0 && b < cpArray.length) {
      output.push(0x2D);
    }
    while (h < cpArray.length) {
      let m = 0x10FFFF;
      for (let j = 0; j < cpArray.length; j++) {
        if (cpArray[j] >= n && cpArray[j] < m) m = cpArray[j];
      }
      delta += (m - n) * (h + 1);
      n = m;
      for (let j = 0; j < cpArray.length; j++) {
        if (cpArray[j] < n) {
          delta++;
        }
        if (cpArray[j] === n) {
          let q = delta;
          for (let k = BASE; ; k += BASE) {
            let t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
            if (q < t) break;
            output.push(digitToCode(t + ((q - t) % (BASE - t))));
            q = Math.floor((q - t) / (BASE - t));
          }
          output.push(digitToCode(q));
          bias = adapt(delta, h + 1, h === b);
          delta = 0;
          h++;
        }
      }
      delta++;
      n++;
    }
    return String.fromCodePoint.apply(null, output);
  }

  function digitToCode(d) {
    if (d < 26) return d + 97;  // a-z
    return d + 22;  // 0-9 (48-22=26)
  }

  function encodeLabel(label) {
    // Check if the label needs encoding
    let needsEncoding = false;
    for (let i = 0; i < label.length; i++) {
      if (label.charCodeAt(i) >= 0x80) {
        needsEncoding = true;
        break;
      }
    }
    if (!needsEncoding) return label;
    return 'xn--' + encode(label);
  }

  function decodeLabel(label) {
    if (label.toLowerCase().startsWith('xn--')) {
      return decode(label.slice(4));
    }
    return label;
  }

  function isPunycode(s) {
    return s.toLowerCase().includes('xn--');
  }

  function encodeDomain(domain) {
    return domain.split('.').map(encodeLabel).join('.');
  }

  function decodeDomain(domain) {
    try {
      return domain.split('.').map(decodeLabel).join('.');
    } catch (e) {
      throw e;
    }
  }

  function update() {
    const text = input.value.trim();
    if (!text) {
      resEnc.textContent = '\u2014';
      resDec.textContent = '\u2014';
      return;
    }
    try {
      if (isPunycode(text)) {
        // Decode mode
        resEnc.textContent = text;
        resDec.textContent = decodeDomain(text);
      } else {
        // Encode mode
        resEnc.textContent = encodeDomain(text);
        resDec.textContent = text;
      }
    } catch (e) {
      const err = (isEN ? 'Error: ' : '错误：') + e.message;
      resEnc.textContent = err;
      resDec.textContent = err;
    }
  }

  document.getElementById('punycode-encode').addEventListener('click', function () {
    const text = input.value.trim();
    if (!text) return;
    try {
      resEnc.textContent = encodeDomain(text);
      resDec.textContent = text;
    } catch (e) {
      const err = (isEN ? 'Error: ' : '错误：') + e.message;
      resEnc.textContent = err;
      resDec.textContent = err;
    }
  });

  document.getElementById('punycode-decode').addEventListener('click', function () {
    const text = input.value.trim();
    if (!text) return;
    try {
      resDec.textContent = decodeDomain(text);
      resEnc.textContent = text;
    } catch (e) {
      const err = (isEN ? 'Error: ' : '错误：') + e.message;
      resEnc.textContent = err;
      resDec.textContent = err;
    }
  });

  document.getElementById('punycode-clear').addEventListener('click', function () {
    input.value = '';
    resEnc.textContent = '\u2014';
    resDec.textContent = '\u2014';
    input.focus();
  });

  // Live update on input
  input.addEventListener('input', update);
})();