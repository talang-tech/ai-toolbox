/**
 * CSS to Tailwind CSS - Convert CSS properties to Tailwind classes
 * AI Toolbox - 100% client-side processing
 */

(function() {
  'use strict';

  const input = document.getElementById('ct-input');
  const output = document.getElementById('ct-output');
  const convertBtn = document.getElementById('ct-convert');
  const copyBtn = document.getElementById('ct-copy');
  const clearBtn = document.getElementById('ct-clear');
  const statusEl = document.getElementById('ct-status');
  const resultCount = document.getElementById('ct-count');

  const TAILWIND_COLORS = {
    '#000000': 'black', '#ffffff': 'white',
    '#f8fafc': 'slate-50', '#f1f5f9': 'slate-100', '#e2e8f0': 'slate-200',
    '#cbd5e1': 'slate-300', '#94a3b8': 'slate-400', '#64748b': 'slate-500',
    '#475569': 'slate-600', '#334155': 'slate-700', '#1e293b': 'slate-800',
    '#0f172a': 'slate-900', '#f9fafb': 'gray-50', '#f3f4f6': 'gray-100',
    '#e5e7eb': 'gray-200', '#d1d5db': 'gray-300', '#9ca3af': 'gray-400',
    '#6b7280': 'gray-500', '#4b5563': 'gray-600', '#374151': 'gray-700',
    '#1f2937': 'gray-800', '#111827': 'gray-900', '#eff6ff': 'blue-50',
    '#dbeafe': 'blue-100', '#bfdbfe': 'blue-200', '#93c5fd': 'blue-300',
    '#60a5fa': 'blue-400', '#3b82f6': 'blue-500', '#2563eb': 'blue-600',
    '#1d4ed8': 'blue-700', '#1e40af': 'blue-800', '#1e3a8a': 'blue-900',
    '#f0fdf4': 'green-50', '#dcfce7': 'green-100', '#bbf7d0': 'green-200',
    '#86efac': 'green-300', '#4ade80': 'green-400', '#22c55e': 'green-500',
    '#16a34a': 'green-600', '#15803d': 'green-700', '#166534': 'green-800',
    '#14532d': 'green-900', '#fef2f2': 'red-50', '#fee2e2': 'red-100',
    '#fecaca': 'red-200', '#fca5a5': 'red-300', '#f87171': 'red-400',
    '#ef4444': 'red-500', '#dc2626': 'red-600', '#b91c1c': 'red-700',
    '#991b1b': 'red-800', '#7f1d1d': 'red-900', '#fff7ed': 'orange-50',
    '#ffedd5': 'orange-100', '#fed7aa': 'orange-200', '#fdba74': 'orange-300',
    '#fb923c': 'orange-400', '#f97316': 'orange-500', '#ea580c': 'orange-600',
    '#c2410c': 'orange-700', '#9a3412': 'orange-800', '#7c2d12': 'orange-900',
    '#faf5ff': 'purple-50', '#f3e8ff': 'purple-100', '#e9d5ff': 'purple-200',
    '#d8b4fe': 'purple-300', '#c084fc': 'purple-400', '#a855f7': 'purple-500',
    '#9333ea': 'purple-600', '#7e22ce': 'purple-700', '#6b21a8': 'purple-800',
    '#581c87': 'purple-900', '#fefce8': 'yellow-50', '#fef9c3': 'yellow-100',
    '#fef08a': 'yellow-200', '#fde047': 'yellow-300', '#facc15': 'yellow-400',
    '#eab308': 'yellow-500', '#ca8a04': 'yellow-600', '#a16207': 'yellow-700',
    '#854d0e': 'yellow-800', '#713f12': 'yellow-900', '#ecfdf5': 'emerald-50',
    '#d1fae5': 'emerald-100', '#a7f3d0': 'emerald-200', '#6ee7b7': 'emerald-300',
    '#34d399': 'emerald-400', '#10b981': 'emerald-500', '#059669': 'emerald-600',
    '#047857': 'emerald-700', '#065f46': 'emerald-800', '#064e3b': 'emerald-900',
    '#fdf2f8': 'pink-50', '#fce7f3': 'pink-100', '#fbcfe8': 'pink-200',
    '#f9a8d4': 'pink-300', '#f472b6': 'pink-400', '#ec4899': 'pink-500',
    '#db2777': 'pink-600', '#be185d': 'pink-700', '#9d174d': 'pink-800',
    '#831843': 'pink-900', '#f5f5f5': 'neutral-100', '#e5e5e5': 'neutral-200',
    '#d4d4d4': 'neutral-300', '#a3a3a3': 'neutral-400', '#737373': 'neutral-500',
    '#525252': 'neutral-600', '#404040': 'neutral-700', '#262626': 'neutral-800',
    '#171717': 'neutral-900'
  };


  function closestColor(hex) {
    hex = hex.toLowerCase();
    if (TAILWIND_COLORS[hex]) return TAILWIND_COLORS[hex];
    let best = null, bestDist = Infinity;
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    for (const [h, name] of Object.entries(TAILWIND_COLORS)) {
      const hr = parseInt(h.slice(1,3), 16), hg = parseInt(h.slice(3,5), 16), hb = parseInt(h.slice(5,7), 16);
      const dist = Math.sqrt((r-hr)**2 + (g-hg)**2 + (b-hb)**2);
      if (dist < bestDist) { bestDist = dist; best = name; }
    }
    return bestDist < 80 ? best : null;
  }

  function pxToTw(px) {
    const num = parseFloat(px);
    if (isNaN(num)) return null;
    const unit = Math.round(num / 4);
    if (unit === 0) return '0';
    return String(unit);
  }

  function convertCSS(inputCss) {
    const lines = inputCss.split('\n');
    const results = [];
    let currentRule = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
      if (trimmed.includes('{')) { currentRule = trimmed.split('{')[0].trim(); continue; }
      if (trimmed.includes('}')) { currentRule = ''; continue; }
      if (!currentRule) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const prop = trimmed.substring(0, colonIdx).trim();
      const val = trimmed.substring(colonIdx + 1).replace(/;$/, '').trim();
      const twClass = mapProperty(prop, val);
      if (twClass) results.push({ rule: currentRule, prop, val, twClass });
    }
    return results;
  }

  function mapProperty(prop, val) {
    prop = prop.toLowerCase(); val = val.trim();
    if (prop === 'display') {
      const m = {'flex':'flex','inline-flex':'inline-flex','grid':'grid','inline-grid':'inline-grid','block':'block','inline-block':'inline-block','inline':'inline','hidden':'hidden','none':'hidden','contents':'contents','flow-root':'flow-root'};
      return m[val] || null;
    }
    if (prop === 'position') {
      const m = {'relative':'relative','absolute':'absolute','fixed':'fixed','sticky':'sticky','static':'static'};
      return m[val] || null;
    }
    if (prop === 'flex-direction') {
      const m = {'row':'flex-row','row-reverse':'flex-row-reverse','column':'flex-col','column-reverse':'flex-col-reverse'};
      return m[val] || null;
    }
    if (prop === 'flex-wrap') {
      const m = {'wrap':'flex-wrap','nowrap':'flex-nowrap','wrap-reverse':'flex-wrap-reverse'};
      return m[val] || null;
    }
    if (prop === 'justify-content') {
      const m = {'center':'justify-center','flex-start':'justify-start','flex-end':'justify-end','space-between':'justify-between','space-around':'justify-around','space-evenly':'justify-evenly'};
      return m[val] || null;
    }
    if (prop === 'align-items') {
      const m = {'center':'items-center','flex-start':'items-start','flex-end':'items-end','baseline':'items-baseline','stretch':'items-stretch'};
      return m[val] || null;
    }
    if (prop === 'text-align') {
      const m = {'center':'text-center','left':'text-left','right':'text-right','justify':'text-justify'};
      return m[val] || null;
    }
    if (prop === 'font-weight') {
      const m = {'bold':'font-bold','normal':'font-normal','100':'font-thin','200':'font-extralight','300':'font-light','400':'font-normal','500':'font-medium','600':'font-semibold','700':'font-bold','800':'font-extrabold','900':'font-black'};
      return m[val] || null;
    }
    if (prop === 'font-size') {
      const m = {'12px':'text-xs','14px':'text-sm','16px':'text-base','18px':'text-lg','20px':'text-xl','24px':'text-2xl','30px':'text-3xl','36px':'text-4xl','48px':'text-5xl','60px':'text-6xl','72px':'text-7xl','96px':'text-8xl','128px':'text-9xl','0.75rem':'text-xs','0.875rem':'text-sm','1rem':'text-base','1.125rem':'text-lg','1.25rem':'text-xl','1.5rem':'text-2xl','1.875rem':'text-3xl','2.25rem':'text-4xl','3rem':'text-5xl','3.75rem':'text-6xl','4.5rem':'text-7xl','6rem':'text-8xl'};
      return m[val] || null;
    }
    if (prop === 'color') {
      const tw = closestColor(val); if (tw) return 'text-'+tw;
      if (val.startsWith('#')) return 'text-['+val+']'; return null;
    }
    if (prop === 'background-color') {
      const tw = closestColor(val); if (tw) return 'bg-'+tw;
      if (val.startsWith('#')) return 'bg-['+val+']'; return null;
    }
    if (prop === 'width') {
      if (val==='100%') return 'w-full'; if (val==='auto') return 'w-auto';
      if (val==='50%') return 'w-1/2'; if (val==='33.33%'||val==='33.333333%') return 'w-1/3';
      if (val==='66.67%'||val==='66.666667%') return 'w-2/3'; if (val==='25%') return 'w-1/4'; if (val==='75%') return 'w-3/4';
      if (val.endsWith('px')||val.endsWith('rem')) { const t=pxToTw(val); if(t) return 'w-'+t; }
      if (val==='100vw') return 'w-screen'; if (val==='100dvw') return 'w-dvw'; return null;
    }
    if (prop === 'height') {
      if (val==='100%') return 'h-full'; if (val==='auto') return 'h-auto';
      if (val==='100vh') return 'h-screen'; if (val==='100dvh') return 'h-dvh';
      if (val.endsWith('px')||val.endsWith('rem')) { const t=pxToTw(val); if(t) return 'h-'+t; }
      return null;
    }
    if (prop.startsWith('margin')||prop==='margin') {
      if (val==='auto') return 'm-auto';
      const p = prop==='margin'?'m':prop==='margin-top'?'mt':prop==='margin-right'?'mr':prop==='margin-bottom'?'mb':'ml';
      if (val==='0') return p+'-0'; if (val.endsWith('px')) { const t=pxToTw(val); if(t) return p+'-'+t; }
      return null;
    }
    if (prop.startsWith('padding')||prop==='padding') {
      const p = prop==='padding'?'p':prop==='padding-top'?'pt':prop==='padding-right'?'pr':prop==='padding-bottom'?'pb':'pl';
      if (val==='0') return p+'-0'; if (val.endsWith('px')) { const t=pxToTw(val); if(t) return p+'-'+t; }
      return null;
    }
    if (prop === 'gap') {
      if (val==='0') return 'gap-0'; if (val.endsWith('px')) { const t=pxToTw(val); if(t) return 'gap-'+t; }
      return null;
    }
    if (prop === 'border-radius') {
      const m = {'0':'rounded-none','2px':'rounded-sm','4px':'rounded','6px':'rounded-md','8px':'rounded-lg','12px':'rounded-xl','16px':'rounded-2xl','24px':'rounded-3xl','9999px':'rounded-full','50%':'rounded-full'};
      return m[val] || (val.endsWith('px')?'rounded-['+val+']':null);
    }
    if (prop === 'border') {
      if (val==='none'||val==='0') return 'border-0';
      if (val.includes('1px')) return 'border'; if (val.includes('2px')) return 'border-2'; if (val.includes('4px')) return 'border-4';
      return null;
    }
    if (prop === 'border-width') {
      const m = {'0':'border-0','1px':'border','2px':'border-2','4px':'border-4','8px':'border-8'};
      return m[val] || null;
    }
    if (prop === 'border-style') {
      const m = {'solid':'border-solid','dashed':'border-dashed','dotted':'border-dotted','double':'border-double','none':'border-none'};
      return m[val] || null;
    }
    if (prop === 'opacity') {
      const m = {'0':'opacity-0','0.1':'opacity-10','0.2':'opacity-20','0.25':'opacity-25','0.3':'opacity-30','0.4':'opacity-40','0.5':'opacity-50','0.6':'opacity-60','0.7':'opacity-70','0.75':'opacity-75','0.8':'opacity-80','0.9':'opacity-90','1':'opacity-100'};
      return m[val] || null;
    }
    if (prop === 'overflow') {
      const m = {'hidden':'overflow-hidden','auto':'overflow-auto','scroll':'overflow-scroll','visible':'overflow-visible','clip':'overflow-clip'};
      return m[val] || null;
    }
    if (prop === 'cursor') {
      const m = {'pointer':'cursor-pointer','default':'cursor-default','not-allowed':'cursor-not-allowed','wait':'cursor-wait','text':'cursor-text','move':'cursor-move','grab':'cursor-grab','grabbing':'cursor-grabbing','crosshair':'cursor-crosshair','help':'cursor-help','zoom-in':'cursor-zoom-in','zoom-out':'cursor-zoom-out'};
      return m[val] || null;
    }
    if (prop === 'white-space') {
      const m = {'nowrap':'whitespace-nowrap','pre':'whitespace-pre','pre-wrap':'whitespace-pre-wrap','pre-line':'whitespace-pre-line','normal':'whitespace-normal'};
      return m[val] || null;
    }
    if (prop === 'text-decoration' || prop === 'text-decoration-line') {
      if (val === 'underline') return 'underline';
      if (val === 'line-through') return 'line-through';
      if (val === 'none') return 'no-underline';
      return null;
    }
    if (prop === 'font-style') {
      if (val === 'italic') return 'italic';
      if (val === 'normal') return 'not-italic';
      return null;
    }
    if (prop === 'text-transform') {
      const m = {'uppercase':'uppercase','lowercase':'lowercase','capitalize':'capitalize','none':'normal-case'};
      return m[val] || null;
    }
    if (prop === 'list-style-type') {
      const m = {'none':'list-none','disc':'list-disc','decimal':'list-decimal'};
      return m[val] || null;
    }
    if (prop === 'box-shadow') {
      if (val === 'none') return 'shadow-none';
      if (val.includes('0 1px 2px 0')) return 'shadow-sm';
      if (val.includes('0 1px 3px 0') || val.includes('0 2px 4px')) return 'shadow';
      if (val.includes('0 4px 6px')) return 'shadow-md';
      if (val.includes('0 10px 15px')) return 'shadow-lg';
      if (val.includes('0 20px 25px')) return 'shadow-xl';
      if (val.includes('0 25px 50px')) return 'shadow-2xl';
      return 'shadow';
    }
    if (prop === 'transition') {
      if (val.includes('all') || val.includes('opacity') || val.includes('transform')) return 'transition';
      if (val === 'none') return 'transition-none';
      return 'transition';
    }
    return null;
  }

  function renderResults(results) {
    if (results.length === 0) {
      return '未找到可转换的 CSS 属性。\\n请检查 CSS 语法是否正确。';
    }
    const lines = [];
    lines.push('/* CSS to Tailwind CSS 转换结果 */');
    lines.push('');
    const grouped = {};
    for (const r of results) {
      if (!grouped[r.rule]) grouped[r.rule] = [];
      grouped[r.rule].push(r);
    }
    for (const [rule, props] of Object.entries(grouped)) {
      lines.push('/* ' + rule + ' */');
      const classes = props.map(p => p.twClass).join(' ');
      lines.push('class=\"' + classes + '\"');
      lines.push('');
    }
    return lines.join('\\n');
  }

  function doConvert() {
    const css = input.value;
    if (!css.trim()) {
      setStatus('请输入 CSS 代码', 'warn');
      output.value = '';
      resultCount.textContent = '0';
      return;
    }
    const results = convertCSS(css);
    const out = renderResults(results);
    output.value = out;
    resultCount.textContent = String(results.length);
    if (results.length === 0) {
      setStatus('\\u26a0\\ufe0f 未找到可转换的属性，请检查 CSS 语法', 'warn');
    } else {
      setStatus('\\u2705 转换 ' + results.length + ' 条属性', 'success');
    }
  }

  function copyResult() {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(function() {
      setStatus('\\U0001f4cb \\u5df2\\u590d\\u5236\\u5230\\u526a\\u8d34\\u677f', 'success');
    }).catch(function() {
      output.select();
      document.execCommand('copy');
      setStatus('\\U0001f4cb \\u5df2\\u590d\\u5236\\u5230\\u526a\\u8d34\\u677f', 'success');
    });
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    resultCount.textContent = '0';
    setStatus('\\u5df2\\u6e05\\u7a7a', 'info');
  }


  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'status-' + (type || 'info');
  }

  function loadSample() {
    if (input.value) return;
    input.value = '.card {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 16px;\n  margin: 8px;\n  background-color: #3b82f6;\n  color: #ffffff;\n  border-radius: 8px;\n  font-size: 16px;\n  font-weight: bold;\n  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n}';
    setStatus('已加载示例 CSS', 'info');
    setTimeout(doConvert, 100);
  }

  convertBtn.addEventListener('click', doConvert);
  copyBtn.addEventListener('click', copyResult);
  clearBtn.addEventListener('click', clearAll);

  loadSample();
})();
