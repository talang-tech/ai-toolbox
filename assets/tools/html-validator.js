// HTML Validator - browser-local HTML syntax checker
(() => {
  const input = document.getElementById('hv-input');
  const output = document.getElementById('hv-output');
  const validate = document.getElementById('hv-validate');
  const copy = document.getElementById('hv-copy');
  const clear = document.getElementById('hv-clear');
  const msg = document.getElementById('hv-msg');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !validate) return;

  const T = (zh, en) => isEN ? en : zh;

  function countLines(code, pos) {
    return code.substring(0, pos).split('\n').length;
  }

  const SELF_CLOSING = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  const KNOWN_TAGS = new Set([
    'a','abbr','address','area','article','aside','audio','b','base','bdi','bdo',
    'blockquote','body','br','button','canvas','caption','cite','code','col','colgroup',
    'data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed',
    'fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6',
    'head','header','hgroup','hr','html','i','iframe','img','input','ins','kbd',
    'label','legend','li','link','main','map','mark','menu','meta','meter','nav',
    'noscript','object','ol','optgroup','option','output','p','picture','portal','pre',
    'progress','q','rp','rt','ruby','s','samp','script','section','select','slot',
    'small','source','span','strong','style','sub','summary','sup','table','tbody',
    'td','template','textarea','tfoot','th','thead','time','title','tr','track','u',
    'ul','var','video','wbr'
  ]);

  const OPTIONAL_END = new Set(['html','head','body','li','dt','dd','p','rt','rp',
    'optgroup','option','colgroup','caption','thead','tbody','tfoot','tr','td','th']);

  function validateHTML(code) {
    const errors = [];
    const warnings = [];

    if (!code.trim()) {
      return { errors: [], warnings: [] };
    }

    // Check 1: Parse tags and check nesting
    const tagStack = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
    let match;

    while ((match = tagRegex.exec(code)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      const line = countLines(code, match.index);

      if (fullTag.startsWith('</')) {
        if (tagStack.length === 0) {
          errors.push({ line: line, msg: T('多余的闭合标签: </' + tagName + '>', 'Unexpected closing tag: </' + tagName + '>'), severity: 'error' });
          continue;
        }
        const lastOpen = tagStack[tagStack.length - 1];
        if (lastOpen.tag === tagName) {
          tagStack.pop();
        } else {
          let found = -1;
          for (let i = tagStack.length - 1; i >= 0; i--) {
            if (tagStack[i].tag === tagName) { found = i; break; }
          }
          if (found >= 0) {
            for (let i = tagStack.length - 1; i >= found; i--) {
              errors.push({ line: line, msg: T('未闭合的标签: <' + tagStack[i].tag + '>（在 </' + tagName + '> 处）', 'Unclosed tag: <' + tagStack[i].tag + '> (at </' + tagName + '>)'), severity: 'error' });
              tagStack.pop();
            }
          } else {
            errors.push({ line: line, msg: T('标签不匹配: 期望 </' + lastOpen.tag + '>, 实际 </' + tagName + '>', 'Tag mismatch: expected </' + lastOpen.tag + '>, got </' + tagName + '>'), severity: 'error' });
          }
        }
      } else {
        const isSelfClosing = fullTag.endsWith('/>') || SELF_CLOSING.has(tagName);
        if (!KNOWN_TAGS.has(tagName) && !tagName.startsWith('_')) {
          warnings.push({ line: line, msg: T('未知的 HTML 标签: <' + tagName + '>', 'Unknown HTML tag: <' + tagName + '>'), severity: 'info' });
        }
        if (!isSelfClosing) {
          tagStack.push({ tag: tagName, line: line });
        }
      }
    }

    tagStack.forEach(function(t) {
      if (!OPTIONAL_END.has(t.tag)) {
        errors.push({ line: t.line, msg: T('未闭合的标签: <' + t.tag + '>', 'Unclosed tag: <' + t.tag + '>'), severity: 'error' });
      }
    });

    // Check 2: Duplicate IDs
    var idRegex = /\sid\s*=\s*["']([^"']+)["']/gi;
    var ids = [];
    while ((match = idRegex.exec(code)) !== null) {
      ids.push({ id: match[1], line: countLines(code, match.index) });
    }
    var seenIds = new Set();
    ids.forEach(function(item) {
      if (seenIds.has(item.id)) {
        errors.push({ line: item.line, msg: T('重复的 ID: "' + item.id + '"', 'Duplicate ID: "' + item.id + '"'), severity: 'error' });
      }
      seenIds.add(item.id);
    });

    // Check 3: Deprecated tags
    var deprecatedTags = ['center','font','big','strike','tt','frame','frameset','noframes','acronym','applet','basefont','dir','isindex','listing','nextid','noembed','plaintext','xmp','spacer','blink','marquee','bgsound','multicol','nobr'];
    deprecatedTags.forEach(function(tag) {
      var depRegex = new RegExp('<' + tag + '\\b', 'gi');
      while ((match = depRegex.exec(code)) !== null) {
        warnings.push({ line: countLines(code, match.index), msg: T('已弃用的标签: <' + tag + '>（建议使用现代替代）', 'Deprecated tag: <' + tag + '> (use modern alternative)'), severity: 'warning' });
      }
    });

    // Check 4: Deprecated attributes
    var deprecatedAttrs = ['align','bgcolor','border','cellpadding','cellspacing','width','height','valign','hspace','vspace','clear','noshade','nowrap','size','type','compact','start'];
    deprecatedAttrs.forEach(function(attr) {
      var attrRegex = new RegExp('\\s' + attr + '\\s*=\\s*["\']', 'gi');
      while ((match = attrRegex.exec(code)) !== null) {
        warnings.push({ line: countLines(code, match.index), msg: T('已弃用的属性: ' + attr + '（建议使用 CSS 替代）', 'Deprecated attribute: ' + attr + ' (use CSS instead)'), severity: 'warning' });
      }
    });

    // Check 5: Inline event handlers
    var eventHandlers = ['onclick','onload','onchange','onsubmit','onmouseover','onmouseout','onkeydown','onkeyup','onfocus','onblur','onscroll','onerror','onresize','oninput','onbeforeunload','onunload','oncontextmenu','ondblclick','onmousedown','onmouseup','onmousemove','onmouseenter','onmouseleave','ontouchstart','ontouchend','ontouchmove','ontouchcancel','onanimationend','onanimationstart','onwheel','oncopy','oncut','onpaste'];
    eventHandlers.forEach(function(handler) {
      var hRegex = new RegExp('\\s' + handler + '\\s*=\\s*["\']', 'gi');
      while ((match = hRegex.exec(code)) !== null) {
        warnings.push({ line: countLines(code, match.index), msg: T('内联事件处理器: ' + handler + '（建议使用 addEventListener）', 'Inline event handler: ' + handler + ' (use addEventListener instead)'), severity: 'info' });
      }
    });

    // Check 6: Missing alt on images
    var imgRegex = /<img\b[^>]*>/gi;
    while ((match = imgRegex.exec(code)) !== null) {
      if (!/alt\s*=/i.test(match[0])) {
        warnings.push({ line: countLines(code, match.index), msg: T('img 标签缺少 alt 属性（影响可访问性）', 'img tag missing alt attribute (accessibility issue)'), severity: 'warning' });
      }
    }

    // Check 7: Missing lang on html
    var htmlMatch = /<html\b[^>]*>/i.exec(code);
    if (htmlMatch && !/lang\s*=/i.test(htmlMatch[0])) {
      warnings.push({ line: countLines(code, htmlMatch.index), msg: T('html 标签缺少 lang 属性', 'html tag missing lang attribute'), severity: 'warning' });
    }

    // Check 8: Missing charset meta
    if (!/<meta[^>]*charset\s*=/i.test(code)) {
      warnings.push({ line: 1, msg: T('缺少字符集声明 <meta charset="...">', 'Missing charset declaration <meta charset="...">'), severity: 'warning' });
    }

    // Check 9: Missing viewport meta
    if (!/<meta[^>]*name\s*=\s*["']viewport["']/i.test(code)) {
      warnings.push({ line: 1, msg: T('缺少 viewport meta 标签', 'Missing viewport meta tag'), severity: 'info' });
    }

    // Check 10: Missing title
    if (!/<title>[\s\S]*?<\/title>/i.test(code)) {
      warnings.push({ line: 1, msg: T('缺少 <title> 标签', 'Missing <title> tag'), severity: 'warning' });
    }

    // Check 11: DOCTYPE at top
    var trimmed = code.trim().toLowerCase();
    if (!trimmed.startsWith('<!doctype html>') && !trimmed.startsWith('<!doctype')) {
      warnings.push({ line: 1, msg: T('缺少 DOCTYPE 声明，建议以 <!DOCTYPE html> 开头', 'Missing DOCTYPE declaration, should start with <!DOCTYPE html>'), severity: 'warning' });
    }

    // Check 12: Empty href/src
    var emptyHref = /\s(href|src)\s*=\s*["']\s*["']/gi;
    while ((match = emptyHref.exec(code)) !== null) {
      warnings.push({ line: countLines(code, match.index), msg: T('空的 ' + match[1] + ' 属性', 'Empty ' + match[1] + ' attribute'), severity: 'warning' });
    }

    // Check 13: Unquoted attribute values
    var unquoted = /=\s*([a-zA-Z_][a-zA-Z0-9._-]*)(?:\s|>)/g;
    while ((match = unquoted.exec(code)) !== null) {
      if (!/^\s*$/.test(match[1])) {
        warnings.push({ line: countLines(code, match.index), msg: T('属性值未使用引号: ' + match[1], 'Attribute value not quoted: ' + match[1]), severity: 'info' });
      }
    }

    // Check 14: label without for or wrapped input
    var labelRegex = /<label\b[^>]*>/gi;
    while ((match = labelRegex.exec(code)) !== null) {
      if (!/for\s*=/i.test(match[0])) {
        var closeIdx = code.indexOf('</label>', match.index);
        var content = closeIdx > 0 ? code.substring(match.index, closeIdx) : '';
        if (!/<input\b|<select\b|<textarea\b/i.test(content)) {
          warnings.push({ line: countLines(code, match.index), msg: T('label 缺少 for 属性且未包裹表单控件', 'label missing for attribute and not wrapping a form control'), severity: 'info' });
        }
      }
    }

    // Check 15: Self-closing non-void elements (exclude SVG/MathML)
    var nonVoid = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/>/g;
    var svgMathTags = new Set(['svg','math','circle','rect','path','line','polygon','polyline','ellipse','text','g','defs','stop','linearGradient','radialGradient','use','foreignObject','animate','animateTransform','set','clipPath','mask','pattern','marker','filter','feGaussianBlur','feOffset','feMerge','feMergeNode','feColorMatrix','feBlend','feComposite','feFlood','feTurbulence','feDisplacementMap','feDropShadow','mpath','discard','hatch','hatchpath','mesh','meshgradient','meshpatch','meshrow','solidcolor','metadata']);
    while ((match = nonVoid.exec(code)) !== null) {
      var tag = match[1].toLowerCase();
      if (!SELF_CLOSING.has(tag) && !svgMathTags.has(tag)) {
        warnings.push({ line: countLines(code, match.index), msg: T('非空元素自闭合: <' + tag + ' />（应使用 <' + tag + '></' + tag + '>）', 'Non-void element self-closing: <' + tag + ' /> (use <' + tag + '></' + tag + '>)'), severity: 'info' });
      }
    }

    return { errors: errors, warnings: warnings };
  }

  function generateReport(errors, warnings) {
    if (errors.length === 0 && warnings.length === 0) {
      return T('✅ HTML 验证通过，未发现错误或警告！', '✅ HTML validation passed, no errors or warnings!');
    }
    var r = '';
    if (errors.length > 0) {
      r += T('❌ 错误 (' + errors.length + ')\n', '❌ Errors (' + errors.length + ')\n');
      r += '──────────────────────\n';
      errors.forEach(function(e) { r += '  Line ' + e.line + ': ' + e.msg + '\n'; });
      r += '\n';
    }
    if (warnings.length > 0) {
      r += T('⚠️ 警告 (' + warnings.length + ')\n', '⚠️ Warnings (' + warnings.length + ')\n');
      r += '──────────────────────\n';
      warnings.forEach(function(w) { r += '  Line ' + w.line + ': ' + w.msg + '\n'; });
    }
    r += T('\n📊 总计: ' + errors.length + ' 个错误, ' + warnings.length + ' 个警告', '\n📊 Total: ' + errors.length + ' errors, ' + warnings.length + ' warnings');
    return r;
  }

  function handleValidate() {
    var code = input.value;
    if (!code.trim()) {
      output.value = T('请输入 HTML 代码后点击验证', 'Enter HTML code and click Validate');
      if (msg) { msg.textContent = T('请输入 HTML 代码', 'Please enter HTML code'); msg.style.color = '#f59e0b'; }
      return;
    }
    var result = validateHTML(code);
    output.value = generateReport(result.errors, result.warnings);
    if (msg) {
      if (result.errors.length === 0 && result.warnings.length === 0) {
        msg.textContent = T('✅ 验证通过', '✅ Valid');
        msg.style.color = 'var(--success)';
      } else if (result.errors.length > 0) {
        msg.textContent = T('❌ 发现 ' + result.errors.length + ' 个错误', '❌ ' + result.errors.length + ' errors');
        msg.style.color = 'var(--danger)';
      } else {
        msg.textContent = T('⚠️ 发现 ' + result.warnings.length + ' 个警告', '⚠️ ' + result.warnings.length + ' warnings');
        msg.style.color = '#f59e0b';
      }
    }
  }

  function handleCopy() {
    if (!output.value.trim()) {
      if (msg) { msg.textContent = T('没有可复制的内容', 'Nothing to copy'); msg.style.color = '#f59e0b'; }
      return;
    }
    navigator.clipboard.writeText(output.value).then(function() {
      if (msg) { msg.textContent = T('✅ 已复制报告', '✅ Report copied'); msg.style.color = 'var(--success)'; setTimeout(function() { if (msg) msg.textContent = ''; }, 2000); }
    }).catch(function() {});
  }

  function handleClear() {
    input.value = '';
    output.value = '';
    if (msg) msg.textContent = '';
  }

  validate.addEventListener('click', handleValidate);
  if (copy) copy.addEventListener('click', handleCopy);
  if (clear) clear.addEventListener('click', handleClear);
})();