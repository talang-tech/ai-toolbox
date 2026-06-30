// HTML Diff - compare two HTML snippets with highlighted differences
(function () {
  const oldInput = document.getElementById('htmlDiffOld');
  const newInput = document.getElementById('htmlDiffNew');
  const compareBtn = document.getElementById('htmlDiffCompare');
  const clearBtn = document.getElementById('htmlDiffClear');
  const status = document.getElementById('htmlDiffStatus');
  const resultDiv = document.getElementById('htmlDiffResult');
  const lineMode = document.getElementById('htmlDiffLine');
  const structuredMode = document.getElementById('htmlDiffStructured');
  const isEN = document.documentElement.lang === 'en';

  if (!oldInput || !newInput || !resultDiv) return;

  const msg = {
    emptyOld: isEN ? 'Please enter original HTML.' : '请输入原始 HTML。',
    emptyNew: isEN ? 'Please enter modified HTML.' : '请输入修改后的 HTML。',
    identical: isEN ? '✓ The two HTML snippets are identical.' : '✓ 两段 HTML 完全相同。',
    diffFound: isEN ? 'Found differences — highlighted below.' : '发现差异 — 下方已高亮显示。',
    cleared: isEN ? 'Cleared.' : '已清空。',
    error: isEN ? 'Error:' : '错误：',
  };

  function show(text, type) {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // LCS-based line diff (same algorithm as text-diff)
  function lcsDiff(linesA, linesB) {
    const m = linesA.length, n = linesB.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = linesA[i - 1] === linesB[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
        result.unshift({ type: 'eq', line: linesA[i - 1], oldLine: i, newLine: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'add', line: linesB[j - 1], newLine: j });
        j--;
      } else {
        result.unshift({ type: 'del', line: linesA[i - 1], oldLine: i });
        i--;
      }
    }
    return result;
  }

  // Tokenizer for HTML structure diff
  function tokenizeHtml(html) {
    const tokens = [];
    // Match: open tag, close tag, self-close tag, text, comments
    const regex = /<!--[\s\S]*?-->|<[^>]+>|[^<]+/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const tok = match[0].trim();
      if (!tok) continue;
      if (tok.startsWith('<!--')) continue; // skip comments
      tokens.push(tok);
    }
    return tokens;
  }

  function normalizeTag(tag) {
    // Normalize a tag for comparison (lowercase, sort attributes)
    if (!tag.startsWith('<')) return tag;

    const selfClose = tag.endsWith('/>');
    const close = tag.startsWith('</');

    if (close) return tag.toLowerCase();

    const inner = tag.slice(1, selfClose ? -2 : -1).trim();
    const parts = inner.split(/\s+/);
    const tagName = parts[0].toLowerCase();

    if (parts.length <= 1) return `<${tagName}${selfClose ? '/' : ''}>`;

    // Sort attributes for stable comparison
    const attrs = parts.slice(1).filter(a => a).sort();
    return `<${tagName} ${attrs.join(' ')}${selfClose ? '/' : ''}>`;
  }

  function renderLineDiff(diff) {
    const parts = [];
    let oldLineNum = 0, newLineNum = 0;

    for (const d of diff) {
      switch (d.type) {
        case 'eq':
          oldLineNum++;
          newLineNum++;
          parts.push(
            `<div style="display:flex;gap:8px;padding:1px 4px;border-bottom:1px solid rgba(255,255,255,0.05)">` +
            `<span style="min-width:40px;text-align:right;color:#666;user-select:none">${oldLineNum}</span>` +
            `<span style="min-width:40px;text-align:right;color:#666;user-select:none">${newLineNum}</span>` +
            `<span style="white-space:pre-wrap;flex:1;color:var(--text)">${escapeHtml(d.line)}</span></div>`
          );
          break;
        case 'del':
          oldLineNum++;
          parts.push(
            `<div style="display:flex;gap:8px;padding:1px 4px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(239,68,68,0.12)">` +
            `<span style="min-width:40px;text-align:right;color:#f87171;user-select:none">${oldLineNum}</span>` +
            `<span style="min-width:40px;text-align:right;color:#666;user-select:none"></span>` +
            `<span style="white-space:pre-wrap;flex:1;color:#f87171">- ${escapeHtml(d.line)}</span></div>`
          );
          break;
        case 'add':
          newLineNum++;
          parts.push(
            `<div style="display:flex;gap:8px;padding:1px 4px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(16,185,129,0.12)">` +
            `<span style="min-width:40px;text-align:right;color:#666;user-select:none"></span>` +
            `<span style="min-width:40px;text-align:right;color:#4ade80;user-select:none">${newLineNum}</span>` +
            `<span style="white-space:pre-wrap;flex:1;color:#4ade80">+ ${escapeHtml(d.line)}</span></div>`
          );
          break;
      }
    }
    return parts.join('');
  }

  function renderStructuredDiff(oldTokens, newTokens) {
    const diff = lcsDiff(oldTokens, newTokens);
    const parts = [];

    for (const d of diff) {
      const normalized = normalizeTag(d.line);
      switch (d.type) {
        case 'eq':
          parts.push(
            `<div style="padding:1px 8px;border-bottom:1px solid rgba(255,255,255,0.05);color:var(--text)">${escapeHtml(d.line)}</div>`
          );
          break;
        case 'del':
          parts.push(
            `<div style="padding:1px 8px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(239,68,68,0.12);color:#f87171;text-decoration:line-through">${escapeHtml(d.line)}</div>`
          );
          break;
        case 'add':
          parts.push(
            `<div style="padding:1px 8px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(16,185,129,0.12);color:#4ade80">${escapeHtml(d.line)}</div>`
          );
          break;
      }
    }
    return parts.join('');
  }

  function compare() {
    const oldText = oldInput.value;
    const newText = newInput.value;

    if (!oldText.trim()) {
      resultDiv.innerHTML = '';
      show(msg.emptyOld, 'warning');
      return;
    }
    if (!newText.trim()) {
      resultDiv.innerHTML = '';
      show(msg.emptyNew, 'warning');
      return;
    }

    const useStructured = structuredMode && structuredMode.checked;

    try {
      if (useStructured) {
        const oldTokens = tokenizeHtml(oldText);
        const newTokens = tokenizeHtml(newText);
        const diff = lcsDiff(oldTokens, newTokens);

        if (diff.every(d => d.type === 'eq')) {
          resultDiv.innerHTML = `<span style="color:var(--success);font-size:14px">${msg.identical}</span>`;
          show(msg.identical, 'success');
        } else {
          resultDiv.innerHTML = renderStructuredDiff(oldTokens, newTokens);
          show(msg.diffFound, 'info');
        }
      } else {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const diff = lcsDiff(oldLines, newLines);

        if (diff.every(d => d.type === 'eq')) {
          resultDiv.innerHTML = `<span style="color:var(--success);font-size:14px">${msg.identical}</span>`;
          show(msg.identical, 'success');
        } else {
          resultDiv.innerHTML = renderLineDiff(diff);
          show(msg.diffFound, 'info');
        }
      }
    } catch (e) {
      resultDiv.innerHTML = '';
      show(`${msg.error} ${e.message}`, 'error');
    }
  }

  // Events
  compareBtn?.addEventListener('click', compare);

  clearBtn?.addEventListener('click', () => {
    oldInput.value = '';
    newInput.value = '';
    resultDiv.innerHTML = '';
    show(msg.cleared, 'info');
  });

  // Auto-compare on input with debounce
  let debounceTimer;
  const debounceCompare = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(compare, 600);
  };
  oldInput.addEventListener('input', debounceCompare);
  newInput.addEventListener('input', debounceCompare);
  if (lineMode) lineMode.addEventListener('change', compare);
  if (structuredMode) structuredMode.addEventListener('change', compare);

  // Sample data
  oldInput.value = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Article Title</h2>
      <p>This is the original content.</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2024</p>
  </footer>
</body>
</html>`;

  newInput.value = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Updated Page</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
</head>
<body>
  <header>
    <h1>Welcome to Our Site</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Article Title</h2>
      <p>This is the <strong>updated</strong> content.</p>
      <p>Additional paragraph added.</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2025</p>
    <p>All rights reserved.</p>
  </footer>
</body>
</html>`;
})();