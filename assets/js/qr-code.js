// QR Code Generator (uses qrcode.js from CDN, loaded inline)
(function () {
  const input = document.getElementById('input');
  const sizeEl = document.getElementById('size');
  const ecEl = document.getElementById('ec');
  const container = document.getElementById('qrcode');
  const dlBtn = document.getElementById('downloadBtn');
  const isEN = document.documentElement.lang === 'en';

  function loadQRLib() {
    return new Promise((resolve, reject) => {
      if (window.QRCode) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function generate() {
    const text = input.value.trim();
    if (!text) {
      container.innerHTML = `<div style="color:#666;padding:40px">${isEN ? 'Enter text first' : '请先输入文本'}</div>`;
      dlBtn.style.display = 'none';
      return;
    }
    try {
      await loadQRLib();
      const size = Math.max(100, Math.min(1000, parseInt(sizeEl.value) || 300));
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, {
        width: size,
        errorCorrectionLevel: ecEl.value,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      container.innerHTML = '';
      container.appendChild(canvas);
      dlBtn.style.display = 'inline-flex';
      dlBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'qrcode.png';
        a.click();
      };
    } catch (e) {
      container.innerHTML = `<div style="color:red;padding:20px">Error: ${e.message}</div>`;
      dlBtn.style.display = 'none';
    }
  }

  document.getElementById('genBtn').addEventListener('click', generate);
  // Auto-generate on load
  generate();
})();
