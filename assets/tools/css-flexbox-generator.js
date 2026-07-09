// CSS Flexbox Generator - Visual flexbox layout builder
(() => {
  const dir = document.getElementById('fg-direction');
  const justify = document.getElementById('fg-justify');
  const align = document.getElementById('fg-align');
  const wrap = document.getElementById('fg-wrap');
  const alignContent = document.getElementById('fg-align-content');
  const gap = document.getElementById('fg-gap');
  const gapVal = document.getElementById('fg-gap-val');
  const items = document.getElementById('fg-items');
  const itemsVal = document.getElementById('fg-items-val');
  const grow = document.getElementById('fg-grow');
  const growVal = document.getElementById('fg-grow-val');
  const shrink = document.getElementById('fg-shrink');
  const shrinkVal = document.getElementById('fg-shrink-val');
  const basis = document.getElementById('fg-basis');
  const alignSelf = document.getElementById('fg-align-self');
  const itemSize = document.getElementById('fg-item-size');
  const itemSizeVal = document.getElementById('fg-item-size-val');
  const preview = document.getElementById('fg-preview');
  const cssOutput = document.getElementById('fg-css-output');
  const copyBtn = document.getElementById('fg-copy-css');

  if (!preview || !cssOutput) return;

  function updatePreview() {
    // Container styles
    preview.style.flexDirection = dir.value;
    preview.style.justifyContent = justify.value;
    preview.style.alignItems = align.value;
    preview.style.flexWrap = wrap.value;
    preview.style.alignContent = alignContent.value;
    const g = parseInt(gap.value);
    preview.style.gap = g + 'px';
    gapVal.textContent = g + 'px';

    const n = parseInt(items.value);
    itemsVal.textContent = n;
    const sz = parseInt(itemSize.value);
    itemSizeVal.textContent = sz + 'px';

    // Build items
    preview.innerHTML = '';
    const colors = ['#4A90D9','#E74C3C','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#3498DB'];
    const gv = parseInt(grow.value);
    const sv = parseInt(shrink.value);
    growVal.textContent = gv;
    shrinkVal.textContent = sv;
    const bs = basis.value;

    for (let i = 0; i < n; i++) {
      const div = document.createElement('div');
      div.style.cssText = `min-width:${sz}px;min-height:${sz}px;background:${colors[i % colors.length]};border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold`;
      div.textContent = i + 1;
      div.style.flexGrow = gv;
      div.style.flexShrink = sv;
      div.style.flexBasis = bs;
      div.style.alignSelf = alignSelf.value;
      preview.appendChild(div);
    }

    // Generate CSS
    const css = `.flex-container {
  display: flex;
  flex-direction: ${dir.value};
  justify-content: ${justify.value};
  align-items: ${align.value};
  flex-wrap: ${wrap.value};
  align-content: ${alignContent.value};
  gap: ${g}px;
}

.flex-item {
  flex-grow: ${gv};
  flex-shrink: ${sv};
  flex-basis: ${bs};
  align-self: ${alignSelf.value};
  min-width: ${sz}px;
  min-height: ${sz}px;
}`;
    cssOutput.value = css;
  }

  // Attach events
  const inputs = [dir, justify, align, wrap, alignContent, gap, items, grow, shrink, basis, alignSelf, itemSize];
  inputs.forEach(el => {
    if (el) el.addEventListener('input', updatePreview);
    if (el) el.addEventListener('change', updatePreview);
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cssOutput.value).then(() => {
        if (typeof toast === 'function') toast('CSS copied!');
      });
    });
  }

  // Initial render
  updatePreview();
})();