// JSON to Python Generator
(function () {
  const input = document.getElementById('json2py-input');
  const output = document.getElementById('json2py-output');
  const btn = document.getElementById('json2py-convert');
  const copyBtn = document.getElementById('json2py-copy');
  const clearBtn = document.getElementById('json2py-clear');
  const status = document.getElementById('json2py-status');

  const useDataclass = document.getElementById('json2py-dataclass');
  const useTyping = document.getElementById('json2py-typing');
  const useSnake = document.getElementById('json2py-snake');
  const useOptional = document.getElementById('json2py-optional');

  const isEN = document.documentElement.lang === 'en';

  function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, (m, idx) => (idx === 0 ? m.toLowerCase() : '_' + m.toLowerCase()))
      .replace(/[-.\s]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^_+|_+$/g, '');
  }

  function toPascalCase(str) {
    return str.split(/[-_\s.]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  function getPythonType(value, key, typeMap, useOpt, snakeCase, rootName, allStructs) {
    if (value === null) return useOpt ? 'Optional[Any]' : 'Any';

    if (typeof value === 'string') {
      // Try to detect if it's a date/datetime
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return 'datetime';
      return 'str';
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float';
    }

    if (typeof value === 'boolean') return 'bool';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'List[Any]';
      const types = [...new Set(value.map(v => getPythonType(v, key, typeMap, useOpt, snakeCase, rootName, allStructs)))];
      // Simplify: if one type, use it; otherwise Union
      const innerType = types.length === 1 ? types[0] : 'Any';
      if (innerType.includes('[') || innerType === 'Any') {
        return `List[${innerType}]`;
      }
      return `List[${innerType}]`;
    }

    if (typeof value === 'object') {
      const structName = toPascalCase(key);
      if (!allStructs.find(s => s.name === structName)) {
        const fields = Object.entries(value).map(([k, v]) => {
          const fieldName = snakeCase ? toSnakeCase(k) : k;
          const pyType = getPythonType(v, k, typeMap, useOpt, snakeCase, structName, allStructs);
          return { name: fieldName, type: pyType, optional: useOpt && v === null, originalKey: k };
        });
        allStructs.push({ name: structName, fields });
      }
      return structName;
    }

    return 'Any';
  }

  function generatePythonCode(obj, rootName, dataclass, typing, snakeCase, useOpt) {
    const allStructs = [];
    // Collect all structs
    getPythonType(obj, rootName, {}, useOpt, snakeCase, rootName, allStructs);

    // If root is a list, generate a wrapper
    let rootType = '';
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        const itemType = getPythonType(obj[0], rootName, {}, useOpt, snakeCase, rootName, allStructs);
        rootType = `${rootName}: ${itemType}`;
      } else {
        rootType = `${rootName}: List[Any]`;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      rootType = `${rootName}: ${toPascalCase(rootName)}`;
    } else {
      rootType = `${rootName}: ${getPythonType(obj, rootName, {}, useOpt, snakeCase, rootName, allStructs)}`;
    }

    const lines = [];
    const indent = '    ';

    // Imports
    const imports = [];
    if (dataclass) {
      imports.push('from dataclasses import dataclass');
    }
    if (typing) {
      const typingItems = [];
      if (useOpt) typingItems.push('Optional');
      if (allStructs.some(s => s.fields.some(f => f.type.startsWith('List[') || f.type === 'List'))) typingItems.push('List');
      if (allStructs.some(s => s.fields.some(f => f.type === 'Any'))) typingItems.push('Any');
      if (allStructs.some(s => s.fields.some(f => f.type === 'Union'))) typingItems.push('Union');
      if (typingItems.length > 0) {
        imports.push(`from typing import ${[...new Set(typingItems)].sort().join(', ')}`);
      }
    }
    if (allStructs.some(s => s.fields.some(f => f.type === 'date' || f.type === 'datetime'))) {
      imports.push('from datetime import date, datetime');
    }

    if (imports.length > 0) {
      lines.push(...imports);
      lines.push('');
    }

    // Generate classes
    for (const struct of allStructs) {
      if (dataclass) {
        lines.push('@dataclass');
      }
      lines.push(`class ${struct.name}:`);

      if (struct.fields.length === 0) {
        lines.push(`${indent}pass`);
      } else {
        for (const field of struct.fields) {
          let pyType = field.type;
          // Map date/datetime to str if not importing datetime
          if (pyType === 'date' || pyType === 'datetime') {
            pyType = 'str';
          }
          if (field.optional && typing) {
            pyType = `Optional[${pyType}]`;
          }
          const defaultVal = field.optional ? ' = None' : '';
          lines.push(`${indent}${field.name}: ${pyType}${defaultVal}`);
        }
      }
      lines.push('');
    }

    // Add root type annotation comment
    if (lines.length > 0) {
      lines.push(`# Root type: ${rootType}`);
    }

    return lines.join('\n');
  }

  function convert() {
    if (!input || !output) return;
    const text = input.value.trim();
    if (!text) {
      output.value = '';
      if (status) status.textContent = isEN ? 'Paste JSON and click Convert' : '粘贴 JSON 后点击转换';
      return;
    }

    try {
      const obj = JSON.parse(text);
      const dataclass = useDataclass ? useDataclass.checked : true;
      const typing = useTyping ? useTyping.checked : true;
      const snakeCase = useSnake ? useSnake.checked : false;
      const useOpt = useOptional ? useOptional.checked : false;

      const rootName = 'Root';
      const code = generatePythonCode(obj, rootName, dataclass, typing, snakeCase, useOpt);
      output.value = code;

      // Count structs
      const structCount = (code.match(/^class /gm) || []).length;
      const fieldCount = (code.match(/^\s+\w+: /gm) || []).length;
      if (status) {
        status.textContent = isEN
          ? `✓ ${structCount} classes, ${fieldCount} fields`
          : `✓ ${structCount} 个类, ${fieldCount} 个字段`;
      }
    } catch (e) {
      output.value = `# Error: ${e.message}`;
      if (status) status.textContent = isEN ? `✗ Error: ${e.message}` : `✗ 错误: ${e.message}`;
    }
  }

  function copy() {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      if (status) status.textContent = isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板';
    }).catch(() => {
      if (status) status.textContent = isEN ? '✗ Copy failed' : '✗ 复制失败';
    });
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    if (status) status.textContent = '';
  }

  function loadSamples() {
    input.value = JSON.stringify({
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      isActive: true,
      tags: ["developer", "admin"],
      salary: 85000.50,
      profile: {
        avatarUrl: "https://example.com/avatar.jpg",
        bio: "Hello World",
        joinDate: "2024-01-15"
      },
      roles: [
        { roleName: "Admin", permissions: ["read", "write", "delete"] },
        { roleName: "User", permissions: ["read"] }
      ]
    }, null, 2);
  }

  if (btn) btn.addEventListener('click', convert);
  if (copyBtn) copyBtn.addEventListener('click', copy);
  if (clearBtn) clearBtn.addEventListener('click', clearAll);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { convert(); }
    });
  }

  if (useDataclass) useDataclass.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (useTyping) useTyping.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (useSnake) useSnake.addEventListener('change', () => { if (input && input.value.trim()) convert(); });
  if (useOptional) useOptional.addEventListener('change', () => { if (input && input.value.trim()) convert(); });

  // Load sample
  loadSamples();
  setTimeout(convert, 150);
})();