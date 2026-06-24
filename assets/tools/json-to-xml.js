// JSON to XML Converter - convert JSON to XML format locally
(() => {
  const jsonInput = document.getElementById('jsonInput');
  const xmlOutput = document.getElementById('xmlOutput');
  const convertBtn = document.getElementById('convertBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const indentSelect = document.getElementById('indentSelect');
  const rootName = document.getElementById('rootName');
  const status = document.getElementById('status');
  const isEN = document.documentElement.lang === 'en';

  if (!jsonInput || !xmlOutput) return;

  const msg = {
    empty: isEN ? 'Paste JSON first.' : '请先粘贴 JSON。',
    ok: isEN ? 'Converted to XML successfully. Everything runs locally in your browser.' : '已成功转换为 XML。所有处理在浏览器本地完成。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    error: isEN ? 'Error:' : '错误：',
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.innerHTML = text;
  }

  function escapeXml(str) {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
  }

  function isValidXmlName(name) {
    return /^[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-\.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/.test(name);
  }

  function sanitizeName(name) {
    // Convert JSON key to valid XML element name
    let safe = name.replace(/[^a-zA-Z0-9_\-.:]/g, '_');
    if (/^\d/.test(safe)) safe = '_' + safe;
    return safe || 'item';
  }

  function jsonToXml(obj, name, indent, indentStr) {
    if (name === undefined || name === null) name = 'root';
    if (!isValidXmlName(name)) name = sanitizeName(name);

    const pad = indentStr.repeat(indent);
    if (obj === null || obj === undefined) {
      return `${pad}<${name} />\n`;
    }
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return `${pad}<${name}>${escapeXml(String(obj))}</${name}>\n`;
    }
    if (Array.isArray(obj)) {
      let xml = '';
      for (const item of obj) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          xml += jsonToXml(item, name, indent, indentStr);
        } else {
          xml += `${pad}<${name}>\n${jsonToXml(item, null, indent + 1, indentStr).trim()}\n${pad}</${name}>\n`;
        }
      }
      return xml;
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      let xml = `${pad}<${name}>\n`;
      let hasSimpleKeys = false;
      const attributeKeys = [];

      for (const key of keys) {
        const val = obj[key];
        const elName = isValidXmlName(key) ? key : sanitizeName(key);

        if (typeof val === 'string' && key.startsWith('@')) {
          // Treat @ prefixed keys as XML attributes
          attributeKeys.push(key);
          continue;
        }

        xml += jsonToXml(val, elName, indent + 1, indentStr);
        hasSimpleKeys = true;
      }

      if (!hasSimpleKeys && keys.length === 0) {
        xml += `${pad}</${name}>\n`;
      } else {
        xml += `${pad}</${name}>\n`;
      }
      return xml;
    }
    return `${pad}<${name}>${escapeXml(String(obj))}</${name}>\n`;
  }

  function convert() {
    const text = jsonInput.value.trim();
    if (!text) {
      xmlOutput.value = '';
      show(msg.empty, 'warning');
      return;
    }

    try {
      const json = JSON.parse(text);
      const root = rootName?.value?.trim() || 'root';
      const indentCount = parseInt(indentSelect?.value || '2', 10);
      const indentStr = ' '.repeat(indentCount);

      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(json, root, 0, indentStr);
      xmlOutput.value = xml;
      show(msg.ok, 'success');
    } catch (e) {
      xmlOutput.value = '';
      show(`${msg.error} ${e.message}`, 'error');
    }
  }

  // ---- Event listeners ----
  convertBtn?.addEventListener('click', convert);

  copyBtn?.addEventListener('click', async () => {
    if (!xmlOutput.value.trim()) {
      show(isEN ? 'Nothing to copy.' : '没有可复制的内容。', 'warning');
      return;
    }
    await navigator.clipboard.writeText(xmlOutput.value);
    show(msg.copied, 'success');
  });

  clearBtn?.addEventListener('click', () => {
    jsonInput.value = '';
    xmlOutput.value = '';
    show(msg.cleared, 'info');
  });

  // Auto-convert on input
  let debounceTimer;
  jsonInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 500);
  });

  // Sample data
  jsonInput.value = JSON.stringify({
    bookstore: {
      book: [
        { "@id": "bk101", title: "XML Developer's Guide", author: "John Doe", price: 44.95 },
        { "@id": "bk102", title: "YAML for Beginners", author: "Jane Smith", price: 29.99 }
      ]
    }
  }, null, 2);

  convert();
})();