// UUID Generator
(function () {
  const versionEl = document.getElementById('version');
  const countEl = document.getElementById('count');
  const output = document.getElementById('output');

  function uuidv4() {
    // Use native crypto.randomUUID if available
    if (crypto.randomUUID) return crypto.randomUUID();
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    a[6] = (a[6] & 0x0f) | 0x40;
    a[8] = (a[8] & 0x3f) | 0x80;
    const h = [...a].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  function uuidv7() {
    const ts = Date.now();
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    // Set timestamp (48 bits)
    a[0] = (ts / 0x10000000000) & 0xff;
    a[1] = (ts / 0x100000000) & 0xff;
    a[2] = (ts / 0x1000000) & 0xff;
    a[3] = (ts / 0x10000) & 0xff;
    a[4] = (ts / 0x100) & 0xff;
    a[5] = ts & 0xff;
    // Version 7
    a[6] = (a[6] & 0x0f) | 0x70;
    // Variant
    a[8] = (a[8] & 0x3f) | 0x80;
    const h = [...a].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  function generate() {
    const v = versionEl.value;
    const n = Math.max(1, Math.min(100, parseInt(countEl.value) || 5));
    const fn = v === '7' ? uuidv7 : uuidv4;
    output.value = Array.from({ length: n }, fn).join('\n');
  }

  document.getElementById('genBtn').addEventListener('click', generate);
  document.getElementById('copyBtn').addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });
  generate();
})();
