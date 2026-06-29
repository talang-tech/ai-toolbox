// Data Size Converter
// Convert between B, KB, MB, GB, TB, PB with binary/decimal modes
(function() {
  'use strict';

  const UNITS = [
    { key: 'B',  label: 'Bytes',  factor: 0 },
    { key: 'KB', label: 'KB',     factor: 1 },
    { key: 'MB', label: 'MB',     factor: 2 },
    { key: 'GB', label: 'GB',     factor: 3 },
    { key: 'TB', label: 'TB',     factor: 4 },
    { key: 'PB', label: 'PB',     factor: 5 }
  ];

  let updatingFrom = -1; // prevents loops

  function getBase() {
    const radios = document.getElementsByName('dsc-mode');
    for (const r of radios) {
      if (r.checked) return r.value === 'binary' ? 1024 : 1000;
    }
    return 1024;
  }

  function bytesToUnit(bytes, unitIndex, base) {
    if (unitIndex === 0) return bytes;
    return bytes / Math.pow(base, unitIndex);
  }

  function unitToBytes(value, unitIndex, base) {
    if (unitIndex === 0) return value;
    return value * Math.pow(base, unitIndex);
  }

  function renderConverters() {
    const container = document.getElementById('dsc-converters');
    if (!container) return;
    const base = getBase();
    container.innerHTML = '';

    for (let i = 0; i < UNITS.length; i++) {
      const unit = UNITS[i];
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--bg-light);padding:8px 12px;border-radius:8px';
      row.innerHTML = `
        <label style="min-width:60px;font-weight:600;font-size:14px;color:var(--text)">${unit.key}</label>
        <input type="text" id="dsc-input-${i}" value="0"
          style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-family:Consolas,monospace;font-size:14px;background:var(--bg);color:var(--text)"
          data-unit-index="${i}">
        <span style="min-width:60px;font-size:12px;color:var(--text-dim);text-align:right">${unit.label}</span>
        <button class="btn-copy-unit" data-idx="${i}"
          style="background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;padding:4px 8px;font-size:12px;color:var(--text-dim)">📋</button>
      `;
      container.appendChild(row);
    }

    // Format label
    const baseInfo = document.createElement('div');
    baseInfo.style.cssText = 'margin-top:4px;font-size:12px;color:var(--text-dim);text-align:center';
    const baseName = base === 1024 ? '二进制 (1 KB = 1024 B)' : '十进制 (1 KB = 1000 B)';
    baseInfo.textContent = `基于 ${baseName} 计算`;
    container.appendChild(baseInfo);

    // Input listeners
    document.querySelectorAll('[id^="dsc-input-"]').forEach(input => {
      input.addEventListener('input', function() {
        updateFrom(this);
      });
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') updateFrom(this);
      });
    });

    // Copy buttons
    document.querySelectorAll('.btn-copy-unit').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.dataset.idx);
        const val = document.getElementById(`dsc-input-${idx}`).value;
        navigator.clipboard.writeText(val).then(() => {
          btn.textContent = '✅';
          setTimeout(() => { btn.textContent = '📋'; }, 1500);
        }).catch(() => {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = val;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = '✅';
          setTimeout(() => { btn.textContent = '📋'; }, 1500);
        });
      });
    });
  }

  function updateFrom(input) {
    const idx = parseInt(input.dataset.unitIndex);
    const raw = input.value.trim();
    if (raw === '') return;

    const val = parseFloat(raw);
    if (isNaN(val)) return;

    const base = getBase();
    const bytes = unitToBytes(val, idx, base);

    updatingFrom = idx;
    for (let i = 0; i < UNITS.length; i++) {
      if (i === idx) continue;
      const otherInput = document.getElementById(`dsc-input-${i}`);
      if (otherInput) {
        const converted = bytesToUnit(bytes, i, base);
        otherInput.value = formatNum(converted);
      }
    }
    updatingFrom = -1;
  }

  function formatNum(n) {
    if (Math.abs(n) >= 1e12) return n.toExponential(4);
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
    // Round to reasonable precision
    const s = n.toPrecision(10);
    // Remove trailing zeros
    return parseFloat(s).toString();
  }

  function init() {
    renderConverters();

    // Mode change
    document.querySelectorAll('[name="dsc-mode"]').forEach(radio => {
      radio.addEventListener('change', function() {
        // Recalculate from the first non-zero value
        let sourceIdx = -1;
        let sourceVal = null;
        for (let i = 0; i < UNITS.length; i++) {
          const v = parseFloat(document.getElementById(`dsc-input-${i}`).value);
          if (v && v > 0) {
            sourceIdx = i;
            sourceVal = v;
            break;
          }
        }
        if (sourceIdx >= 0 && sourceVal) {
          const base = getBase();
          const bytes = unitToBytes(sourceVal, sourceIdx, base);
          for (let i = 0; i < UNITS.length; i++) {
            if (i === sourceIdx) continue;
            const otherInput = document.getElementById(`dsc-input-${i}`);
            if (otherInput) {
              otherInput.value = formatNum(bytesToUnit(bytes, i, base));
            }
          }
        }
        // Re-render converters to update base label
        renderConverters();
      });
    });
  }

  if (document.getElementById('dsc-converters')) {
    init();
  }
})();