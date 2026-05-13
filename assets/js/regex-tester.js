// Regex Tester
(function () {
  const pattern = document.getElementById('pattern');
  const flags = document.getElementById('flags');
  const text = document.getElementById('text');
  const result = document.getElementById('result');
  const matches = document.getElementById('matches');
  const isEN = document.documentElement.lang === 'en';

  function escape(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function update() {
    const p = pattern.value;
    const f = flags.value;
    const t = text.value;
    if (!p) {
      result.innerHTML = '';
      matches.textContent = '';
      return;
    }
    try {
      const re = new RegExp(p, f);
      const allFlags = f.includes('g') ? f : f + 'g';
      const reGlobal = new RegExp(p, allFlags);
      const found = [...t.matchAll(reGlobal)];

      let html = '', last = 0;
      for (const m of found) {
        html += escape(t.substring(last, m.index));
        html += `<mark style="background:rgba(99,102,241,0.4);color:#fff;padding:0 2px;border-radius:2px">${escape(m[0])}</mark>`;
        last = m.index + m[0].length;
      }
      html += escape(t.substring(last));
      result.innerHTML = html;
      matches.innerHTML = isEN
        ? `Found <strong style="color:var(--accent-hover)">${found.length}</strong> match${found.length !== 1 ? 'es' : ''}`
        : `找到 <strong style="color:var(--accent-hover)">${found.length}</strong> 个匹配`;
    } catch (e) {
      result.innerHTML = `<span style="color:var(--error)">${isEN ? 'Invalid regex' : '正则无效'}: ${escape(e.message)}</span>`;
      matches.textContent = '';
    }
  }

  [pattern, flags, text].forEach(el => el.addEventListener('input', update));
})();
