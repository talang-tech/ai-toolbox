// QR Code Decoder (upload image -> decode)
(() => {
  const input = document.getElementById('qdInput');
  const output = document.getElementById('qdOutput');
  const fileInput = document.getElementById('qdFile');
  const copyBtn = document.getElementById('qdCopy');
  const isEN = document.documentElement.lang === 'en';

  function loadQRLib() {
    return new Promise((resolve, reject) => {
      if (window.jsQR) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await loadQRLib();
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          output.value = code.data;
          showToast(isEN ? 'Decoded!' : '已解码!');
        } else {
          output.value = isEN ? 'No QR code found in the image' : '图片中未识别到二维码';
        }
      };
    } catch (e) {
      output.value = (isEN ? 'Error: ' : '错误: ') + e.message;
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    showToast(isEN ? 'Copied!' : '已复制!');
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
