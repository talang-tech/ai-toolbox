// QR Code Decoder (upload image -> decode)
(() => {
  const input = document.getElementById('qdInput');
  const output = document.getElementById('qdOutput');
  const fileInput = document.getElementById('qdFile');
  const copyBtn = document.getElementById('qdCopy');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !fileInput || !copyBtn) return;

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

  async function decodeFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      output.value = isEN ? 'Please choose an image file' : '请选择图片文件';
      return;
    }
    
    try {
      await loadQRLib();
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
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
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        output.value = isEN ? 'Failed to load image' : '图片加载失败';
      };
    } catch (e) {
      output.value = (isEN ? 'Error: ' : '错误: ') + e.message;
    }
  }

  input.addEventListener('click', (e) => {
    if (e.target === fileInput) return;
    e.preventDefault();
    e.stopPropagation();
    fileInput.click();
  });

  input.addEventListener('dragover', (e) => {
    e.preventDefault();
    input.classList.add('dragover');
  });

  input.addEventListener('dragleave', () => input.classList.remove('dragover'));

  input.addEventListener('drop', (e) => {
    e.preventDefault();
    input.classList.remove('dragover');
    decodeFile([...e.dataTransfer.files].find(f => f.type.startsWith('image/')));
  });

  fileInput.addEventListener('change', async (e) => {
    await decodeFile(e.target.files[0]);
    e.target.value = '';
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
