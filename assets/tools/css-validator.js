// CSS Validator - browser-local CSS syntax checker
(() => {
  const input = document.getElementById('cv-input');
  const output = document.getElementById('cv-output');
  const validate = document.getElementById('cv-validate');
  const copy = document.getElementById('cv-copy');
  const clear = document.getElementById('cv-clear');
  const msg = document.getElementById('cv-msg');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !validate) return;

  const T = (zh, en) => isEN ? en : zh;

  function countLines(code, pos) {
    return code.substring(0, pos).split('\n').length;
  }

  function validateCSS(code) {
    const errors = [];
    const warnings = [];
    const lines = code.split('\n');

    if (!code.trim()) {
      return { errors: [], warnings: [] };
    }

    // Check 1: Unmatched braces
    let braceStack = [];
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '{') braceStack.push(i);
      else if (ch === '}') {
        if (braceStack.length === 0) {
          errors.push({ line: countLines(code, i), msg: T('多余的闭合大括号 }', 'Unexpected closing brace }'), severity: 'error' });
        } else {
          braceStack.pop();
        }
      }
    }
    braceStack.forEach(pos => {
      errors.push({ line: countLines(code, pos), msg: T('未闭合的大括号 {', 'Unclosed opening brace {'), severity: 'error' });
    });

    // Check 2: Unbalanced parentheses
    let parenStack = [];
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '(') parenStack.push(i);
      else if (ch === ')') {
        if (parenStack.length === 0) {
          errors.push({ line: countLines(code, i), msg: T('多余的闭合括号 )', 'Unexpected closing parenthesis )'), severity: 'error' });
        } else {
          parenStack.pop();
        }
      }
    }
    parenStack.forEach(pos => {
      errors.push({ line: countLines(code, pos), msg: T('未闭合的括号 (', 'Unclosed opening parenthesis ('), severity: 'error' });
    });

    // Check 3: Unmatched square brackets
    let bracketStack = [];
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (ch === '[') bracketStack.push(i);
      else if (ch === ']') {
        if (bracketStack.length === 0) {
          errors.push({ line: countLines(code, i), msg: T('多余的闭合方括号 ]', 'Unexpected closing bracket ]'), severity: 'error' });
        } else {
          bracketStack.pop();
        }
      }
    }
    bracketStack.forEach(pos => {
      errors.push({ line: countLines(code, pos), msg: T('未闭合的方括号 [', 'Unclosed opening bracket ['), severity: 'error' });
    });

    // Check 4: Empty rules
    const emptyRuleRegex = /[^}]\s*\{\s*\}/g;
    let match;
    while ((match = emptyRuleRegex.exec(code)) !== null) {
      warnings.push({ line: countLines(code, match.index), msg: T('空规则定义（选择器后没有声明）', 'Empty rule (selector with no declarations)'), severity: 'warning' });
    }

    // Check 5: Missing semicolons before closing brace
    const noSemiBeforeBrace = /[a-zA-Z0-9%)\]]\s*\n?\s*\}/g;
    while ((match = noSemiBeforeBrace.exec(code)) !== null) {
      if (!match[0].includes(';') && !match[0].includes('/*')) {
        warnings.push({ line: countLines(code, match.index), msg: T('声明末尾缺少分号（推荐始终加分号）', 'Missing semicolon at end of declaration (recommended)'), severity: 'warning' });
      }
    }

    // Check 6: Unknown properties
    const knownProps = new Set([
      'color','background','background-color','background-image','background-size',
      'background-position','background-repeat','background-attachment','background-clip',
      'font','font-size','font-weight','font-family','font-style','font-variant',
      'font-stretch','line-height','text-align','text-decoration','text-transform',
      'text-indent','text-shadow','text-overflow','text-wrap','white-space',
      'word-spacing','letter-spacing','word-break','overflow-wrap','hyphens',
      'margin','margin-top','margin-right','margin-bottom','margin-left',
      'padding','padding-top','padding-right','padding-bottom','padding-left',
      'border','border-top','border-right','border-bottom','border-left',
      'border-color','border-style','border-width','border-radius',
      'border-collapse','border-spacing','border-image',
      'width','height','min-width','max-width','min-height','max-height',
      'display','visibility','opacity','overflow','overflow-x','overflow-y',
      'position','top','right','bottom','left','z-index','float','clear',
      'flex','flex-direction','flex-wrap','flex-flow','flex-grow','flex-shrink',
      'flex-basis','justify-content','align-items','align-content','align-self',
      'order','gap','row-gap','column-gap',
      'grid','grid-template','grid-template-rows','grid-template-columns',
      'grid-template-areas','grid-gap','grid-row-gap','grid-column-gap',
      'grid-auto-rows','grid-auto-columns','grid-auto-flow','grid-column',
      'grid-row','grid-area','grid-column-start','grid-column-end',
      'grid-row-start','grid-row-end',
      'list-style','list-style-type','list-style-position','list-style-image',
      'table-layout','caption-side','empty-cells',
      'cursor','pointer-events','user-select','resize','appearance',
      'outline','outline-color','outline-style','outline-width','outline-offset',
      'box-shadow','box-sizing','transform','transform-origin','transition',
      'transition-property','transition-duration','transition-timing-function',
      'transition-delay','animation','animation-name','animation-duration',
      'animation-timing-function','animation-delay','animation-iteration-count',
      'animation-direction','animation-fill-mode','animation-play-state',
      'filter','backdrop-filter','mix-blend-mode','isolation',
      'clip-path','mask','mask-image','mask-size','mask-position',
      'content','counter-increment','counter-reset','quotes',
      'vertical-align','direction','unicode-bidi','writing-mode',
      'page-break-before','page-break-after','page-break-inside',
      'orphans','widows','all','inherit','initial','unset','revert',
      'accent-color','aspect-ratio','backdrop-filter','caret-color',
      'color-scheme','columns','column-count','column-width','column-gap',
      'column-rule','column-rule-color','column-rule-style','column-rule-width',
      'column-span','contain','container','container-type','container-name',
      'inset','inset-block','inset-inline',
      'object-fit','object-position','offset','offset-path','offset-distance',
      'overflow-anchor','overscroll-behavior',
      'place-content','place-items','place-self',
      'scroll-behavior','scroll-margin','scroll-padding','scroll-snap-type',
      'scroll-snap-align','shape-outside','shape-margin','shape-image-threshold',
      'tab-size','text-decoration-color','text-decoration-line',
      'text-decoration-style','text-decoration-thickness','text-underline-offset',
      'text-underline-position','text-emphasis','text-orientation',
      'touch-action','transform-style','perspective','perspective-origin',
      'will-change','-webkit-appearance','-webkit-font-smoothing',
      '-webkit-text-fill-color','-webkit-text-stroke','-webkit-box-shadow',
      '-webkit-overflow-scrolling','-webkit-tap-highlight-color',
      '-moz-appearance','-moz-osx-font-smoothing',
      'scrollbar-width','scrollbar-color','scrollbar-gutter',
      'font-display','font-variant-ligatures','font-variant-caps',
      'font-variant-numeric','font-variant-east-asian','font-kerning',
      'font-feature-settings','font-variation-settings','font-optical-sizing'
    ]);

    const propRegex = /[;{]\s*([a-zA-Z@][a-zA-Z0-9-]*)\s*:/g;
    while ((match = propRegex.exec(code)) !== null) {
      const prop = match[1].toLowerCase();
      if (prop.startsWith('-') || prop.startsWith('@') || prop.startsWith('--')) continue;
      if (['and','or','not','from','to','at','of','for','if','else','each','in'].includes(prop)) continue;
      if (!knownProps.has(prop)) {
        warnings.push({ line: countLines(code, match.index), msg: T('未知属性: "' + prop + '"', 'Unknown property: "' + prop + '"'), severity: 'info' });
      }
    }

    // Check 7: Invalid hex colors
    const colorRegex = /#[0-9a-fA-F]{3,8}\b/g;
    while ((match = colorRegex.exec(code)) !== null) {
      const hex = match[0];
      const len = hex.length - 1;
      if (![3,4,6,8].includes(len)) {
        errors.push({ line: countLines(code, match.index), msg: T('无效的十六进制颜色值: ' + hex + '（长度应为3/4/6/8位）', 'Invalid hex color: ' + hex + ' (length should be 3/4/6/8)'), severity: 'error' });
      }
    }

    // Check 8: Duplicate selectors
    const selRegex = /([.#]?[a-zA-Z]\w*(?:[-:]\w+)*)\s*\{/g;
    const selectors = [];
    while ((match = selRegex.exec(code)) !== null) {
      selectors.push(match[1]);
    }
    const seen = new Set();
    selectors.forEach(sel => {
      if (seen.has(sel)) {
        warnings.push({ line: 0, msg: T('重复的选择器: "' + sel + '"', 'Duplicate selector: "' + sel + '"'), severity: 'info' });
      }
      seen.add(sel);
    });

    // Check 9: Missing units on length values
    const lengthProps = new Set(['margin','padding','border','outline','gap','row-gap','column-gap','top','right','bottom','left','width','height','min-width','max-width','min-height','max-height','font-size','text-indent','letter-spacing','word-spacing','border-radius','border-width','border-top-width','border-right-width','border-bottom-width','border-left-width','flex-basis','inset','inset-block','inset-inline','scroll-margin','scroll-padding','scroll-margin-top','scroll-margin-right','scroll-margin-bottom','scroll-margin-left','scroll-padding-top','scroll-padding-right','scroll-padding-bottom','scroll-padding-left','outline-offset','column-gap','column-width','tab-size','shape-margin','text-underline-offset','padding-block','padding-inline','margin-block','margin-inline']);
    const unitRegex = /:\s*(\d+)(?!\.)(?=\s*[;}])(?!\s*0\s*[;}])/g;
    while ((match = unitRegex.exec(code)) !== null) {
      const val = match[1];
      const ctxStart = Math.max(0, code.lastIndexOf(';', match.index));
      const ctxBefore = code.substring(ctxStart, match.index);
      const isLength = Array.from(lengthProps).some(p => ctxBefore.includes(p));
      if (val !== '0' && isLength) {
        warnings.push({ line: countLines(code, match.index), msg: T('数值缺少单位: "' + val + '"（应加 px/em/% 等）', 'Missing unit: "' + val + '" (add px/em/% etc.)'), severity: 'warning' });
      }
    }

    // Check 10: Duplicate property in same rule
    const ruleBlocks = code.match(/[^{]+\{[^}]*\}/g);
    if (ruleBlocks) {
      ruleBlocks.forEach(block => {
        const props = block.match(/([a-zA-Z-]+)\s*:/g);
        if (props) {
          const names = props.map(p => p.replace(':', '').trim().toLowerCase());
          const seen = new Set();
          names.forEach(p => {
            if (seen.has(p)) {
              warnings.push({ line: 0, msg: T('规则内重复属性: "' + p + '"', 'Duplicate property "' + p + '" in rule'), severity: 'warning' });
            }
            seen.add(p);
          });
        }
      });
    }

    return { errors, warnings };
  }

  function generateReport(errors, warnings) {
    if (errors.length === 0 && warnings.length === 0) {
      return T('✅ CSS 语法验证通过，未发现错误或警告！', '✅ CSS syntax validation passed, no errors or warnings!');
    }
    let r = '';
    if (errors.length > 0) {
      r += T('❌ 错误\n', '❌ Errors\n');
      r += '──────────────────────\n';
      errors.forEach(e => { r += T('  第 ' + e.line + ' 行: ', '  Line ' + e.line + ': ') + e.msg + '\n'; });
      r += '\n';
    }
    if (warnings.length > 0) {
      r += T('⚠️ 警告\n', '⚠️ Warnings\n');
      r += '──────────────────────\n';
      warnings.forEach(w => { r += T('  第 ' + w.line + ' 行: ', '  Line ' + w.line + ': ') + w.msg + '\n'; });
    }
    r += T('\n📊 总计: ' + errors.length + ' 个错误, ' + warnings.length + ' 个警告', '\n📊 Total: ' + errors.length + ' errors, ' + warnings.length + ' warnings');
    return r;
  }

  function handleValidate() {
    const code = input.value;
    if (!code.trim()) {
      output.value = T('请输入 CSS 代码后点击验证', 'Enter CSS code and click Validate');
      if (msg) { msg.textContent = T('请输入 CSS 代码', 'Please enter CSS code'); msg.style.color = '#f59e0b'; }
      return;
    }
    const result = validateCSS(code);
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
    navigator.clipboard.writeText(output.value).then(() => {
      if (msg) { msg.textContent = T('✅ 已复制报告', '✅ Report copied'); msg.style.color = 'var(--success)'; setTimeout(() => { if (msg) msg.textContent = ''; }, 2000); }
    }).catch(() => {});
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
