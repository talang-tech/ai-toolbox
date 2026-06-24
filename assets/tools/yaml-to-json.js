// YAML to JSON Converter - convert YAML config to JSON format locally
(() => {
  const yamlInput = document.getElementById('yamlInput');
  const jsonOutput = document.getElementById('jsonOutput');
  const convertBtn = document.getElementById('convertBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const status = document.getElementById('status');
  const isEN = document.documentElement.lang === 'en';

  if (!yamlInput || !jsonOutput) return;

  const msg = {
    empty: isEN ? 'Paste YAML first.' : '请先粘贴 YAML。',
    ok: isEN ? 'Converted to JSON successfully. Everything runs locally in your browser.' : '已成功转换为 JSON。所有处理在浏览器本地完成。',
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

  // ---- Lightweight YAML parser (handles common config files) ----
  // Works for: Docker Compose, K8s, GitHub Actions, CI/CD configs
  // Does NOT support full YAML 1.2 spec (anchors, tags, complex types)

  function parseYaml(text) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const result = {};
    const stack = [{ indent: -1, obj: result, key: null }];

    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }

      // Compute indent
      const indentMatch = raw.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].length : 0;

      // Pop stack until we find the right parent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];

      // --- List item (starts with -) ---
      const listMatch = trimmed.match(/^-\s+(.*)$/);
      if (listMatch) {
        const val = parseScalar(listMatch[1].trim());

        // If parent is not an array, convert
        if (parent.obj && !Array.isArray(parent.obj)) {
          // This happens if list items are mixed; treat as error
          show(isEN ? `Line ${i+1}: Unexpected list item in object context.` : `第 ${i+1} 行：在对象上下文中意外出现列表项。`, 'error');
          i++;
          continue;
        }

        // Ensure parent is an array
        if (!Array.isArray(parent.obj)) {
          // Replace parent obj with array
          const newArr = [];
          if (parent.key !== null) {
            // Set parent's containing object
            const grandparent = stack[stack.length - 2];
            if (grandparent && grandparent.obj) {
              if (Array.isArray(grandparent.obj)) {
                // replace last element
                grandparent.obj[grandparent.obj.length - 1] = newArr;
              } else {
                grandparent.obj[parent.key] = newArr;
              }
            }
          }
          parent.obj = newArr;
        }

        // Check if value is a complex object (has children on next lines)
        const nextLine = lines[i + 1];
        const nextIndent = nextLine ? (nextLine.match(/^\s*/)?.[0]?.length || 0) : 0;
        const hasChildren = nextLine && nextLine.trim() && !nextLine.trim().startsWith('#') && nextIndent > indent;

        if (hasChildren) {
          const childObj = {};
          parent.obj.push(childObj);
          stack.push({ indent: indent + 1, obj: childObj, key: null });
        } else {
          parent.obj.push(val);
        }

        i++;
        continue;
      }

      // --- Key: value pair ---
      const kvMatch = trimmed.match(/^([^:#\s][^:]*?)\s*:\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim().replace(/^['"]|['"]$/g, '');
        const valueStr = kvMatch[2].trim();

        let currentObj = parent.obj;
        // If parent is an array, add a new object
        if (Array.isArray(currentObj)) {
          const newObj = {};
          currentObj.push(newObj);
          stack.push({ indent: indent, obj: newObj, key: null });
          currentObj = newObj;
        }

        if (!valueStr || valueStr === '') {
          // Value is empty - could be nested object or null
          const nextLine = lines[i + 1];
          const nextIndent = nextLine ? (nextLine.match(/^\s*/)?.[0]?.length || 0) : 0;
          if (nextLine && nextLine.trim() && !nextLine.trim().startsWith('#') && nextIndent > indent) {
            // Has children -> nested object
            const childObj = {};
            currentObj[key] = childObj;
            stack.push({ indent: indent + 1, obj: childObj, key: null });
          } else {
            currentObj[key] = null;
          }
        } else if (valueStr === '|' || valueStr === '|-' || valueStr === '>' || valueStr === '>-') {
          // Block scalar indicator - collect subsequent lines
          let blockLines = [];
          i++;
          while (i < lines.length) {
            const bLine = lines[i];
            const bIndent = (bLine.match(/^\s*/)?.[0]?.length || 0);
            if (!bLine.trim() || bIndent > indent) {
              blockLines.push(bLine.replace(new RegExp(`^\\s{${indent+2}}`), ''));
            } else {
              i--;
              break;
            }
            i++;
          }
          let blockStr = blockLines.join('\n').trim();
          if (valueStr.startsWith('|')) blockStr = blockLines.join('\n');  // preserve newlines
          if (blockStr.endsWith('\n')) blockStr = blockStr.slice(0, -1);
          if (valueStr.startsWith('>')) blockStr = blockStr.replace(/\n+/g, ' ');  // fold
          currentObj[key] = blockStr;
        } else {
          currentObj[key] = parseScalar(valueStr);
        }

        i++;
        continue;
      }

      // --- Plain scalar (unquoted string) ---
      if (trimmed.match(/^[\w.@/+\-]+$/)) {
        if (Array.isArray(parent.obj)) {
          parent.obj.push(parseScalar(trimmed));
        } else {
          show(isEN ? `Line ${i+1}: Expected key:value pair, got "${trimmed}".` : `第 ${i+1} 行：需要 key:value 格式，得到 "${trimmed}"。`, 'warning');
        }
        i++;
        continue;
      }

      i++;
    }

    return result;
  }

  function parseScalar(str) {
    if (str === 'null' || str === '~') return null;
    if (str === 'true' || str === 'True' || str === 'TRUE') return true;
    if (str === 'false' || str === 'False' || str === 'FALSE') return false;
    if (str === '') return null;

    // Number
    const num = Number(str);
    if (!isNaN(num) && str.trim() !== '' && !/^0[0-7]/.test(str)) return num;

    // Quoted string
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }

    return str;
  }

  function convert() {
    const text = yamlInput.value.replace(/\r\n?/g, '\n');
    if (!text.trim()) {
      jsonOutput.value = '';
      show(msg.empty, 'warning');
      return;
    }

    try {
      const json = parseYaml(text);
      jsonOutput.value = JSON.stringify(json, null, 2);
      show(msg.ok, 'success');
    } catch (e) {
      jsonOutput.value = '';
      show(`${msg.error} ${e.message}`, 'error');
    }
  }

  // ---- Event listeners ----
  convertBtn?.addEventListener('click', convert);

  copyBtn?.addEventListener('click', async () => {
    if (!jsonOutput.value.trim()) {
      show(isEN ? 'Nothing to copy.' : '没有可复制的内容。', 'warning');
      return;
    }
    await navigator.clipboard.writeText(jsonOutput.value);
    show(msg.copied, 'success');
  });

  clearBtn?.addEventListener('click', () => {
    yamlInput.value = '';
    jsonOutput.value = '';
    show(msg.cleared, 'info');
  });

  // Auto-convert on input (debounced)
  let debounceTimer;
  yamlInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 500);
  });

  // Initial sample
  yamlInput.value = `name: ai-toolbox
version: "1.0"
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
      LOG_LEVEL: debug
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data`;

  convert();
})();