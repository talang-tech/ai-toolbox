// Password Strength Analyzer
(function () {
  'use strict';

  const isEN = document.documentElement.lang === 'en';

  const T = (zh, en) => isEN ? en : zh;

  // Common weak passwords
  const COMMON_WEAK = [
    'password', '123456', '12345678', '123456789', 'qwerty', 'abc123',
    'monkey', 'letmein', 'dragon', '111111', 'baseball', 'iloveyou',
    'trustno1', 'sunshine', 'master', 'welcome', 'shadow', 'ashley',
    'football', 'jesus', 'michael', 'ninja', 'mustang', 'password1',
    'admin', 'administrator', 'passw0rd', 'p@ssword', 'changeme',
    'test', 'guest', 'root', 'toor', '000000', '654321', 'qwerty123',
    'qwertyuiop', 'asdfgh', 'zxcvbnm', 'pass', 'pw', '123', '1234',
    '12345', '1234567890', '987654321', '112233', 'abc123456'
  ];

  const REPEAT_PATTERN = /(.)\1{2,}/;
  const SEQUENTIAL_PATTERN = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)/i;
  const KEYBOARD_PATTERN = /(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i;
  const DATE_PATTERN = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
  const PHONE_PATTERN = /^1[3-9]\d{9}$/;

  const el = id => document.getElementById(id);

  const input = el('ps-input');
  const toggle = el('ps-toggle');
  const strengthBar = el('ps-strength-fill');
  const strengthLabel = el('ps-label');
  const entropyEl = el('ps-entropy');
  const lengthEl = el('ps-length');
  const crackTime = el('ps-crack-time');
  const composition = el('ps-composition');
  const warnings = el('ps-warnings');
  const copyBtn = el('ps-copy-btn');
  const clearBtn = el('ps-clear-btn');

  function calculateEntropy(pwd) {
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;
    if (pool === 0) return 0;
    return pwd.length * Math.log2(pool);
  }

  function getComposition(pwd) {
    const chars = {
      upper: (pwd.match(/[A-Z]/g) || []).length,
      lower: (pwd.match(/[a-z]/g) || []).length,
      digits: (pwd.match(/[0-9]/g) || []).length,
      symbols: (pwd.match(/[^a-zA-Z0-9]/g) || []).length
    };
    return chars;
  }

  function formatCrackTime(entropy) {
    const fastPowers = entropy - 35; // ~40B/s offline attack
    const slowPowers = entropy - 10; // ~1000/s bcrypt
    const fastSeconds = Math.pow(2, Math.max(0, fastPowers));
    const slowSeconds = Math.pow(2, Math.max(0, slowPowers));

    const formatTime = (seconds) => {
      if (seconds < 1) return T('瞬间', 'instantly');
      if (seconds < 60) return T(`${Math.round(seconds)} 秒`, `${Math.round(seconds)} seconds`);
      if (seconds < 3600) return T(`${Math.round(seconds/60)} 分钟`, `${Math.round(seconds/60)} minutes`);
      if (seconds < 86400) return T(`${Math.round(seconds/3600)} 小时`, `${Math.round(seconds/3600)} hours`);
      if (seconds < 2592000) return T(`${Math.round(seconds/86400)} 天`, `${Math.round(seconds/86400)} days`);
      if (seconds < 31536000) return T(`${Math.round(seconds/2592000)} 个月`, `${Math.round(seconds/2592000)} months`);
      if (seconds < 315360000) return T(`${Math.round(seconds/31536000)} 年`, `${Math.round(seconds/31536000)} years`);
      if (seconds < 31536000000) return T(`${Math.round(seconds/315360000)} 十年`, `${Math.round(seconds/315360000)} decades`);
      if (seconds < 3153600000000) return T(`${Math.round(seconds/31536000000)} 世纪`, `${Math.round(seconds/31536000000)} centuries`);
      return T('数千年以上', 'centuries+');
    };

    return { fast: formatTime(fastSeconds), slow: formatTime(slowSeconds) };
  }

  function getWarnings(pwd) {
    const warns = [];
    const lower = pwd.toLowerCase();

    if (pwd.length < 8) warns.push(T('密码过短（建议至少 8 位）', 'Too short (recommend at least 8 characters)'));
    if (pwd.length < 12) warns.push(T('建议使用 12 位以上密码', 'Consider using 12+ characters'));

    if (COMMON_WEAK.includes(lower) || COMMON_WEAK.includes(pwd)) {
      warns.push(T('⚠️ 这是一个常见弱密码', '⚠️ This is a very common weak password'));
    }

    if (REPEAT_PATTERN.test(pwd)) {
      warns.push(T('包含重复字符（如 "aaa"）', 'Contains repeated characters (e.g. "aaa")'));
    }

    if (SEQUENTIAL_PATTERN.test(pwd)) {
      warns.push(T('包含连续字母/数字（如 "abc"、"123"）', 'Contains sequential characters (e.g. "abc", "123")'));
    }

    if (KEYBOARD_PATTERN.test(pwd)) {
      warns.push(T('包含键盘顺序（如 "qwerty"、"asdf"）', 'Contains keyboard pattern (e.g. "qwerty", "asdf")'));
    }

    if (DATE_PATTERN.test(pwd)) {
      warns.push(T('看起来像日期格式（易猜测）', 'Looks like a date format (easily guessable)'));
    }

    if (PHONE_PATTERN.test(pwd)) {
      warns.push(T('看起来像手机号（易猜测）', 'Looks like a phone number (easily guessable)'));
    }

    const comp = getComposition(pwd);
    const types = ['upper', 'lower', 'digits', 'symbols'].filter(k => comp[k] > 0);
    if (types.length === 1 && pwd.length < 20) {
      warns.push(T('只使用了一种字符类型，建议混合使用', 'Only one character type used, mix types for strength'));
    }

    return warns;
  }

  function analyze() {
    const pwd = input.value;
    const len = pwd.length;

    if (len === 0) {
      strengthBar.style.width = '0%';
      strengthBar.style.background = 'var(--border)';
      strengthLabel.textContent = '—';
      strengthLabel.style.color = 'var(--text-secondary)';
      entropyEl.textContent = '—';
      lengthEl.textContent = '0';
      crackTime.textContent = '—';
      composition.innerHTML = '<span style="color:var(--text-secondary)">' + T('输入密码后显示', 'shown after typing') + '</span>';
      warnings.innerHTML = '';
      return;
    }

    const entropy = calculateEntropy(pwd);
    const comp = getComposition(pwd);
    const warns = getWarnings(pwd);
    const times = formatCrackTime(entropy);

    // Strength level
    let level, color, pct;
    if (entropy < 30) { level = T('弱', 'Weak'); color = 'var(--error)'; pct = 15; }
    else if (entropy < 50) { level = T('较弱', 'Fair'); color = '#f97316'; pct = 35; }
    else if (entropy < 70) { level = T('中等', 'Medium'); color = '#fbbf24'; pct = 55; }
    else if (entropy < 90) { level = T('强', 'Strong'); color = 'var(--success)'; pct = 75; }
    else { level = T('非常强', 'Very Strong'); color = '#22c55e'; pct = 100; }

    // Update UI
    strengthBar.style.width = pct + '%';
    strengthBar.style.background = color;
    strengthLabel.textContent = level;
    strengthLabel.style.color = color;
    entropyEl.textContent = Math.round(entropy * 10) / 10 + ' bits';
    lengthEl.textContent = len;
    crackTime.textContent = T(`快速: ${times.fast}`, `Fast: ${times.fast}`);
    crackTime.setAttribute('data-slow', T(`慢速: ${times.slow}`, `Slow: ${times.slow}`));

    // Composition
    const labels = {
      upper: T('大写', 'Upper'),
      lower: T('小写', 'Lower'),
      digits: T('数字', 'Digits'),
      symbols: T('符号', 'Symbols')
    };
    const colors = { upper: '#3b82f6', lower: '#22c55e', digits: '#f59e0b', symbols: '#ef4444' };
    let compHtml = '';
    for (const [k, v] of Object.entries(comp)) {
      if (v > 0) {
        compHtml += `<span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[k]}"></span>${labels[k]}: ${v}</span>`;
      }
    }
    composition.innerHTML = compHtml || '<span style="color:var(--text-secondary)">—</span>';

    // Warnings
    if (warns.length > 0) {
      warnings.innerHTML = warns.map(w => `<div style="font-size:13px;color:#f97316;padding:4px 0">${w}</div>`).join('');
    } else if (len >= 12) {
      warnings.innerHTML = `<div style="font-size:13px;color:var(--success)">${T('✅ 密码强度良好', '✅ Good password strength')}</div>`;
    } else {
      warnings.innerHTML = '';
    }
  }

  // Events
  input.addEventListener('input', analyze);

  toggle.addEventListener('change', () => {
    input.type = toggle.checked ? 'text' : 'password';
  });

  copyBtn.addEventListener('click', () => {
    const pwd = input.value;
    if (!pwd) return;
    const lines = [
      T('密码强度分析', 'Password Strength Analysis'),
      T('密码: ', 'Password: ') + (toggle.checked ? pwd : '••••••'),
      T('强度: ', 'Strength: ') + strengthLabel.textContent,
      T('熵值: ', 'Entropy: ') + entropyEl.textContent,
      T('长度: ', 'Length: ') + lengthEl.textContent,
      T('破解时间: ', 'Crack Time: ') + crackTime.textContent + ' | ' + (crackTime.getAttribute('data-slow') || '')
    ];
    const warningsText = warnings.textContent || '';
    if (warningsText) lines.push(T('警告: ', 'Warnings: ') + warningsText);
    copyToClipboard(lines.join('\n'));
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    toggle.checked = false;
    input.type = 'password';
    analyze();
  });

  // Initial state
  analyze();
})();