// INI Config Converter — INI ↔ JSON / YAML / TOML
(function () {
  'use strict';

  const input = document.getElementById('iniInput');
  const output = document.getElementById('iniOutput');
  const msg = document.getElementById('iniMsg');
  const sourceFmt = document.getElementById('iniSourceFormat');
  const targetFmt = document.getElementById('iniTargetFormat');
  const stripCb = document.getElementById('iniStripComments');
  const convertBtn = document.getElementById('iniConvertBtn');
  const swapBtn = document.getElementById('iniSwapBtn');
  const clearBtn = document.getElementById('iniClearBtn');

  function showMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? 'var(--error)' : 'var(--success)';
  }

  // ── INI Parser ──────────────────────────────────────────
  function parseINI(text, stripComments) {
    const lines = text.split('\n');
    const result = {};
    let currentSection = result;
    let sectionPath = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Empty line
      if (!line) continue;

      // Comment lines
      if (line.startsWith(';') || line.startsWith('#')) {
        if (!stripComments) {
          result['__comment_' + i] = line.replace(/^[;#]\s*/, '');
        }
        continue;
      }

      // Section
      const secMatch = line.match(/^\[([^\]]+)\]$/);
      if (secMatch) {
        sectionPath = secMatch[1].trim();
        const parts = sectionPath.split('.');
        currentSection = result;
        for (const p of parts) {
          if (!currentSection[p] || typeof currentSection[p] !== 'object') {
            currentSection[p] = {};
          }
          currentSection = currentSection[p];
        }
        continue;
      }

      // Key=Value
      const kvMatch = line.match(/^([^=]+?)\s*=\s*(.*)$/);
      if (kvMatch) {
        let key = kvMatch[1].trim();
        let val = kvMatch[2].trim();

        // Strip trailing comment (# or ;) from value
        if (stripComments) {
          val = val.replace(/\s*[;#].*$/, '').trim();
        }

        // Type inference
        if (val === '' || val === 'null') val = null;
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val) && val.includes('.')) val = parseFloat(val);
        else if (!isNaN(val) && val !== '') val = parseInt(val, 10);
        else {
          // Remove surrounding quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
        }

        currentSection[key] = val;
      }
    }

    return result;
  }

  // ── INI Stringify ────────────────────────────────────────
  function stringifyINI(obj, indent) {
    const lines = [];
    const spaces = indent === 2 ? '  ' : '    ';

    function writeSection(prefix, data) {
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith('__comment_')) {
          lines.push('; ' + val);
          continue;
        }
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          const secName = prefix ? prefix + '.' + key : key;
          lines.push('[' + secName + ']');
          writeSection(secName, val);
        } else {
          let strVal;
          if (val === null || val === undefined) strVal = '';
          else if (typeof val === 'boolean') strVal = val ? 'true' : 'false';
          else if (typeof val === 'string') {
            // Quote if contains special chars
            if (val.includes('#') || val.includes(';') || val.includes('=')) {
              strVal = '"' + val + '"';
            } else {
              strVal = val;
            }
          } else strVal = String(val);
          lines.push(key + '=' + strVal);
        }
      }
    }

    writeSection('', obj);
    return lines.join('\n');
  }

  // ── Simple YAML Stringify ──────────────────────────────
  function stringifyYAML(obj, indent) {
    const spaces = indent === 2 ? '  ' : '    ';
    const lines = [];

    function _write(val, depth) {
      const pad = spaces.repeat(depth);
      if (val === null || val === undefined) return 'null';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') {
        if (val.includes(': ') || val.includes('#') || val.includes("'") || val.includes('"')) {
          return "'" + val.replace(/'/g, "''") + "'";
        }
        return val;
      }
      if (Array.isArray(val)) {
        return val.map(v => '\n' + pad + '- ' + _write(v, depth + 1).trimStart()).join('').trimStart();
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val);
        if (entries.length === 0) return '{}';
        let out = '';
        for (const [k, v] of entries) {
          if (k.startsWith('__comment_')) {
            out += '\n' + pad + '#' + v;
          } else {
            out += '\n' + pad + k + ': ' + _write(v, depth + 1).trimStart();
          }
        }
        return out.trimStart();
      }
      return String(val);
    }

    lines.push(_write(obj, 0));
    return lines.join('\n').trimStart();
  }

  // ── Simple TOML Stringify ────────────────────────────
  function stringifyTOML(obj) {
    const lines = [];

    function _write(prefix, data) {
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith('__comment_')) {
          lines.push('#' + val);
          continue;
        }
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          const secName = prefix ? prefix + '.' + key : key;
          lines.push('[' + secName + ']');
          _write(secName, val);
        } else {
          let strVal;
          if (val === null || val === undefined) strVal = '';
          else if (typeof val === 'boolean') strVal = val ? 'true' : 'false';
          else if (typeof val === 'number') strVal = String(val);
          else if (typeof val === 'string') {
            if (val.includes('\n')) {
              strVal = '"""\n' + val + '\n"""';
            } else if (val.includes('"')) {
              strVal = "'" + val + "'";
            } else {
              strVal = '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
            }
          } else strVal = String(val);
          lines.push(key + ' = ' + strVal);
        }
      }
    }

    _write('', obj);
    return lines.join('\n');
  }

  // ── JSON/YAML/TOML to INI ────────────────────────────────
  function jsonToINI(inputText, format, strip) {
    let obj;
    try {
      if (format === 'json') {
        obj = JSON.parse(inputText);
      } else if (format === 'yaml' || format === 'toml') {
        // For YAML/TOML -> INI, we do a best-effort parse using JSON as bridge
        // First try JSON (in case it's just JSON)
        try {
          obj = JSON.parse(inputText);
        } catch {
          // Simple YAML-like parser for common cases
          obj = simpleYAMLParse(inputText);
        }
      } else {
        throw new Error('Unsupported source format');
      }
    } catch (e) {
      throw new Error('Parse error: ' + e.message);
    }
    return stringifyINI(obj, 2);
  }

  // ── Simple YAML Parser (handles common patterns) ─────────
  function simpleYAMLParse(text) {
    const result = {};
    const lines = text.split('\n');
    const stack = [{ obj: result, depth: 0, key: '' }];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trimEnd();
      if (!trimmed.trim() || trimmed.trim().startsWith('#')) continue;

      // Detect indent
      const indent = raw.search(/\S/);
      const content = trimmed.trim();

      // Array item
      if (content.startsWith('- ')) {
        const val = content.slice(2).trim();
        let parent = stack[stack.length - 1].obj;
        if (!Array.isArray(parent)) parent = [];
        // This is tricky; for simplicity, we handle top-level arrays
        continue;
      }

      // Key: value
      const colonPos = content.indexOf(':');
      if (colonPos === -1) continue;

      const key = content.slice(0, colonPos).trim();
      let val = content.slice(colonPos + 1).trim();

      // Pop stack to correct depth
      while (stack.length > 1 && indent <= stack[stack.length - 1].depth) {
        stack.pop();
      }

      let current = stack[stack.length - 1].obj;

      if (val === '' || val === 'null') {
        // New nested object
        const newObj = {};
        current[key] = newObj;
        stack.push({ obj: newObj, depth: indent, key });
      } else {
        if (val === 'true') current[key] = true;
        else if (val === 'false') current[key] = false;
        else if (!isNaN(val) && val.includes('.')) current[key] = parseFloat(val);
        else if (!isNaN(val) && val !== '') current[key] = parseInt(val, 10);
        else {
          const m = val.match(/^'(.*)'$/);
          current[key] = m ? m[1] : val;
        }
      }
    }

    return result;
  }

  // ── JSON to YAML ─────────────────────────────────────
  function jsonToYAML(inputText, format) {
    let obj;
    try {
      if (format === 'json') {
        obj = JSON.parse(inputText);
      } else if (format === 'ini') {
        obj = parseINI(inputText, false);
      } else {
        // TOML-like or fallback
        try { obj = JSON.parse(inputText); }
        catch { throw new Error('Cannot parse TOML -> YAML, try JSON path'); }
      }
    } catch (e) {
      throw new Error('Parse error: ' + e.message);
    }
    return stringifyYAML(obj, 2);
  }

  // ── JSON to TOML ─────────────────────────────────────
  function jsonToTOML(inputText, format) {
    let obj;
    try {
      if (format === 'json') {
        obj = JSON.parse(inputText);
      } else if (format === 'ini') {
        obj = parseINI(inputText, false);
      } else {
        try { obj = JSON.parse(inputText); }
        catch { throw new Error('Cannot parse source, try JSON path'); }
      }
    } catch (e) {
      throw new Error('Parse error: ' + e.message);
    }
    return stringifyTOML(obj);
  }

  // ── JSON/YAML/TOML to JSON ───────────────────────────
  function anythingToJSON(inputText, format, strip) {
    let obj;
    try {
      if (format === 'json') {
        obj = JSON.parse(inputText);
        return JSON.stringify(obj, null, 2);
      } else if (format === 'ini') {
        obj = parseINI(inputText, strip);
        return JSON.stringify(obj, null, 2);
      } else if (format === 'yaml') {
        obj = simpleYAMLParse(inputText);
        return JSON.stringify(obj, null, 2);
      } else {
        throw new Error('Unsupported format: ' + format);
      }
    } catch (e) {
      throw new Error('Parse error: ' + e.message);
    }
  }

  // ── Main Conversion ───────────────────────────────────
  function convert() {
    showMsg('');
    const text = input.value.trim();
    if (!text) {
      showMsg('Please enter source content', true);
      return;
    }

    const src = sourceFmt.value;
    const tgt = targetFmt.value;
    const strip = stripCb ? stripCb.checked : false;

    try {
      let result;

      if (tgt === 'json') {
        result = anythingToJSON(text, src, strip);
      } else if (tgt === 'ini') {
        result = jsonToINI(text, src, strip);
      } else if (tgt === 'yaml') {
        result = jsonToYAML(text, src);
      } else if (tgt === 'toml') {
        result = jsonToTOML(text, src);
      } else {
        throw new Error('Unknown target format');
      }

      output.value = result;
      showMsg('Conversion complete');
    } catch (e) {
      showMsg(e.message, true);
    }
  }

  // ── Swap formats ──────────────────────────────────────
  function swap() {
    const src = sourceFmt.value;
    const tgt = targetFmt.value;
    sourceFmt.value = tgt;
    targetFmt.value = src;
    // Also swap content
    const tmp = input.value;
    input.value = output.value;
    output.value = tmp;
    showMsg('Swapped source/target format');
  }

  // ── Clear ────────────────────────────────────────────
  function clearAll() {
    input.value = '';
    output.value = '';
    showMsg('');
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    if (convertBtn) convertBtn.addEventListener('click', convert);
    if (swapBtn) swapBtn.addEventListener('click', swap);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);

    // Set sample data
    if (input && !input.value.trim()) {
      input.value = '; Sample configuration\n[database]\nhost = localhost\nport = 5432\nname = myapp_db\n\n[server]\nhost = 0.0.0.0\nport = 8080\ndebug = true\n\n[database.pool]\nmin = 2\nmax = 10\ntimeout = 30.5';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();