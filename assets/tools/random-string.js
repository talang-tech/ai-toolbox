// Random String Generator
(() => {
  const lengthInput = document.getElementById('rsgLength');
  const output = document.getElementById('rsgOutput');
  const genBtn = document.getElementById('rsgGen');
  const copyBtn = document.getElementById('rsgCopy');
  const isEN = document.documentElement.lang === 'en';

  // 字符集选项
  const checks = {
    upper: document.getElementById('rsgUpper'),
    lower: document.getElementById('rsgLower'),
    number: document.getElementById('rsgNumber'),
    special: document.getElementById('rsgSpecial'),
  };

  const charsets = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  function generate() {
    const length = Math.max(1, Math.min(512, parseInt(lengthInput.value) || 32));
    let charset = '';
    for (const [key, el] of Object.entries(checks)) {
      if (el.checked) charset += charsets[key];
    }
    if (!charset) {
      output.value = isEN ? 'Select at least one charset' : '至少选择一种字符集';
      return;
    }
    
    let result = '';
    // 用 Web Crypto 保证随机性
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    output.value = result;
    showToast(isEN ? 'Generated!' : '已生成!');
  }

  genBtn.addEventListener('click', generate);
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
