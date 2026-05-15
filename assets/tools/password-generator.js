// Password Generator
(function () {
  const lengthEl = document.getElementById('length');
  const upperEl = document.getElementById('upper');
  const lowerEl = document.getElementById('lower');
  const numberEl = document.getElementById('number');
  const symbolEl = document.getElementById('symbol');
  const excludeEl = document.getElementById('exclude');
  const output = document.getElementById('output');
  const strength = document.getElementById('strength');
  const isEN = document.documentElement.lang === 'en';

  const SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  const SIMILAR = '0Oo1Il';

  function generate() {
    const len = Math.max(4, Math.min(128, parseInt(lengthEl.value) || 16));
    let chars = '';
    if (upperEl.checked) chars += SETS.upper;
    if (lowerEl.checked) chars += SETS.lower;
    if (numberEl.checked) chars += SETS.number;
    if (symbolEl.checked) chars += SETS.symbol;
    if (excludeEl.checked) chars = chars.split('').filter(c => !SIMILAR.includes(c)).join('');
    if (!chars) {
      output.value = isEN ? 'Select at least one character type' : '请至少选择一种字符类型';
      strength.textContent = '';
      return;
    }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let pwd = '';
    for (let i = 0; i < len; i++) pwd += chars[arr[i] % chars.length];
    output.value = pwd;
    // Strength
    const entropy = len * Math.log2(chars.length);
    let label, color;
    if (entropy < 50) { label = isEN ? 'Weak' : '弱'; color = 'var(--error)'; }
    else if (entropy < 80) { label = isEN ? 'Medium' : '中等'; color = '#fbbf24'; }
    else if (entropy < 120) { label = isEN ? 'Strong' : '强'; color = 'var(--success)'; }
    else { label = isEN ? 'Very Strong' : '非常强'; color = 'var(--accent-hover)'; }
    strength.innerHTML = `<span style="color:${color}">${label}</span> · ${Math.round(entropy)} bits`;
  }

  document.getElementById('genBtn').addEventListener('click', generate);
  document.getElementById('copyBtn').addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });
  generate();
})();
