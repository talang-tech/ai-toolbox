// XML to JSON Converter - parse XML to JSON locally
(function () {
  const input = document.getElementById('xml2jsonInput');
  const output = document.getElementById('xml2jsonOutput');
  const convertBtn = document.getElementById('xml2jsonConvert');
  const copyBtn = document.getElementById('xml2jsonCopy');
  const clearBtn = document.getElementById('xml2jsonClear');
  const indentSelect = document.getElementById('xml2jsonIndent');
  const attrPrefixCheckbox = document.getElementById('xml2jsonAttrPrefix');
  const status = document.getElementById('xml2jsonStatus');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output) return;

  const msg = {
    empty: isEN ? 'Paste XML first.' : '请先粘贴 XML。',
    ok: isEN ? 'Converted to JSON successfully. All processing is local.' : '已成功转换为 JSON。所有处理在浏览器本地完成。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    error: isEN ? 'Error:' : '错误：',
  };

  function show(text, type) {
    if (!status) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b' };
    status.style.color = colors[type] || colors.info;
    status.textContent = text;
  }

  // Simple XML parser - turns XML string into a nested object
  function parseXml(xmlStr) {
    // Remove XML declaration
    xmlStr = xmlStr.replace(/^<\?xml[^>]*\?>\s*/i, '').trim();

    // Tokenize: match opening tag, closing tag, self-closing tag, text content
    const tokens = [];
    const tagRegex = /<\/?[^>]+>|[^<]+/g;
    let match;
    while ((match = tagRegex.exec(xmlStr)) !== null) {
      tokens.push(match[0]);
    }

    return parseTokens(tokens, 0).node;
  }

  function parseTokens(tokens, start) {
    const result = { _text: '', _children: {} };

    let i = start;
    while (i < tokens.length) {
      const token = tokens[i].trim();

      // Text content
      if (!token.startsWith('<')) {
        const text = token.trim();
        if (text) result._text += text;
        i++;
        continue;
      }

      // Closing tag
      if (token.startsWith('</')) {
        break;
      }

      // Self-closing tag
      if (token.endsWith('/>')) {
        const name = token.slice(1, -2).split(/\s+/)[0];
        const attrs = parseAttributes(token);
        const child = { ...attrs, _text: '' };
        if (!result._children[name]) result._children[name] = [];
        result._children[name].push(child);
        i++;
        continue;
      }

      // Opening tag
      if (token.startsWith('<') && !token.startsWith('</')) {
        const tagContent = token.slice(1, -1).trim();
        const spaceIdx = tagContent.indexOf(' ');
        const name = spaceIdx > 0 ? tagContent.slice(0, spaceIdx) : tagContent;
        const attrs = parseAttributes(token);

        const childResult = parseTokens(tokens, i + 1);
        const childNodes = childResult.node;
        i = childResult.nextIndex;

        // Skip closing tag
        if (i < tokens.length && tokens[i].trim().startsWith('</')) {
          i++;
        }

        // Combine attributes and content
        const merged = { ...attrs };

        // Handle child elements and text
        const childKeys = Object.keys(childNodes._children);
        if (childKeys.length > 0) {
          for (const key of childKeys) {
            if (childNodes._children[key].length === 1) {
              merged[key] = childNodes._children[key][0];
            } else {
              merged[key] = childNodes._children[key];
            }
          }
        }

        const text = childNodes._text.trim();
        if (text) {
          if (childKeys.length === 0) {
            // Try to parse as number
            merged._text = isNaN(text) ? text : (text.includes('.') ? parseFloat(text) : parseInt(text, 10));
          } else {
            merged._text = text;
          }
        }

        // Clean up empty _text
        if (merged._text === '' || merged._text === undefined) {
          delete merged._text;
        }

        if (!result._children[name]) result._children[name] = [];
        result._children[name].push(merged);
        continue;
      }

      i++;
    }

    return { node: result, nextIndex: i };
  }

  function parseAttributes(token) {
    const attrs = {};
    const attrRegex = /(\S+)\s*=\s*"([^"]*)"|(\S+)\s*=\s*'([^']*)'/g;
    let match;
    while ((match = attrRegex.exec(token)) !== null) {
      const key = match[1] || match[3];
      const val = match[2] || match[4];
      attrs['@' + key] = val;
    }
    return attrs;
  }

  function cleanObject(obj, useAttrPrefix) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => cleanObject(item, useAttrPrefix));

    const clean = {};
    const keys = Object.keys(obj);

    // Detect if this is a _children-style object
    if (obj._children) {
      // Recurse into children
      for (const key of Object.keys(obj._children)) {
        const children = obj._children[key];
        if (children.length === 0) continue;
        if (children.length === 1 && typeof children[0] === 'object' && !Array.isArray(children[0])) {
          const cleaned = cleanObject(children[0], useAttrPrefix);
          if (cleaned !== null && Object.keys(cleaned).length > 0) {
            clean[key] = cleaned;
          } else if (children[0]._text !== undefined && children[0]._text !== '') {
            clean[key] = children[0]._text;
          }
        } else {
          const cleanedAr = children.map(c => {
            const cleaned = cleanObject(c, useAttrPrefix);
            if (cleaned && typeof cleaned === 'object' && Object.keys(cleaned).length === 1 && cleaned._text !== undefined) {
              return cleaned._text;
            }
            return cleaned;
          }).filter(c => c !== null && c !== undefined && (typeof c !== 'object' || Object.keys(c).length > 0));
          if (cleanedAr.length > 0) {
            clean[key] = cleanedAr;
          }
        }
      }

      // Handle text
      if (obj._text && typeof obj._text === 'string') {
        const trimmed = obj._text.trim();
        if (trimmed) {
          if (Object.keys(clean).length === 0) {
            return isNaN(trimmed) ? trimmed : (trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10));
          }
          clean['#text'] = trimmed;
        }
      }
      return Object.keys(clean).length > 0 ? clean : null;
    }

    // Regular object
    for (const key of keys) {
      let val = obj[key];
      if (key === '_text') {
        if (val !== undefined && val !== '') {
          const trimmed = typeof val === 'string' ? val.trim() : String(val);
          if (trimmed) {
            const hasNonTextKeys = keys.some(k => k !== '_text');
            clean[hasNonTextKeys ? '#text' : '_text'] = isNaN(trimmed) ? trimmed : (trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10));
          }
        }
        continue;
      }
      if (key.startsWith('@') && !useAttrPrefix) {
        clean[key.slice(1)] = val;
      } else {
        clean[key] = (typeof val === 'object' && val !== null) ? cleanObject(val, useAttrPrefix) : val;
      }
    }
    return clean;
  }

  function convert() {
    const text = input.value.trim();
    if (!text) {
      output.value = '';
      show(msg.empty, 'warning');
      return;
    }

    try {
      const parsed = parseXml(text);
      const useAttrPrefix = attrPrefixCheckbox ? attrPrefixCheckbox.checked : true;

      // Extract root element
      let rootObj = null;
      if (parsed._children) {
        const rootKeys = Object.keys(parsed._children);
        if (rootKeys.length === 1) {
          const kids = parsed._children[rootKeys[0]];
          if (kids.length === 1) {
            rootObj = cleanObject(kids[0], useAttrPrefix);
          } else if (kids.length > 1) {
            rootObj = { [rootKeys[0]]: kids.map(k => cleanObject(k, useAttrPrefix)) };
          }
        } else if (rootKeys.length > 1) {
          rootObj = {};
          for (const key of rootKeys) {
            const kids = parsed._children[key];
            rootObj[key] = kids.length === 1 ? cleanObject(kids[0], useAttrPrefix) : kids.map(k => cleanObject(k, useAttrPrefix));
          }
        }
      }

      if (!rootObj) {
        output.value = '{}';
        show(isEN ? 'No XML content parsed.' : '没有解析到 XML 内容。', 'warning');
        return;
      }

      const indent = indentSelect ? indentSelect.value : '2';
      const indentVal = indent ? parseInt(indent, 10) : undefined;
      const jsonStr = JSON.stringify(rootObj, null, indentVal);

      output.value = jsonStr;
      show(msg.ok, 'success');
    } catch (e) {
      output.value = '';
      show(`${msg.error} ${e.message}`, 'error');
    }
  }

  // Events
  convertBtn?.addEventListener('click', convert);

  copyBtn?.addEventListener('click', async () => {
    if (!output.value.trim()) {
      show(isEN ? 'Nothing to copy.' : '没有可复制的内容。', 'warning');
      return;
    }
    await navigator.clipboard.writeText(output.value);
    show(msg.copied, 'success');
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    show(msg.cleared, 'info');
  });

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 500);
  });

  // Sample data
  input.value = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price currency="USD">12.99</price>
  </book>
  <book category="nonfiction">
    <title lang="en">Sapiens</title>
    <author>Yuval Noah Harari</author>
    <year>2011</year>
    <price currency="USD">18.99</price>
  </book>
</bookstore>`;

  convert();
})();