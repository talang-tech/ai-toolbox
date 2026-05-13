// Word Counter
(function () {
  const input = document.getElementById('input');
  const stats = document.getElementById('stats');
  const isEN = document.documentElement.lang === 'en';
  const labels = isEN
    ? { chars: 'Characters', noSpace: 'Without spaces', words: 'Words', lines: 'Lines', paras: 'Paragraphs' }
    : { chars: '字符', noSpace: '不含空格', words: '字数', lines: '行数', paras: '段落' };

  function update() {
    const t = input.value;
    const chars = [...t].length; // 正确计算 emoji
    const noSpace = [...t.replace(/\s/g, '')].length;
    // 中英文混合：中文按字符算，英文按单词算
    const cn = (t.match(/[\u4e00-\u9fa5]/g) || []).length;
    const en = (t.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\S+/g) || []).length;
    const words = cn + en;
    const lines = t === '' ? 0 : t.split(/\n/).length;
    const paras = t.trim() === '' ? 0 : t.split(/\n\s*\n/).filter(p => p.trim()).length;
    stats.innerHTML = `
      <div class="stat-item"><strong>${chars}</strong>${labels.chars}</div>
      <div class="stat-item"><strong>${noSpace}</strong>${labels.noSpace}</div>
      <div class="stat-item"><strong>${words}</strong>${labels.words}</div>
      <div class="stat-item"><strong>${lines}</strong>${labels.lines}</div>
      <div class="stat-item"><strong>${paras}</strong>${labels.paras}</div>
    `;
  }
  input.addEventListener('input', update);
  update();
})();
