// HTML to JSX Converter
(function () {
  const input = document.getElementById('html2jsx-input');
  const output = document.getElementById('html2jsx-output');
  const btn = document.getElementById('html2jsx-convert');
  const copyBtn = document.getElementById('html2jsx-copy');
  const clearBtn = document.getElementById('html2jsx-clear');
  const status = document.getElementById('html2jsx-status');
  const frag = document.getElementById('html2jsx-fragment');
  const inline = document.getElementById('html2jsx-inline');

  const isEN = document.documentElement.lang === 'en';

  // SVG element whitelist (should self-close)
  const svgSelfClose = new Set([
    'circle','ellipse','line','path','polygon','polyline','rect','use','stop','image'
  ]);
  // Known self-closing HTML elements in JSX (must have closing tag or slash)
  const voidElements = new Set([
    'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
  ]);
  // HTML attr -> JSX prop mapping
  const attrMap = {
    autofocus:'autoFocus', autoplay:'autoPlay', charset:'charSet', class:'className',
    colspan:'colSpan', contenteditable:'contentEditable', crossorigin:'crossOrigin',
    datetime:'dateTime', defaultchecked:'defaultChecked', defaultvalue:'defaultValue',
    defer:'defer', disabled:'disabled', download:'download', draggable:'draggable',
    enctype:'encType', for:'htmlFor', formaction:'formAction', formenctype:'formEncType',
    formmethod:'formMethod', formnovalidate:'formNoValidate', formtarget:'formTarget',
    frameborder:'frameBorder', headers:'headers', height:'height', hidden:'hidden',
    high:'high', href:'href', hreflang:'hrefLang', httpEquiv:'httpEquiv',
    icon:'icon', id:'id', ismap:'isMap', keyparams:'keyParams', keytype:'keyType',
    kind:'kind', label:'label', lang:'lang', list:'list', loop:'loop', low:'low',
    manifest:'manifest', marginheight:'marginHeight', marginwidth:'marginWidth',
    max:'max', maxlength:'maxLength', media:'media', mediagroup:'mediaGroup',
    method:'method', min:'min', minlength:'minLength', multiple:'multiple',
    muted:'muted', name:'name', nonce:'nonce', novalidate:'noValidate',
    open:'open', optimum:'optimum', pattern:'pattern', placeholder:'placeholder',
    poster:'poster', preload:'preload', radiogroup:'radioGroup', readonly:'readOnly',
    rel:'rel', required:'required', role:'role', rows:'rows', rowspan:'rowSpan',
    sandbox:'sandbox', scope:'scope', scrolling:'scrolling', seamless:'seamless',
    selected:'selected', shape:'shape', size:'size', sizes:'sizes', slot:'slot',
    span:'span', spellcheck:'spellCheck', src:'src', srcdoc:'srcDoc', srclang:'srcLang',
    srcset:'srcSet', start:'start', step:'step', style:'style', summary:'summary',
    tabindex:'tabIndex', target:'target', title:'title', typemustmatch:'typeMustMatch',
    usemap:'useMap', value:'value', width:'width', wmode:'wmode', wrap:'wrap'
  };

  function escapeAttrValue(v) {
    return v.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Convert inline style string to JSX style object
  function styleStringToObject(styleStr) {
    if (!styleStr) return null;
    const props = {};
    styleStr.split(';').forEach(part => {
      const colon = part.indexOf(':');
      if (colon < 0) return;
      let key = part.slice(0, colon).trim();
      let value = part.slice(colon + 1).trim();
      if (!key || !value) return;
      // Convert kebab-case to camelCase
      key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props[key] = value;
    });
    return Object.keys(props).length ? props : null;
  }

  function styleObjectToString(styleObj) {
    const entries = Object.entries(styleObj);
    if (!entries.length) return null;
    return '{' + entries.map(([k, v]) => {
      // make sure it's quoted string value
      let valStr = JSON.stringify(String(v));
      return `${k}: ${valStr}`;
    }).join(', ') + '}';
  }

  // A regex to parse opening tags and extract attrs
  const attrRe = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

  function convertNode(node, depth) {
    const indent = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return '';
      const isOnlyWhitespace = node.parentElement && node.parentElement.children.length > 0 && !text.trim();
      if (isOnlyWhitespace) return '';
      return indent + '{`' + text.replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`}\n';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const attrs = [];
    const styleVal = node.getAttribute('style');

    // Convert class -> className (already handled), style -> object, etc.
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      let name = attr.name;
      let value = attr.value;

      // Skip internal attributes
      if (name === 'style') continue;

      // Map attribute name
      const mapped = attrMap[name] || name;
      // If name contains hyphens, camelCase it
      const jsxName = mapped;

      // If value is boolean attribute (just presence), emit just the name
      if (value === '' && voidElements.has(tag) === false) {
        // Handle like disabled={true}
        attrs.push(`${jsxName}={true}`);
        continue;
      }

      // Normal string attribute
      attrs.push(`${jsxName}="${escapeAttrValue(value)}"`);
    }

    // Handle style
    if (styleVal) {
      const styleObj = styleStringToObject(styleVal);
      if (styleObj) {
        attrs.push(`style={${styleObjectToString(styleObj).slice(1, -1)}}`);
      }
    }

    const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

    // Self-closing tags
    if (voidElements.has(tag) || svgSelfClose.has(tag)) {
      if (tag === 'svg') {
        // SVG needs explicit closing tag in JSX for inner elements
      } else {
        // Build children text for self-closing
        return `${indent}<${tag}${attrStr} />\n`;
      }
    }

    // Children
    const children = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const childHtml = convertNode(node.childNodes[i], depth + 1);
      if (childHtml) children.push(childHtml);
    }

    const childrenStr = children.join('');
    if (!childrenStr.trim()) {
      return `${indent}<${tag}${attrStr} />\n`;
    }

    // If only a single text child, inline it
    if (children.length === 1 && node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        return `${indent}<${tag}${attrStr}>${text}</${tag}>\n`;
      }
    }

    return `${indent}<${tag}${attrStr}>\n${childrenStr}${indent}</${tag}>\n`;
  }

  function convert() {
    if (!input || !output) return;
    const html = input.value.trim();
    if (!html) {
      output.value = isEN ? '// Paste HTML above and click Convert' : '// 在上方粘贴 HTML 后点击转换';
      status.textContent = isEN ? 'Awaiting input...' : '等待输入...';
      return;
    }

    try {
      // Parse HTML using DOMParser
      const parser = new DOMParser();
      let doc;
      if (frag && frag.checked) {
        doc = parser.parseFromString('<html><head></head><body>' + html + '</body></html>', 'text/html');
      } else {
        doc = parser.parseFromString(html, 'text/html');
      }

      // Get body children or whole document depending on fragment
      const container = frag && frag.checked ? doc.body : doc.documentElement;
      let children;
      if (frag && frag.checked) {
        children = doc.body.childNodes;
      } else {
        children = doc.documentElement.childNodes;
      }

      let result = '';
      let fragmentWrapper = frag && frag.checked;

      // Process children
      for (let i = 0; i < children.length; i++) {
        result += convertNode(children[i], 0);
      }

      // Handle fragment wrapping
      if (fragmentWrapper) {
        if (result.trim()) {
          // Check if multiple root elements
          const nonEmptyLines = result.split('\n').filter(l => l.trim()).length;
          const rootElements = result.trim().split('\n').filter(l => l.startsWith('<') && !l.startsWith('  '));
          if (rootElements.length > 1) {
            result = '<>\n' + result + '</>\n';
          }
        }
      }

      if (inline && inline.checked && result.trim()) {
        // Remove indent for in-line rendering
        result = result.replace(/^\s+/gm, '').replace(/\n+/g, '\n').trim();
      }

      if (!result.trim()) {
        output.value = isEN ? '// No valid HTML elements found' : '// 未找到有效的 HTML 元素';
        status.textContent = isEN ? 'No valid HTML' : '无有效 HTML';
        return;
      }

      output.value = result;
      const lineCount = result.split('\n').filter(l => l.trim()).length;
      status.textContent = isEN ? `✓ Converted — ${lineCount} lines` : `✓ 转换完成 — ${lineCount} 行`;
    } catch (e) {
      output.value = `// Error: ${e.message}`;
      status.textContent = isEN ? '✗ Conversion failed' : '✗ 转换失败';
    }
  }

  function copy() {
    if (!output.value || output.value.startsWith('//')) return;
    navigator.clipboard.writeText(output.value).then(() => {
      status.textContent = isEN ? '✓ Copied to clipboard' : '✓ 已复制到剪贴板';
    }).catch(() => {
      status.textContent = isEN ? '✗ Copy failed' : '✗ 复制失败';
    });
  }

  function clearAll() {
    input.value = '';
    output.value = isEN ? '// Paste HTML above and click Convert' : '// 在上方粘贴 HTML 后点击转换';
    status.textContent = '';
  }

  // Sample data
  function loadSample() {
    input.value = `<div class="container">
  <h1 id="title">Hello World</h1>
  <p style="color: #333; font-size: 14px;">This is a <strong>paragraph</strong> with a <a href="https://example.com">link</a>.</p>
  <img src="logo.png" alt="Logo" />
  <input type="text" placeholder="Enter name" disabled />
  <ul class="list">
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>`;
  }

  btn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copy);
  clearBtn.addEventListener('click', clearAll);

  // Keyboard shortcut
  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { convert(); }
  });

  // Load sample on first visit
  loadSample();
  setTimeout(convert, 100);
})();