// PEM Certificate Decoder
// Decode PEM certificates, CSRs, and private keys in the browser
// All parsing is done locally - no data leaves the browser
(function () {
  'use strict';
  const isEN = document.documentElement.lang === 'en';
  function getEl(id) { return document.getElementById(id); }
  function decodeBase64(str) {
    try { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); } catch(e) { return null; }
  }
  function readTag(bytes, offset) {
    if (offset >= bytes.length) return null;
    const tag = bytes[offset];
    if (offset + 1 >= bytes.length) return null;
    const fl = bytes[offset + 1];
    let len = 0, lb = 2;
    if (fl < 0x80) { len = fl; }
    else {
      const nl = fl & 0x7F;
      if (nl > 4) return null;
      lb = 2 + nl;
      for (let i = 0; i < nl; i++) len = (len << 8) | bytes[offset + 2 + i];
    }
    const vo = offset + lb;
    if (vo + len > bytes.length) return null;
    return { tag, length: len, headerLen: lb, valueOffset: vo, value: bytes.slice(vo, vo + len) };
  }
  function readOID(bytes) {
    if (bytes.length < 2) return '';
    const parts = [Math.floor(bytes[0] / 40), bytes[0] % 40];
    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
      const b = bytes[i];
      if (b & 0x80) { val = (val << 7) | (b & 0x7F); }
      else { val = (val << 7) | b; parts.push(val); val = 0; }
    }
    return parts.join('.');
  }
  var kOID = {'2.5.4.3':'CN','2.5.4.6':'C','2.5.4.7':'L','2.5.4.8':'ST','2.5.4.10':'O','2.5.4.11':'OU','2.5.29.17':'subjectAltName','2.5.29.14':'subjectKeyIdentifier','2.5.29.19':'basicConstraints','2.5.29.35':'authorityKeyIdentifier','1.2.840.113549.1.1.1':'RSA','1.2.840.10045.2.1':'EC','1.2.840.113549.1.1.11':'sha256WithRSAEncryption'};
  function rOID(oid) { return kOID[oid] || oid; }
  function parseDN(bytes) {
    const r = {}; let off = 0;
    while (off < bytes.length) {
      const st = readTag(bytes, off);
      if (!st || st.tag !== 0x31) break;
      off = st.valueOffset + st.length;
      let io = st.valueOffset;
      while (io < st.valueOffset + st.length) {
        const sq = readTag(bytes, io);
        if (!sq || sq.tag !== 0x30) break;
        io = sq.valueOffset + sq.length;
        const ot = readTag(bytes, sq.valueOffset);
        if (!ot || ot.tag !== 0x06) continue;
        const oid = readOID(ot.value);
        const vt = readTag(bytes, ot.valueOffset + ot.length);
        if (!vt) continue;
        let val = '';
        try { val = new TextDecoder('utf-8').decode(vt.value); } catch(e) {}
        const key = rOID(oid);
        if (key && val && !r[key]) r[key] = val;
      }
    }
    return r;
  }
  function bytesToHex(b) { return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join(':').toUpperCase(); }
  function detectPEMType(pem) { const m = pem.match(/-----BEGIN\s+([A-Z ]+)-----/); return m ? m[1].trim() : 'UNKNOWN'; }
  function getPEMContent(pem) { return pem.replace(/-----BEGIN [A-Z ]+-----/g,'').replace(/-----END [A-Z ]+-----/g,'').replace(/[\s\r\n]+/g,''); }
  function parseX509Cert(der) {
    const c = {};
    const o = readTag(der, 0);
    if (!o || o.tag !== 0x30) return { error: isEN ? 'Not valid DER' : '\u65e0\u6548DER\u7f16\u7801' };
    let p = o.headerLen;
    const ts = readTag(der, p);
    if (!ts || ts.tag !== 0x30) return { error: 'TBSCertificate not found' };
    c._tbs = der.slice(p, p + ts.headerLen + ts.length);
    let tp = ts.valueOffset;
    const vt = readTag(der, tp);
    if (vt && vt.tag === 0xA0) tp = vt.valueOffset + vt.length;
    const st = readTag(der, tp);
    if (st && st.tag === 0x02) { c.serialNumber = bytesToHex(st.value); tp = st.valueOffset + st.length; }
    const sat = readTag(der, tp);
    if (sat && sat.tag === 0x30) { const ot = readTag(der, sat.valueOffset); if (ot && ot.tag === 0x06) c.signatureAlgorithm = rOID(readOID(ot.value)); tp = sat.valueOffset + sat.length; }
    const it = readTag(der, tp);
    if (it && it.tag === 0x30) { c.issuer = parseDN(der.slice(tp, it.valueOffset + it.length)); tp = it.valueOffset + it.length; }
    const vat = readTag(der, tp);
    if (vat && vat.tag === 0x30) {
      const nb = readTag(der, vat.valueOffset);
      const na = readTag(der, nb ? nb.valueOffset + nb.length : vat.valueOffset);
      if (nb && (nb.tag === 0x17||nb.tag === 0x18)) c.notBefore = new TextDecoder('utf-8').decode(nb.value);
      if (na && (na.tag === 0x17||na.tag === 0x18)) c.notAfter = new TextDecoder('utf-8').decode(na.value);
      tp = vat.valueOffset + vat.length;
    }
    const sbt = readTag(der, tp);
    if (sbt && sbt.tag === 0x30) { c.subject = parseDN(der.slice(tp, sbt.valueOffset + sbt.length)); tp = sbt.valueOffset + sbt.length; }
    const spkit = readTag(der, tp);
    if (spkit && spkit.tag === 0x30) { const asq = readTag(der, spkit.valueOffset); if (asq && asq.tag === 0x30) { const pkot = readTag(der, asq.valueOffset); if (pkot && pkot.tag === 0x06) c.publicKeyAlgorithm = rOID(readOID(pkot.value)); } }
    return c;
  }
  function formatDate(r) {
    if (!r) return 'N/A';
    try { var c = r.replace(/[^0-9Z]/g,''); if (c.length >= 12) { var y=c.substring(0,2),mo=c.substring(2,4),d=c.substring(4,6),h=c.substring(6,8),mi=c.substring(8,10),s=c.substring(10,12); return (parseInt(y)<50?'20':'19')+y+'-'+mo+'-'+d+' '+h+':'+mi+':'+s+' UTC'; } } catch(e) {}
    return r;
  }
  function renderDN(dn, label) {
    if (!dn || Object.keys(dn).length === 0) return '';
    var parts = [];
    for (var k in dn) { if (dn.hasOwnProperty(k)) parts.push(k+'='+dn[k]); }
    return '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim);vertical-align:top">'+label+'</td><td style="padding:6px 0;word-break:break-all">'+parts.join(', ')+'</td></tr>';
  }
  function decodePEM() {
    var input = getEl('pem-input'), result = getEl('pem-result'), td = getEl('pem-type-display');
    if (!input || !result) return;
    var pem = input.value.trim();
    if (!pem) { result.innerHTML = '<div style="color:var(--text-dim);padding:12px">'+(isEN?'Paste PEM above':'\u8bf7\u7c98\u8d34 PEM')+'</div>'; return; }
    var pt = detectPEMType(pem);
    if (td) td.textContent = pt;
    var der = decodeBase64(getPEMContent(pem));
    if (!der) { result.innerHTML = '<div style="color:var(--error);padding:12px">\u26a0 '+(isEN?'Invalid PEM':'PEM\u65e0\u6548')+'</div>'; return; }
    var info = parseX509Cert(der);
    if (info.error) { result.innerHTML = '<div style="color:var(--error);padding:12px">\u26a0 '+info.error+'</div>'; return; }
    var now = new Date(), expired = false, expiring = false;
    try { var ed = new Date(info.notAfter); if (!isNaN(ed)) { expired = ed < now; expiring = !expired && (ed-now) < 30*86400000; } } catch(e) {}
    var badge = '';
    if (!info.notAfter) badge = '<span style="background:var(--bg-hover);padding:4px 10px;border-radius:6px;font-size:13px">'+(isEN?'Unknown':'\u672a\u77e5')+'</span>';
    else if (expired) badge = '<span style="background:#fef2f2;color:#dc2626;padding:4px 10px;border-radius:6px;font-size:13px">\u2716 '+(isEN?'EXPIRED':'\u5df2\u8fc7\u671f')+'</span>';
    else if (expiring) badge = '<span style="background:#fffbeb;color:#d97706;padding:4px 10px;border-radius:6px;font-size:13px">\u26a0 '+(isEN?'Expiring Soon':'\u5373\u5c06\u8fc7\u671f')+'</span>';
    else badge = '<span style="background:#f0fdf4;color:#16a34a;padding:4px 10px;border-radius:6px;font-size:13px">\u2714 '+(isEN?'Valid':'\u6709\u6548')+'</span>';
    var html = '<div style="display:grid;gap:12px">';
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:16px">'+(isEN?'Certificate Details':'\u8bc1\u4e66\u8be6\u60c5')+'</h3>'+badge+'</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6">';
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'PEM Type':'\u7c7b\u578b')+'</td><td style="padding:6px 0"><code>'+pt+'</code></td></tr>';
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'Serial':'\u5e8f\u5217\u53f7')+'</td><td style="padding:6px 0;font-family:monospace;font-size:12px">'+(info.serialNumber||'N/A')+'</td></tr>';
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'Signature Algorithm':'\u7b7e\u540d\u7b97\u6cd5')+'</td><td style="padding:6px 0">'+(info.signatureAlgorithm||'N/A')+'</td></tr>';
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'Public Key':'\u516c\u94a5\u7b97\u6cd5')+'</td><td style="padding:6px 0">'+(info.publicKeyAlgorithm||'N/A')+'</td></tr>';
    html += renderDN(info.subject, isEN ? 'Subject' : '\u4e3b\u9898');
    html += renderDN(info.issuer, isEN ? 'Issuer' : '\u9881\u53d1\u8005');
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'Valid From':'\u6709\u6548\u671f\u4ece')+'</td><td style="padding:6px 0">'+(info.notBefore?formatDate(info.notBefore):'N/A')+'</td></tr>';
    html += '<tr><td style="font-weight:500;padding:6px 12px 6px 0;white-space:nowrap;color:var(--text-dim)">'+(isEN?'Valid Until':'\u6709\u6548\u671f\u5230')+'</td><td style="padding:6px 0">'+(info.notAfter?formatDate(info.notAfter):'N/A')+'</td></tr>';
    html += '</table></div>';
    if (info._tbs && crypto && crypto.subtle) {
      crypto.subtle.digest('SHA-1', info._tbs).then(function(h) {
        var f = bytesToHex(new Uint8Array(h));
        html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px"><h4 style="margin:0 0 8px;font-size:14px">\u6307\u7eb9 (SHA-1)</h4><code style="font-size:12px;word-break:break-all">'+f+'</code></div>';
        result.innerHTML = html + '</div>';
      }).catch(function() { result.innerHTML = html + '</div>'; });
    } else {
      result.innerHTML = html + '</div>';
    }
  }
  function init() {
    var btn = getEl('pem-decode'), clr = getEl('pem-clear'), input = getEl('pem-input');
    if (btn) btn.addEventListener('click', decodePEM);
    if (clr && input) clr.addEventListener('click', function() {
      input.value = '';
      var td = getEl('pem-type-display');
      if (td) td.textContent = isEN ? 'Waiting for input...' : '\u7b49\u5f85\u8f93\u5165...';
      var r = getEl('pem-result');
      if (r) r.innerHTML = '';
    });
    if (input) input.addEventListener('keydown', function(e) { if (e.key === 'Enter' && e.ctrlKey && btn) btn.click(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
