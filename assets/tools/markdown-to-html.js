// Markdown to HTML Converter - browser-local Markdown rendering
(() => {
  'use strict';

  const input = document.getElementById('mthInput');
  const output = document.getElementById('mthOutput');
  const preview = document.getElementById('mthPreview');
  const convertBtn = document.getElementById('mthConvert');
  const copyBtn = document.getElementById('mthCopy');
  const downloadBtn = document.getElementById('mthDownload');
  const clearBtn = document.getElementById('mthClear');
  const safeMode = document.getElementById('mthSafeMode');
  const status = document.getElementById('mthStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !preview) return;

  const sample = `# AI Toolbox\n\nConvert **Markdown** to clean HTML locally in your browser.\n\n## Features\n\n- Headings\n- Lists\n- Links\n- Tables\n- Code blocks\n\n| Tool | Privacy |\n| --- | --- |\n| Markdown to HTML | Browser local |\n\n\`inline code\`\n\n\`\`\`js\nconsole.log('hello');\n\`\`\``;

  const t = {
    empty: isEN ? 'Paste Markdown first.' : '请先粘贴 Markdown。',
    done: isEN ? 'Converted locally in your browser.' : '已在浏览器本地转换。',
    copied: isEN ? 'HTML copied.' : 'HTML 已复制。',
    cleared: isEN ? 'Cleared.' : '已清空。',
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  }

  function inlineMarkdown(raw) {
    let text = escapeHtml(raw);
    const codes = [];
    text = text.replace(/`([^`]+)`/g, (_, code) => {
      codes.push(`<code>${code}</code>`);
      return `@@CODE${codes.length - 1}@@`;
    });
    text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) => {
      const safeUrl = escapeAttr(url);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${safeUrl}" alt="${escapeAttr(alt)}"${titleAttr}>`;
    });
    text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, label, url, title) => {
      const safeUrl = escapeAttr(url);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<a href="${safeUrl}"${titleAttr}>${label}</a>`;
    });
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    text = text.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => codes[Number(idx)] || '');
    return text;
  }

  function parseTable(lines, start) {
    const header = lines[start];
    const divider = lines[start + 1] || '';
    if (!/^\s*\|?.+\|.+\|?\s*$/.test(header) || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider)) {
      return null;
    }
    const split = line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
    const headers = split(header);
    let i = start + 2;
    const rows = [];
    while (i < lines.length && /^\s*\|?.+\|.+\|?\s*$/.test(lines[i])) {
      if (!lines[i].trim()) break;
      rows.push(split(lines[i]));
      i += 1;
    }
    let html = '<table>\n<thead><tr>' + headers.map(h => `<th>${inlineMarkdown(h)}</th>`).join('') + '</tr></thead>\n<tbody>\n';
    html += rows.map(row => '<tr>' + headers.map((_, idx) => `<td>${inlineMarkdown(row[idx] || '')}</td>`).join('') + '</tr>').join('\n');
    html += '\n</tbody>\n</table>';
    return { html, next: i };
  }

  function markdownToHtml(markdown) {
    const allowRawHtml = !safeMode.checked;
    const src = markdown.replace(/\r\n?/g, '\n');
    const lines = src.split('\n');
    const html = [];
    let i = 0;
    let inCode = false;
    let codeLang = '';
    let codeLines = [];
    let listType = null;
    let blockquote = [];
    let paragraph = [];

    function closeParagraph() {
      if (!paragraph.length) return;
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }

    function closeList() {
      if (!listType) return;
      html.push(`</${listType}>`);
      listType = null;
    }

    function closeBlockquote() {
      if (!blockquote.length) return;
      html.push(`<blockquote>\n${markdownToHtml(blockquote.join('\n'))}\n</blockquote>`);
      blockquote = [];
    }

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        if (inCode) {
          html.push(`<pre><code${codeLang ? ` class="language-${escapeAttr(codeLang)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
          inCode = false;
          codeLang = '';
          codeLines = [];
        } else {
          closeParagraph(); closeList(); closeBlockquote();
          inCode = true;
          codeLang = trimmed.slice(3).trim().split(/\s+/)[0] || '';
        }
        i += 1;
        continue;
      }
      if (inCode) {
        codeLines.push(line);
        i += 1;
        continue;
      }

      if (!trimmed) {
        closeParagraph(); closeList(); closeBlockquote();
        i += 1;
        continue;
      }

      const table = parseTable(lines, i);
      if (table) {
        closeParagraph(); closeList(); closeBlockquote();
        html.push(table.html);
        i = table.next;
        continue;
      }

      if (/^---+$|^\*\*\*+$|^___+$/.test(trimmed)) {
        closeParagraph(); closeList(); closeBlockquote();
        html.push('<hr>');
        i += 1;
        continue;
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        closeParagraph(); closeList(); closeBlockquote();
        const level = heading[1].length;
        const content = inlineMarkdown(heading[2].replace(/\s+#+$/, ''));
        html.push(`<h${level} id="${slugify(content)}">${content}</h${level}>`);
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        closeParagraph(); closeList();
        blockquote.push(line.replace(/^>\s?/, ''));
        i += 1;
        continue;
      }

      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        closeParagraph(); closeBlockquote();
        const wanted = ordered ? 'ol' : 'ul';
        if (listType !== wanted) {
          closeList();
          html.push(`<${wanted}>`);
          listType = wanted;
        }
        html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
        i += 1;
        continue;
      }

      if (allowRawHtml && /^<\/?[a-z][\s\S]*>/i.test(trimmed)) {
        closeParagraph(); closeList(); closeBlockquote();
        html.push(line);
      } else {
        paragraph.push(line);
      }
      i += 1;
    }

    if (inCode) {
      html.push(`<pre><code${codeLang ? ` class="language-${escapeAttr(codeLang)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    }
    closeParagraph(); closeList(); closeBlockquote();
    return html.join('\n');
  }

  function setStatus(message, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', warning: '#f59e0b', error: 'var(--danger)' };
    status.textContent = message;
    status.style.color = colors[type] || colors.info;
  }

  function convert() {
    if (!input.value.trim()) {
      output.value = '';
      preview.innerHTML = '';
      setStatus(t.empty, 'warning');
      return;
    }
    const html = markdownToHtml(input.value);
    output.value = html;
    preview.innerHTML = html;
    setStatus(t.done, 'success');
  }

  function downloadHtml() {
    const html = output.value || markdownToHtml(input.value || '');
    if (!html.trim()) return setStatus(t.empty, 'warning');
    const doc = `<!DOCTYPE html>\n<html lang="${isEN ? 'en' : 'zh-CN'}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Markdown Export</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  convertBtn?.addEventListener('click', convert);
  copyBtn?.addEventListener('click', async () => {
    const html = output.value || markdownToHtml(input.value || '');
    if (!html.trim()) return setStatus(t.empty, 'warning');
    await navigator.clipboard.writeText(html);
    setStatus(t.copied, 'success');
  });
  downloadBtn?.addEventListener('click', downloadHtml);
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    preview.innerHTML = '';
    setStatus(t.cleared, 'info');
  });
  safeMode?.addEventListener('change', convert);
  input.addEventListener('input', () => {
    if (input.value.length < 50000) convert();
  });

  if (!input.value.trim()) input.value = sample;
  convert();
})();
