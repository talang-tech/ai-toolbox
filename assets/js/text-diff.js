// Text Diff (simple line diff using LCS)
(function () {
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const btn = document.getElementById('compareBtn');
  const out = document.getElementById('diff');
  const isEN = document.documentElement.lang === 'en';

  function lcs(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
    const result = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i-1] === b[j-1]) { result.unshift({ type: 'eq', line: a[i-1] }); i--; j--; }
      else if (dp[i-1][j] >= dp[i][j-1]) { result.unshift({ type: 'del', line: a[i-1] }); i--; }
      else { result.unshift({ type: 'add', line: b[j-1] }); j--; }
    }
    while (i > 0) { result.unshift({ type: 'del', line: a[i-1] }); i--; }
    while (j > 0) { result.unshift({ type: 'add', line: b[j-1] }); j--; }
    return result;
  }

  function escape(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  btn.addEventListener('click', () => {
    const a = left.value.split('\n');
    const b = right.value.split('\n');
    const diff = lcs(a, b);
    if (diff.every(d => d.type === 'eq')) {
      out.innerHTML = `<span style="color:var(--success)">${isEN ? '✓ Identical' : '✓ 完全相同'}</span>`;
      return;
    }
    out.innerHTML = diff.map(d => {
      if (d.type === 'add') return `<div style="background:rgba(16,185,129,0.15);color:#4ade80">+ ${escape(d.line)}</div>`;
      if (d.type === 'del') return `<div style="background:rgba(239,68,68,0.15);color:#f87171">- ${escape(d.line)}</div>`;
      return `<div style="color:var(--text-dim)">  ${escape(d.line)}</div>`;
    }).join('');
  });
})();
