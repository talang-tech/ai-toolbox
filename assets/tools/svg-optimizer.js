// SVG Optimizer - Compress and clean SVG files
(() => {
  const inputArea = document.getElementById('svg-input-area');
  const fileInput = document.getElementById('svg-input');
  const optimizeBtn = document.getElementById('svg-optimize');
  const formatBtn = document.getElementById('svg-format');
  const copyBtn = document.getElementById('svg-copy');
  const downloadBtn = document.getElementById('svg-download');
  const sizeBefore = document.getElementById('svg-size-before');
  const sizeAfter = document.getElementById('svg-size-after');
  const savings = document.getElementById('svg-savings');

  if (!inputArea) return;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function updateSizes(original, optimized) {
    if (sizeBefore) sizeBefore.textContent = formatSize(original);
    if (sizeAfter) sizeAfter.textContent = formatSize(optimized);
    if (savings && original > 0) {
      const pct = ((original - optimized) / original * 100).toFixed(1);
      savings.textContent = pct + '%';
      savings.style.color = pct > 0 ? '#2ECC71' : (pct < 0 ? '#E74C3C' : 'inherit');
    }
  }

  function optimizeSVG(svg) {
    // Remove XML declaration
    svg = svg.replace(/<\?xml[^>]*\?>/g, '');
    // Remove DOCTYPE
    svg = svg.replace(/<!DOCTYPE[^>]*>/gi, '');
    // Remove comments
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
    // Remove empty groups
    svg = svg.replace(/<g[^>]*>\s*<\/g>/g, '');
    // Remove empty defs
    svg = svg.replace(/<defs[^>]*>\s*<\/defs>/g, '');
    // Remove metadata
    svg = svg.replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/g, '');
    // Remove title and desc
    svg = svg.replace(/<title[^>]*>[\s\S]*?<\/title>/g, '');
    svg = svg.replace(/<desc[^>]*>[\s\S]*?<\/desc>/g, '');
    // Remove redundant xmlns (keep only the first svg xmlns)
    svg = svg.replace(/(xmlns:\w+="[^"]*")/g, '');
    // Remove xml:space
    svg = svg.replace(/xml:space="[^"]*"/g, '');
    // Remove version
    svg = svg.replace(/version="[^"]*"/g, '');
    // Remove empty style attributes
    svg = svg.replace(/style="\s*"/g, '');
    // Remove preserveAspectRatio when default
    svg = svg.replace(/preserveAspectRatio="xMidYMid meet"/g, '');
    // Round decimal numbers (e.g. d="M 123.456 789.012" -> M 123.46 789.01)
    svg = svg.replace(/(\d+\.\d{3,})/g, function(m) {
      return parseFloat(m).toFixed(2).replace(/\.?0+$/, '');
    });
    // Collapse whitespace
    svg = svg.replace(/>\s+</g, '><');
    svg = svg.replace(/\s{2,}/g, ' ');
    svg = svg.replace(/\s+>/g, '>');
    svg = svg.trim();
    // Remove trailing spaces in attributes
    svg = svg.replace(/\s+(?=\/?>)/g, '');
    return svg;
  }

  function formatSVG(svg) {
    // Pretty-print SVG with indentation
    let indent = 0;
    const tab = '  ';
    let result = '';
    let inTag = false;
    let inText = false;
    
    // Simple XML formatter
    svg = svg.replace(/>\s+</g, '><');
    svg = svg.replace(/></g, '>\n<');
    
    const lines = svg.split('\n');
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Closing tag
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        result += tab.repeat(indent) + trimmed + '\n';
      }
      // Self-closing tag
      else if (trimmed.endsWith('/>') || trimmed.endsWith('/ >')) {
        result += tab.repeat(indent) + trimmed + '\n';
      }
      // Opening tag with children
      else if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        result += tab.repeat(indent) + trimmed + '\n';
        indent++;
      }
      // Text content
      else {
        result += tab.repeat(indent) + trimmed + '\n';
      }
    }
    
    return result.trim();
  }

  function doOptimize() {
    const original = inputArea.value.trim();
    if (!original) {
      if (typeof toast === 'function') toast('Please enter SVG code first');
      return;
    }

    const originalSize = new Blob([original]).size;
    const optimized = optimizeSVG(original);
    inputArea.value = optimized;
    const optimizedSize = new Blob([optimized]).size;
    updateSizes(originalSize, optimizedSize);
    if (typeof toast === 'function') toast('SVG optimized!');
    if (typeof trackEvent === 'function') trackEvent('svg_optimized');
  }

  function doFormat() {
    const original = inputArea.value.trim();
    if (!original) {
      if (typeof toast === 'function') toast('Please enter SVG code first');
      return;
    }
    const formatted = formatSVG(original);
    inputArea.value = formatted;
    if (typeof toast === 'function') toast('Formatted!');
  }

  function doCopy() {
    const text = inputArea.value.trim();
    if (!text) {
      if (typeof toast === 'function') toast('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      if (typeof toast === 'function') toast('Copied!');
    });
  }

  function doDownload() {
    const text = inputArea.value.trim();
    if (!text) {
      if (typeof toast === 'function') toast('Nothing to download');
      return;
    }
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  // File upload
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        inputArea.value = ev.target.result;
        const sz = new Blob([ev.target.result]).size;
        if (sizeBefore) sizeBefore.textContent = formatSize(sz);
        if (sizeAfter) sizeAfter.textContent = formatSize(sz);
        if (savings) {
          savings.textContent = '0%';
          savings.style.color = 'inherit';
        }
        if (typeof toast === 'function') toast('File loaded: ' + file.name);
      };
      reader.readAsText(file);
      // Reset so same file can be re-uploaded
      fileInput.value = '';
    });
  }

  // Button events
  if (optimizeBtn) optimizeBtn.addEventListener('click', doOptimize);
  if (formatBtn) formatBtn.addEventListener('click', doFormat);
  if (copyBtn) copyBtn.addEventListener('click', doCopy);
  if (downloadBtn) downloadBtn.addEventListener('click', doDownload);

  // Auto-update on input
  inputArea.addEventListener('input', function() {
    const sz = new Blob([this.value]).size;
    if (sizeBefore) sizeBefore.textContent = formatSize(sz);
    if (sizeAfter) sizeAfter.textContent = formatSize(sz);
    if (savings) {
      savings.textContent = '0%';
      savings.style.color = 'inherit';
    }
  });
})();