// Color Picker - Visual color selection with HEX/RGB/HSL/HSV
(() => {
  const colorInput = document.getElementById('cpColor');
  const hexInput = document.getElementById('cpHex');
  const rgbInput = document.getElementById('cpRGB');
  const hslInput = document.getElementById('cpHSL');
  const hsvInput = document.getElementById('cpHSV');
  const preview = document.getElementById('cpPreview');
  const copyBtns = {
    hex: document.getElementById('cpCopyHex'),
    rgb: document.getElementById('cpCopyRGB'),
    hsl: document.getElementById('cpCopyHSL'),
    hsv: document.getElementById('cpCopyHSV'),
  };
  const swatches = document.querySelectorAll('[data-cp]');

  if (!colorInput || !hexInput) return;

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const v = parseInt(hex, 16);
    return [v >> 16 & 255, v >> 8 & 255, v & 255];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0, l=(max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      if (max === r) h = ((g-b)/d + (g<b?6:0)) / 6;
      else if (max === g) h = ((b-r)/d + 2) / 6;
      else h = ((r-g)/d + 4) / 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0, v=max;
    const d = max - min;
    s = max === 0 ? 0 : d/max;
    if (max !== min) {
      if (max === r) h = ((g-b)/d + (g<b?6:0)) / 6;
      else if (max === g) h = ((b-r)/d + 2) / 6;
      else h = ((r-g)/d + 4) / 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(v*100)];
  }

  function updateFromHex(hex) {
    hex = hex.trim();
    if (!/^#[0-9a-f]{6}$/i.test(hex) && !/^#[0-9a-f]{3}$/i.test(hex)) return;
    const [r,g,b] = hexToRgb(hex);
    const [h,s,l] = rgbToHsl(r,g,b);
    const [hv,sv,vv] = rgbToHsv(r,g,b);
    hexInput.value = hex.toUpperCase();
    rgbInput.value = `rgb(${r},${g},${b})`;
    hslInput.value = `hsl(${h},${s}%,${l}%)`;
    hsvInput.value = `hsv(${hv},${sv}%,${vv}%)`;
    if (preview) {
      preview.style.backgroundColor = hex;
      const brightness = (r*299 + g*587 + b*114) / 1000;
      preview.style.color = brightness > 128 ? '#333' : '#fff';
    }
  }

  function onColorChange(hex) {
    colorInput.value = hex;
    updateFromHex(hex);
  }

  // Color picker input
  colorInput.addEventListener('input', () => updateFromHex(colorInput.value));

  // Manual HEX input
  hexInput.addEventListener('input', () => {
    const v = hexInput.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v) || /^#[0-9a-f]{3}$/i.test(v)) {
      onColorChange(v);
    }
  });

  // Swatches
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      const hex = btn.getAttribute('data-cp');
      if (hex) onColorChange(hex);
    });
  });

  // Copy buttons
  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = orig; }, 1000);
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const orig = btn.textContent;
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = orig; }, 1000);
    });
  }

  if (copyBtns.hex) copyBtns.hex.addEventListener('click', () => copyText(hexInput.value, copyBtns.hex));
  if (copyBtns.rgb) copyBtns.rgb.addEventListener('click', () => copyText(rgbInput.value, copyBtns.rgb));
  if (copyBtns.hsl) copyBtns.hsl.addEventListener('click', () => copyText(hslInput.value, copyBtns.hsl));
  if (copyBtns.hsv) copyBtns.hsv.addEventListener('click', () => copyText(hsvInput.value, copyBtns.hsv));

  // Init
  updateFromHex(colorInput.value);
})();