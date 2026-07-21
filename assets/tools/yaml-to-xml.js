// YAML to XML Converter - convert YAML data to XML format locally
(() => {
  const yamlInput = document.getElementById('yaml-input');
  const xmlOutput = document.getElementById('xml-output');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const rootName = document.getElementById('root-name');
  const indentSelect = document.getElementById('indent-select');
  const status = document.getElementById('status');
  const isEN = document.documentElement.lang === 'en';

  if (!yamlInput || !xmlOutput) return;

  const msg = {
    empty: isEN ? 'Please paste YAML content first.' : '请先粘贴 YAML 内容。',
    error: isEN ? 'Error:' : '错误：',
    ok: isEN ? 'Converted to XML successfully. All processing is local.' : '已成功转换为 XML。所有处理在浏览器本地完成。',
    copied: isEN ? 'Copied!' : '已复制！',
    cleared: isEN ? 'Cleared.' : '已清空。',
    rootEmpty: isEN ? 'Root element name cannot be empty.' : '根元素名称不能为空。',
  };

  function show(text, type = 'info') {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  // ====== Minimal YAML Parser ======
  // Handles: scalars, nested objects, arrays, inline flows, comments, multi-line strings
  function parseYaml(str) {
    const lines = str.split('\n');
    // Remove BOM and normalize line endings
    const cleaned = lines.map(l => l.replace(/\r$/, ''));
    const root = {};
    const stack = [{ indent: -1, obj: root, key: null }];

    cleaned.forEach((rawLine, lineNum) => {
      // Strip comments (but not inside quoted strings)
      let line = rawLine;
      // Simple comment removal - not perfectly handling quotes
      const commentIdx = line.indexOf(' #');
      const commentIdx2 = line.indexOf('\t#');
      if (commentIdx >= 0) {
        // Check if in quotes
        const before = line.substring(0, commentIdx);
        const quotes = (before.match(/"/g) || []).length;
        if (quotes % 2 === 0) {
          line = line.substring(0, commentIdx);
        }
      } else if (commentIdx2 >= 0) {
        const before = line.substring(0, commentIdx2);
        const quotes = (before.match(/"/g) || []).length;
        if (quotes % 2 === 0) {
          line = line.substring(0, commentIdx2);
        }
      }

      const trimmed = line.trim();
      if (!trimmed) return; // Empty line

      // Calculate indent
      const indent = line.search(/\S/);
      if (indent < 0) return;

      // Array item
      if (trimmed.startsWith('- ')) {
        const valueStr = trimmed.substring(2).trim();
        const value = parseScalar(valueStr);

        // Pop stack to appropriate level
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const parent = stack[stack.length - 1].obj;
        // Find or create array in parent
        const arrKey = stack[stack.length - 1].key || 'items';
        if (!Array.isArray(parent[arrKey])) {
          parent[arrKey] = [];
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          parent[arrKey].push(value);
          // Push array item context
          const arr = parent[arrKey];
          stack.push({ indent, obj: arr[arr.length - 1], key: null });
        } else {
          parent[arrKey].push(value);
        }
        return;
      }

      // Key-value pair
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx < 0) return;

      const key = trimmed.substring(0, colonIdx).trim();
      let rest = trimmed.substring(colonIdx + 1).trim();

      // Pop stack to appropriate level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      if (rest === '' || rest === '|' || rest === '>') {
        // Nested object or multi-line string
        current[key] = {};
        stack.push({ indent, obj: current[key], key: key });
        return;
      }

      // Inline flow {}
      if (rest.startsWith('{')) {
        current[key] = parseInlineFlow(rest);
        return;
      }

      // Inline flow []
      if (rest.startsWith('[')) {
        current[key] = parseInlineArray(rest);
        return;
      }

      // Scalar value
      current[key] = parseScalar(rest);
    });

    return root;
  }

  function parseScalar(str) {
    if (!str) return null;
    // Remove surrounding quotes
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    // Booleans
    if (str === 'true' || str === 'True' || str === 'TRUE' || str === 'yes' || str === 'Yes') return true;
    if (str === 'false' || str === 'False' || str === 'FALSE' || str === 'no' || str === 'No') return false;
    // Null
    if (str === 'null' || str === 'Null' || str === 'NULL' || str === '~') return null;
    // Numbers
    const num = parseFloat(str);
    if (!isNaN(num) && str === String(num)) return num;
    if (!isNaN(num) && str === String(num).replace('.', '') && str.indexOf('.') >= 0) return num;
    return str;
  }

  function parseInlineFlow(str) {
    try {
      // Very basic inline flow parser - use JSON as intermediate
      // Convert YAML-like inline { key: value, ... } to JSON
      let jsonStr = str
        .replace(/'/g, '"')
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, (m, p1, p2) => {
          if (p1 === 'true' || p1 === 'false' || p1 === 'null') return m;
          if (!isNaN(parseFloat(p1)) && p1 === String(parseFloat(p1))) return m;
          return `:"${p1}"${p2}`;
        });
      return JSON.parse(jsonStr);
    } catch(e) {
      return { _error: 'Failed to parse inline flow: ' + str };
    }
  }

  function parseInlineArray(str) {
    try {
      let jsonStr = str
        .replace(/'/g, '"')
        .replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, (m) => {
          if (m === 'true' || m === 'false' || m === 'null') return m;
          if (!isNaN(parseFloat(m))) return m;
          return '"' + m + '"';
        });
      return JSON.parse(jsonStr);
    } catch(e) {
      return ['Failed to parse inline array'];
    }
  }

  // ====== XML Generator ======
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
    let safe = name.replace(/[^a-zA-Z0-9_\-.:]/g, '_');
    if (/^\d/.test(safe)) safe = '_' + safe;
    return safe || 'item';
  }

  function jsonToXml(obj, name, indent, indentStr, isArrayItem) {
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
          xml += jsonToXml(item, name, indent, indentStr, true);
        } else {
          xml += `${pad}<${name}>\n${indentStr.repeat(indent + 1)}${escapeXml(String(item))}\n${pad}</${name}>\n`;
        }
      }
      return xml;
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      let xml = `${pad}<${name}`;
      let hasAttributes = false;
      const attributeKeys = [];
      const childKeys = [];

      // Separate attributes (@ prefix) from child elements
      for (const key of keys) {
        if (key.startsWith('@')) {
          hasAttributes = true;
          attributeKeys.push(key);
        } else {
          childKeys.push(key);
        }
      }

      // Add attributes
      if (hasAttributes) {
        for (const key of attributeKeys) {
          const attrName = key.substring(1); // Remove @ prefix
          if (isValidXmlName(attrName)) {
            xml += ` ${attrName}="${escapeXml(String(obj[key]))}"`;
          }
        }
      }

      if (childKeys.length === 0) {
        xml += ' />\n';
        return xml;
      }

      xml += '>\n';

      for (const key of childKeys) {
        const val = obj[key];
        const elName = isValidXmlName(key) ? key : sanitizeName(key);
        xml += jsonToXml(val, elName, indent + 1, indentStr, false);
      }

      xml += `${pad}</${name}>\n`;
      return xml;
    }

    return `${pad}<${name}>${escapeXml(String(obj))}</${name}>\n`;
  }

  function convert() {
    const yamlStr = yamlInput.value;
    if (!yamlStr.trim()) {
      show(msg.empty, 'warning');
      return;
    }

    const rootNameVal = (rootName ? rootName.value.trim() : 'root') || 'root';
    const indentSize = parseInt(indentSelect ? indentSelect.value : '4');
    const indentStr = ' '.repeat(indentSize);

    try {
      const parsed = parseYaml(yamlStr);

      // Check if we got a meaningful result
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        show(msg.error + ' ' + (isEN ? 'No data found in YAML.' : 'YAML 中未找到数据。'), 'error');
        return;
      }

      // Wrap in root element
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(parsed, rootNameVal, 0, indentStr, false);
      xmlOutput.value = xml;
      show(msg.ok, 'success');
    } catch (e) {
      show(msg.error + ' ' + e.message, 'error');
    }
  }

  function copyXml() {
    if (!xmlOutput.value.trim()) {
      show(msg.empty, 'warning');
      return;
    }
    navigator.clipboard.writeText(xmlOutput.value).then(() => {
      show(msg.copied, 'success');
    }).catch(() => {
      xmlOutput.select();
      document.execCommand('copy');
      show(msg.copied, 'success');
    });
  }

  function clear() {
    yamlInput.value = '';
    xmlOutput.value = '';
    show(msg.cleared, 'info');
  }

  // Event listeners
  convertBtn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copyXml);
  clearBtn.addEventListener('click', clear);

  // Ctrl+Enter shortcut
  yamlInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      convert();
    }
  });

  // Load example on first focus
  let exampleLoaded = false;
  yamlInput.addEventListener('focus', () => {
    if (!exampleLoaded && !yamlInput.value.trim()) {
      yamlInput.value = `# User configuration
name: John Doe
age: 30
email: john@example.com
active: true
roles:
  - admin
  - editor
address:
  street: 123 Main St
  city: San Francisco
  zip: "94105"
settings:
  theme: dark
  notifications: true
`;
      exampleLoaded = true;
    }
  });

  // Auto-load example on first page load
  setTimeout(() => {
    if (!yamlInput.value.trim()) {
      yamlInput.value = `# User configuration
name: John Doe
age: 30
email: john@example.com
active: true
roles:
  - admin
  - editor
address:
  street: 123 Main St
  city: San Francisco
  zip: "94105"
settings:
  theme: dark
  notifications: true
`;
      exampleLoaded = true;
    }
  }, 100);
})();