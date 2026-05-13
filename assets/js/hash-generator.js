// Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
(function () {
  const input = document.getElementById('input');
  const results = document.getElementById('results');

  // MD5 implementation (compact, public domain)
  function md5(str) {
    function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
    function add(a, b) { return ((a + b) & 0xffffffff) >>> 0; }
    function f(x, y, z) { return (x & y) | (~x & z); }
    function g(x, y, z) { return (x & z) | (y & ~z); }
    function h(x, y, z) { return x ^ y ^ z; }
    function i(x, y, z) { return y ^ (x | ~z); }
    function step(fn, a, b, c, d, x, s, t) {
      return add(rotl(add(add(a, fn(b, c, d)), add(x, t)), s), b);
    }

    // Convert string to UTF-8 bytes
    const bytes = new TextEncoder().encode(str);
    const len = bytes.length;
    const padLen = (((len + 8) >>> 6) + 1) << 4; // in 32-bit words
    const blocks = new Uint32Array(padLen);
    for (let j = 0; j < len; j++) blocks[j >> 2] |= bytes[j] << ((j & 3) << 3);
    blocks[len >> 2] |= 0x80 << ((len & 3) << 3);
    const bitLen = len * 8;
    blocks[padLen - 2] = bitLen & 0xffffffff;
    blocks[padLen - 1] = Math.floor(bitLen / 0x100000000);

    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
    const T = [
      0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,
      0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,
      0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
      0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,
      0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,
      0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,
      0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,
      0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391
    ];
    const S = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];

    for (let off = 0; off < padLen; off += 16) {
      const aa = a, bb = b, cc = c, dd = d;
      for (let k = 0; k < 64; k++) {
        const round = k >> 4;
        let fn, idx;
        if (round === 0) { fn = f; idx = k; }
        else if (round === 1) { fn = g; idx = (5 * k + 1) & 15; }
        else if (round === 2) { fn = h; idx = (3 * k + 5) & 15; }
        else { fn = i; idx = (7 * k) & 15; }
        const s = S[round * 4 + (k & 3)];
        const x = blocks[off + idx];
        [a, b, c, d] = [d, step(fn, a, b, c, d, x, s, T[k]), b, c];
      }
      a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
    }

    function hex(n) {
      let s = '';
      for (let j = 0; j < 4; j++) {
        const byte = (n >>> (j * 8)) & 0xff;
        s += byte.toString(16).padStart(2, '0');
      }
      return s;
    }
    return hex(a) + hex(b) + hex(c) + hex(d);
  }

  async function sha(algo, str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest(algo, buf);
    return [...new Uint8Array(hashBuf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function update() {
    const t = input.value;
    if (!t) { results.innerHTML = ''; return; }
    const md5h = md5(t);
    const sha1 = await sha('SHA-1', t);
    const sha256 = await sha('SHA-256', t);
    const sha512 = await sha('SHA-512', t);
    const items = [
      ['MD5', md5h],
      ['SHA-1', sha1],
      ['SHA-256', sha256],
      ['SHA-512', sha512],
    ];
    results.innerHTML = items.map(([name, val]) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong>${name}</strong>
          <button class="btn btn-secondary" style="padding:4px 10px;font-size:12px" onclick="copyToClipboard('${val}')">📋</button>
        </div>
        <div style="background:var(--bg);padding:10px 12px;border-radius:6px;font-family:Consolas,monospace;font-size:13px;word-break:break-all;border:1px solid var(--border)">${val}</div>
      </div>
    `).join('');
  }

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 200);
  });
})();
