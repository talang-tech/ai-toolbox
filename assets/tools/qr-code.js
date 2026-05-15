// QR Code Generator (uses qrcodejs from CDN)
(function () {
  const input = document.getElementById('input');
  const sizeEl = document.getElementById('size');
  const ecEl = document.getElementById('ec');
  const container = document.getElementById('qrcode');
  const dlBtn = document.getElementById('downloadBtn');
  const genBtn = document.getElementById('genBtn');
  const isEN = document.documentElement.lang === 'en';

  // 用全局变量存当前二维码 canvas，避免重复生成
  let currentCanvas = null;

  function loadQRLib() {
    return new Promise((resolve, reject) => {
      if (window.QRCode) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
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
      // 清空容器
      container.innerHTML = '';
      // qrcodejs API
      new window.QRCode(container, {
        text: text,
        width: size,
        height: size,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: { L: 1, M: 0, Q: 3, H: 2 }[ecEl.value] || 0
      });
      // 获取生成的 canvas
      currentCanvas = container.querySelector('canvas');
      if (currentCanvas) {
        dlBtn.style.display = 'inline-flex';
        dlBtn.onclick = () => {
          const a = document.createElement('a');
          a.href = currentCanvas.toDataURL('image/png');
          a.download = 'qrcode.png';
          a.click();
        };
      }
    } catch (e) {
      container.innerHTML = `<div style="color:red;padding:20px">Error: ${e.message}</div>`;
      dlBtn.style.display = 'none';
    }
  }

  // 延迟绑定事件，确保 DOM 已加载
  function init() {
    if (genBtn) {
      genBtn.addEventListener('click', generate);
      // 自动生成
      setTimeout(generate, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
