// Hex ↔ RGB Converter
(() => {
  const hexInput = document.getElementById("colorHex");
  const rInput = document.getElementById("colorR");
  const gInput = document.getElementById("colorG");
  const bInput = document.getElementById("colorB");
  const preview = document.getElementById("colorPreview");
  const swapBtn = document.getElementById("colorSwap");

  function clamp(v, max) { return Math.max(0, Math.min(max, parseInt(v, 10) || 0)); }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const v = parseInt(hex, 16);
    return [v >> 16 & 255, v >> 8 & 255, v & 255];
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function updateFromHex() {
    let hex = hexInput.value.trim();
    if (!hex.startsWith("#")) hex = "#" + hex;
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return;
    const [r, g, b] = hexToRgb(hex);
    rInput.value = r;
    gInput.value = g;
    bInput.value = b;
    preview.style.backgroundColor = hex;
    preview.textContent = hex.toUpperCase();
  }

  function updateFromRgb() {
    const r = clamp(rInput.value, 255);
    const g = clamp(gInput.value, 255);
    const b = clamp(bInput.value, 255);
    const hex = rgbToHex(r, g, b);
    hexInput.value = hex;
    preview.style.backgroundColor = hex;
    preview.textContent = hex.toUpperCase() + ` (${r},${g},${b})`;
  }

  hexInput.addEventListener("input", updateFromHex);
  [rInput, gInput, bInput].forEach(el => el.addEventListener("input", updateFromRgb));

  swapBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(hexInput.value);
    swapBtn.textContent = "已复制";
    setTimeout(() => swapBtn.textContent = "复制 Hex", 1200);
  });

  // Init
  hexInput.value = "#6366f1";
  updateFromHex();
})();
