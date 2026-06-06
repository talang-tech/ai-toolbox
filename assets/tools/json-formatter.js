// JSON Formatter
(function () {
  'use strict';

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const msg = document.getElementById('msg');
  const isEN = document.documentElement.lang === 'en';

  function process(action) {
    msg.textContent = '';
    msg.style.color = '';
    if (!input.value.trim()) {
      msg.textContent = isEN ? 'Please enter JSON.' : '请输入 JSON。';
      msg.style.color = 'var(--text-dim)';
      return;
    }
    try {
      const parsed = JSON.parse(input.value);
      if (action === 'format2') output.value = JSON.stringify(parsed, null, 2);
      else if (action === 'format4') output.value = JSON.stringify(parsed, null, 4);
      else if (action === 'minify') output.value = JSON.stringify(parsed);
      else if (action === 'validate') output.value = input.value;
      msg.textContent = isEN ? '✓ Valid JSON' : '✓ JSON 格式正确';
      msg.style.color = 'var(--success)';
    } catch (e) {
      output.value = '';
      // 尝试提取错误位置
      const match = e.message.match(/position (\d+)/);
      let info = e.message;
      if (match) {
        const pos = parseInt(match[1]);
        const before = input.value.substring(0, pos);
        const line = before.split('\n').length;
        const col = pos - before.lastIndexOf('\n');
        info = isEN ? `Line ${line}, Col ${col}: ${e.message}` : `第 ${line} 行，第 ${col} 列: ${e.message}`;
      }
      msg.textContent = '✗ ' + info;
      msg.style.color = 'var(--error)';
    }
  }

  document.getElementById('formatBtn').addEventListener('click', () => process('format2'));
  document.getElementById('format4Btn').addEventListener('click', () => process('format4'));
  document.getElementById('minifyBtn').addEventListener('click', () => process('minify'));
  document.getElementById('validateBtn').addEventListener('click', () => process('validate'));
})();
