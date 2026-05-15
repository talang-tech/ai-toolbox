// Remove Empty Lines / Whitespace Cleaner
(() => {
  const input = document.getElementById('rlInput');
  const output = document.getElementById('rlOutput');
  const processBtn = document.getElementById('rlProcess');
  const copyBtn = document.getElementById('rlCopy');
  const isEN = document.documentElement.lang === 'en';

  const checks = {
    empty: document.getElementById('rlEmpty'),
    leading: document.getElementById('rlLeading'),
    trailing: document.getElementById('rlTrailing'),
    consecutive: document.getElementById('rlConsecutive'),
    blank: document.getElementById('rlBlank'),
  };

  function process() {
    let text = input.value;
    let lines = text.split('\n');
    
    let result = [];
    for (let line of lines) {
      if (checks.leading.checked) line = line.replace(/^\s+/, '');
      if (checks.trailing.checked) line = line.replace(/\s+$/, '');
      if (checks.consecutive.checked) line = line.replace(/\s+/g, ' ');
      if (checks.empty.checked && line === '') continue;
      if (checks.blank.checked && !line.trim()) continue;
      result.push(line);
    }
    
    output.value = result.join('\n');
    
    const removed = lines.length - result.length;
    showToast((isEN ? `Processed! Removed ${removed} lines` : `已处理! 移除 ${removed} 行`);
  }

  processBtn.addEventListener('click', process);
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
