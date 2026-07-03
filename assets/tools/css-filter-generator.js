// CSS Filter Generator
// Visual CSS filter builder with real-time preview
(function () {
  'use strict';

  const isEN = document.documentElement.lang === 'en';

  // Filters definition
  const filters = {
    'fl-blur': { unit: 'px', css: 'blur', min: 0, max: 20, step: 0.5 },
    'fl-brightness': { unit: '%', css: 'brightness', min: 0, max: 200, step: 1 },
    'fl-contrast': { unit: '%', css: 'contrast', min: 0, max: 200, step: 1 },
    'fl-grayscale': { unit: '%', css: 'grayscale', min: 0, max: 100, step: 1 },
    'fl-hue': { unit: 'deg', css: 'hue-rotate', min: 0, max: 360, step: 1 },
    'fl-invert': { unit: '%', css: 'invert', min: 0, max: 100, step: 1 },
    'fl-opacity': { unit: '%', css: 'opacity', min: 0, max: 100, step: 1 },
    'fl-saturate': { unit: '%', css: 'saturate', min: 0, max: 200, step: 1 },
    'fl-sepia': { unit: '%', css: 'sepia', min: 0, max: 100, step: 1 }
  };

  // Demo images to cycle through
  const demoImages = [
    'https://picsum.photos/seed/filter1/400/300',
    'https://picsum.photos/seed/filter2/400/300',
    'https://picsum.photos/seed/filter3/400/300',
    'https://picsum.photos/seed/filter4/400/300'
  ];
  let currentImgIdx = 0;

  function getEl(id) {
    return document.getElementById(id);
  }

  function buildFilterString() {
    const parts = [];
    for (const [id, cfg] of Object.entries(filters)) {
      const slider = getEl(id);
      if (!slider) continue;
      const val = parseFloat(slider.value);
      const defaultValue = parseFloat(slider.getAttribute('data-default') || slider.defaultValue);
      if (val === defaultValue) continue;
      if (cfg.css === 'hue-rotate') {
        parts.push(cfg.css + '(' + val + cfg.unit + ')');
      } else {
        parts.push(cfg.css + '(' + (cfg.unit === '%' ? val : val) + cfg.unit + ')');
      }
    }
    return parts.join(' ') || 'none';
  }

  function updatePreview() {
    const img = getEl('fl-preview-img');
    const code = getEl('fl-css-output');
    if (!img || !code) return;

    const filterStr = buildFilterString();
    const cssText = filterStr === 'none' ? '/* ' + (isEN ? 'no filters active' : '无滤镜') + ' */' : 'filter: ' + filterStr + ';';

    img.style.filter = filterStr === 'none' ? 'none' : filterStr;
    code.textContent = cssText;
  }

  function updateSliderValues() {
    for (const id of Object.keys(filters)) {
      const slider = getEl(id);
      const val = getEl(id + '-val');
      if (slider && val) {
        val.textContent = slider.value;
      }
    }
  }

  function resetAll() {
    for (const [id, cfg] of Object.entries(filters)) {
      const slider = getEl(id);
      if (slider) {
        slider.value = slider.getAttribute('data-default') || slider.defaultValue;
      }
    }
    updateSliderValues();
    updatePreview();
  }

  function init() {
    const img = getEl('fl-preview-img');
    if (!img) return;

    // Store default values
    for (const id of Object.keys(filters)) {
      const slider = getEl(id);
      if (slider) {
        slider.setAttribute('data-default', slider.value);
        slider.addEventListener('input', function () {
          const valEl = getEl(id + '-val');
          if (valEl) valEl.textContent = this.value;
          updatePreview();
        });
      }
    }

    // Click image to cycle
    img.addEventListener('click', function () {
      currentImgIdx = (currentImgIdx + 1) % demoImages.length;
      this.src = demoImages[currentImgIdx];
      // Re-apply filter after image loads
      this.onload = function () {
        updatePreview();
      };
    });

    // Copy button
    const copyBtn = getEl('fl-copy-css');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const code = getEl('fl-css-output');
        if (!code) return;
        const text = code.textContent;
        if (text.startsWith('/*')) {
          if (typeof toast === 'function') {
            toast(isEN ? 'No filters to copy' : '没有滤镜可复制');
          } else {
            alert(isEN ? 'No filters to copy' : '没有滤镜可复制');
          }
          return;
        }
        navigator.clipboard.writeText(text).then(function () {
          if (typeof toast === 'function') {
            toast(isEN ? 'Copied!' : '已复制!');
          } else {
            alert(isEN ? 'Copied!' : '已复制!');
          }
        }).catch(function () {
          if (typeof toast === 'function') {
            toast(isEN ? 'Copy failed' : '复制失败');
          } else {
            alert(isEN ? 'Copy failed' : '复制失败');
          }
        });
      });
    }

    // Reset button
    const resetBtn = getEl('fl-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAll);
    }

    // Initial state
    updateSliderValues();
    updatePreview();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();