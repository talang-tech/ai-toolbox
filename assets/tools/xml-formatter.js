// XML Formatter & Minifier - browser-local DOMParser validation
(() => {
  const input = document.getElementById('xmlInput');
  const output = document.getElementById('xmlOutput');
  const indentSelect = document.getElementById('xmlIndent');
  const formatBtn = document.getElementById('xmlFormat');
  const minifyBtn = document.getElementById('xmlMinify');
  const copyBtn = document.getElementById('xmlCopy');
  const clearBtn = document.getElementById('xmlClear');
  const status = document.getElementById('xmlStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output) return;

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  function indentUnit() {
    const value = indentSelect?.value || '2';
    if (value === 'tab') return '\t';
    return ' '.repeat(Number(value) || 2);
  }

  function parseXml(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      const message = parserError.textContent.replace(/\s+/g, ' ').trim();
      throw new Error(message || (isEN ? 'Invalid XML.' : 'XML 解析失败。'));
    }
    return doc;
  }

  function serializeNode(node, level, unit) {
    const pad = unit.repeat(level);
    const nextPad = unit.repeat(level + 1);

    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue.trim();
      return value ? escapeText(value) : '';
    }
    if (node.nodeType === Node.CDATA_SECTION_NODE) {
      return `${pad}<![CDATA[${node.nodeValue}]]>`;
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return `${pad}<!--${node.nodeValue.trim()}-->`;
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      return `${pad}<?${node.nodeName} ${node.nodeValue}?>`;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const attrs = [...node.attributes]
      .map(attr => `${attr.name}="${escapeAttr(attr.value)}"`)
      .join(' ');
    const open = attrs ? `<${node.nodeName} ${attrs}>` : `<${node.nodeName}>`;
    const close = `</${node.nodeName}>`;
    const children = [...node.childNodes].filter(child => !(child.nodeType === Node.TEXT_NODE && !child.nodeValue.trim()));

    if (children.length === 0) {
      return attrs ? `${pad}<${node.nodeName} ${attrs}/>` : `${pad}<${node.nodeName}/>`;
    }

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      return `${pad}${open}${escapeText(children[0].nodeValue.trim())}${close}`;
    }

    const body = children.map(child => serializeNode(child, level + 1, unit)).filter(Boolean).join('\n');
    return `${pad}${open}\n${body}\n${pad}${close}`;
  }

  function escapeText(value) {
    return value
      .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(value) {
    return escapeText(value).replace(/"/g, '&quot;');
  }

  function formatXml() {
    const text = input.value.trim();
    if (!text) {
      output.value = '';
      show(isEN ? 'Paste XML first.' : '请先粘贴 XML。', 'warning');
      return;
    }

    try {
      const doc = parseXml(text);
      const declaration = text.match(/^\s*<\?xml[^?]*\?>/i)?.[0].trim();
      const parts = [];
      if (declaration) parts.push(declaration);
      [...doc.childNodes].forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
          const rendered = serializeNode(node, 0, indentUnit());
          if (rendered && rendered !== declaration) parts.push(rendered);
        }
      });
      output.value = parts.join('\n');
      show(isEN ? 'Valid XML. Formatted locally in your browser.' : 'XML 有效。已在浏览器本地格式化。', 'success');
    } catch (err) {
      output.value = '';
      show((isEN ? 'XML parse error: ' : 'XML 解析错误：') + err.message.slice(0, 260), 'error');
    }
  }

  function minifyXml() {
    const text = input.value.trim();
    if (!text) {
      show(isEN ? 'Paste XML first.' : '请先粘贴 XML。', 'warning');
      return;
    }

    try {
      parseXml(text);
      output.value = text
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();
      show(isEN ? 'Valid XML. Minified locally.' : 'XML 有效。已本地压缩。', 'success');
    } catch (err) {
      output.value = '';
      show((isEN ? 'XML parse error: ' : 'XML 解析错误：') + err.message.slice(0, 260), 'error');
    }
  }

  formatBtn?.addEventListener('click', formatXml);
  minifyBtn?.addEventListener('click', minifyXml);
  indentSelect?.addEventListener('change', formatXml);
  copyBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value || '');
    show(isEN ? 'Copied!' : '已复制!', 'success');
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    show(isEN ? 'Cleared.' : '已清空。', 'info');
  });

  input.addEventListener('input', () => {
    if (input.value.length < 8000) formatXml();
  });
  formatXml();
})();
