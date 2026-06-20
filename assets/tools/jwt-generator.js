// JWT Generator - generate JWT tokens with custom header/payload/secret
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const algoSel = document.getElementById('jwtgAlgo');
  const headerIn = document.getElementById('jwtgHeader');
  const payloadIn = document.getElementById('jwtgPayload');
  const secretIn = document.getElementById('jwtgSecret');
  const issuedAt = document.getElementById('jwtgIat');
  const expireIn = document.getElementById('jwtgExp');
  const generateBtn = document.getElementById('jwtgGenerate');
  const outputField = document.getElementById('jwtgOutput');
  const copyBtn = document.getElementById('jwtgCopy');
  const decodedSection = document.getElementById('jwtgDecoded');
  if (!generateBtn) return;
  const EN = document.documentElement.lang === 'en';

  // Base64 URL-safe encode/decode
  function b64uEncode(s) {
    return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function b64uEncodeRaw(buf) {
    const s = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  // HMAC-SHA256 (pure JS via Web Crypto API)
  async function signHMAC(payload, secret, algo) {
    const alg = algo === 'HS512' ? { name: 'HMAC', hash: 'SHA-512' } :
                algo === 'HS384' ? { name: 'HMAC', hash: 'SHA-384' } :
                { name: 'HMAC', hash: 'SHA-256' };
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), alg, false, ['sign']);
    const sig = await crypto.subtle.sign(alg, key, enc.encode(payload));
    return b64uEncodeRaw(sig);
  }

  async function generate() {
    try {
      const algo = algoSel.value;
      // Parse header
      let header;
      try {
        header = JSON.parse(headerIn.value || '{"alg":"HS256","typ":"JWT"}');
      } catch(e) {
        alert(EN ? 'Invalid header JSON' : 'Header JSON 格式错误');
        return;
      }
      header.alg = algo;
      header.typ = header.typ || 'JWT';

      // Parse payload
      let payload;
      try {
        payload = JSON.parse(payloadIn.value || '{"sub":"1234567890","name":"John Doe","iat":1516239022}');
      } catch(e) {
        alert(EN ? 'Invalid payload JSON' : 'Payload JSON 格式错误');
        return;
      }

      // Add timestamps
      if (issuedAt.checked) payload.iat = Math.floor(Date.now() / 1000);
      if (expireIn.value) {
        const num = parseInt(expireIn.value);
        if (!isNaN(num) && num > 0) payload.exp = Math.floor(Date.now() / 1000) + num;
      }

      const hdrB64 = b64uEncode(JSON.stringify(header));
      const pldB64 = b64uEncode(JSON.stringify(payload));
      const signingInput = hdrB64 + '.' + pldB64;

      let sig;
      if (algo.startsWith('HS')) {
        const secret = secretIn.value || 'your-256-bit-secret';
        sig = await signHMAC(signingInput, secret, algo);
      } else {
        // For none / RS / ES — show unsigned token with warning
        sig = '';
      }

      const token = algo === 'none' ? signingInput + '.' : signingInput + '.' + sig;
      outputField.value = token;

      // Show decoded preview
      decodedSection.innerHTML =
        '<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-top:8px">' +
        '<div style="font-size:13px;color:var(--text-dim);margin-bottom:8px">' + (EN ? 'Preview' : '预览') + '</div>' +
        '<div style="display:flex;gap:4px;font-family:monospace;font-size:12px;word-break:break-all;background:var(--bg);padding:8px;border-radius:6px">' +
        '<span style="color:#e74c3c">' + hdrB64.substring(0,30) + '…</span><span style="color:var(--text-dim)">.</span>' +
        '<span style="color:#27ae60">' + pldB64.substring(0,30) + '…</span><span style="color:var(--text-dim)">.</span>' +
        '<span style="color:#8e44ad">' + (sig ? sig.substring(0,20)+'…' : '') + '</span></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">' +
        '<div><div style="font-size:12px;color:var(--text-dim)">Header</div><pre style="font-size:12px;margin:4px 0;white-space:pre-wrap">' + JSON.stringify(header,null,2) + '</pre></div>' +
        '<div><div style="font-size:12px;color:var(--text-dim)">Payload</div><pre style="font-size:12px;margin:4px 0;white-space:pre-wrap">' + JSON.stringify(payload,null,2) + '</pre></div></div>' +
        '<div style="margin-top:8px;font-size:12px;color:var(--text-dim)">' + token.length + ' chars</div></div>';

    } catch(e) {
      outputField.value = 'Error: ' + e.message;
      decodedSection.innerHTML = '<div style="color:var(--error);padding:8px">⚠ ' + e.message + '</div>';
    }
  }

  function copyResult() {
    outputField.select();
    document.execCommand('copy');
    const orig = copyBtn.textContent;
    copyBtn.textContent = EN ? 'Copied!' : '已复制!';
    setTimeout(() => copyBtn.textContent = orig, 1500);
  }

  // Pre-fill with example
  headerIn.value = JSON.stringify({"alg":"HS256","typ":"JWT"}, null, 2);
  payloadIn.value = JSON.stringify({
    "sub": "1234567890",
    "name": "John Doe",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  }, null, 2);
  secretIn.value = 'your-256-bit-secret';

  generateBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copyResult);

  // Auto-generate on algorithm change
  algoSel.addEventListener('change', generate);

  // Initial generation
  setTimeout(generate, 100);
});
