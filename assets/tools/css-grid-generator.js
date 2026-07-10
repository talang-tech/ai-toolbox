// CSS Grid Generator - Visual CSS Grid layout builder
(() => {
  const cols = document.getElementById('gg-columns');
  const colsVal = document.getElementById('gg-columns-val');
  const rows = document.getElementById('gg-rows');
  const rowsVal = document.getElementById('gg-rows-val');
  const colGap = document.getElementById('gg-col-gap');
  const colGapVal = document.getElementById('gg-col-gap-val');
  const rowGap = document.getElementById('gg-row-gap');
  const rowGapVal = document.getElementById('gg-row-gap-val');
  const justifyItems = document.getElementById('gg-justify-items');
  const alignItems = document.getElementById('gg-align-items');
  const justifyContent = document.getElementById('gg-justify-content');
  const alignContent = document.getElementById('gg-align-content');
  const preview = document.getElementById('gg-preview');
  const cssOutput = document.getElementById('gg-css-output');
  const copyBtn = document.getElementById('gg-copy-css');
  const templateType = document.getElementById('gg-template-type');
  const colSizes = document.getElementById('gg-col-sizes');
  const rowSizes = document.getElementById('gg-row-sizes');
  const itemCount = document.getElementById('gg-item-count');
  const itemCountVal = document.getElementById('gg-item-count-val');

  if (!preview || !cssOutput) return;

  function updatePreview() {
    const c = parseInt(cols.value);
    const r = parseInt(rows.value);
    const cg = parseInt(colGap.value);
    const rg = parseInt(rowGap.value);
    const ic = parseInt(itemCount.value);

    colsVal.textContent = c;
    rowsVal.textContent = r;
    colGapVal.textContent = cg + 'px';
    rowGapVal.textContent = rg + 'px';
    itemCountVal.textContent = ic;

    // Build grid template
    let colTemplate, rowTemplate;
    const useFixed = templateType.value === 'fixed';

    if (useFixed) {
      const cSize = colSizes.value || '1fr';
      const rSize = rowSizes.value || '1fr';
      colTemplate = `repeat(${c}, ${cSize})`;
      rowTemplate = `repeat(${r}, ${rSize})`;
    } else {
      colTemplate = `repeat(${c}, 1fr)`;
      rowTemplate = `repeat(${r}, 1fr)`;
    }

    // Apply grid styles
    preview.style.display = 'grid';
    preview.style.gridTemplateColumns = colTemplate;
    preview.style.gridTemplateRows = rowTemplate;
    preview.style.gap = `${cg}px ${rg}px`;
    preview.style.justifyItems = justifyItems.value;
    preview.style.alignItems = alignItems.value;
    preview.style.justifyContent = justifyContent.value;
    preview.style.alignContent = alignContent.value;

    // Build grid items
    preview.innerHTML = '';
    const colors = ['#4A90D9','#E74C3C','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#3498DB','#E91E63','#00BCD4','#8BC34A','#FF5722'];
    const totalCells = c * r;
    const showCount = Math.min(ic, totalCells);

    for (let i = 0; i < showCount; i++) {
      const div = document.createElement('div');
      div.style.cssText = `background:${colors[i % colors.length]};border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;min-height:40px;padding:8px`;
      div.textContent = i + 1;
      preview.appendChild(div);
    }

    // Fill remaining cells as empty
    for (let i = showCount; i < totalCells; i++) {
      const div = document.createElement('div');
      div.style.cssText = 'background:var(--bg);border:1px dashed var(--border);border-radius:6px;min-height:40px';
      preview.appendChild(div);
    }

    // Generate CSS
    const css = `.grid-container {
  display: grid;
  grid-template-columns: ${colTemplate};
  grid-template-rows: ${rowTemplate};
  gap: ${cg}px ${rg}px;
  justify-items: ${justifyItems.value};
  align-items: ${alignItems.value};
  justify-content: ${justifyContent.value};
  align-content: ${alignContent.value};
}

.grid-item {
  /* Optional: add item-specific styles here */
  /* grid-column: span 2; example span */
  /* grid-row: span 1; */
}`;
    cssOutput.value = css;
  }

  // Attach events
  const inputs = [cols, rows, colGap, rowGap, justifyItems, alignItems, justifyContent, alignContent, templateType, colSizes, rowSizes, itemCount];
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