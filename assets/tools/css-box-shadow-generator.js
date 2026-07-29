/**
 * CSS Box Shadow Generator — Visually build CSS box-shadow effects
 * AI Toolbox - Privacy-first browser-local tool
 *
 * All processing is done locally in the browser.
 */
(function () {
  'use strict';

  function init() {
    var hOffset = document.getElementById('bs-h');
    var vOffset = document.getElementById('bs-v');
    var blur = document.getElementById('bs-blur');
    var spread = document.getElementById('bs-spread');
    var color = document.getElementById('bs-color');
    var opacity = document.getElementById('bs-opacity');
    var inset = document.getElementById('bs-inset');
    var preview = document.getElementById('bs-preview');
    var output = document.getElementById('bs-output');
    var msg = document.getElementById('bs-msg');
    var copyBtn = document.getElementById('bs-copy');
    var addBtn = document.getElementById('bs-add');
    var clearBtn = document.getElementById('bs-clear');
    var layerList = document.getElementById('bs-layers');
    var isEN = document.documentElement.lang === 'en';

    var T = function (zh, en) { return isEN ? en : zh; };

    var layers = [];

    function hexToRgba(hex, a) {
      var r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
      }
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + Math.round(a * 100) / 100 + ')';
    }

    function buildShadowString(layer) {
      var parts = [];
      if (layer.inset) parts.push('inset');
      parts.push(layer.h + 'px');
      parts.push(layer.v + 'px');
      parts.push(layer.blur + 'px');
      if (layer.spread !== 0) parts.push(layer.spread + 'px');
      parts.push(hexToRgba(layer.color, layer.opacity));
      return parts.join(' ');
    }

    function buildMultiShadow() {
      if (layers.length === 0) {
        return buildShadowString(getCurrentLayer());
      }
      return layers.map(function(l) { return buildShadowString(l); }).join(', ');
    }

    function getCurrentLayer() {
      return {
        h: parseInt(hOffset.value) || 0,
        v: parseInt(vOffset.value) || 0,
        blur: parseInt(blur.value) || 0,
        spread: parseInt(spread.value) || 0,
        color: color.value || '#000000',
        opacity: parseFloat(opacity.value) || 0.5,
        inset: inset.checked
      };
    }

    function updatePreview() {
      var shadow = buildMultiShadow();
      preview.style.boxShadow = shadow;
      output.value = shadow;
      showMsg('', false);
    }

    function renderLayers() {
      if (!layerList) return;
      layerList.innerHTML = '';
      var isEN = document.documentElement.lang === 'en';
      layers.forEach(function(l, i) {
        var div = document.createElement('div');
        div.className = 'bs-layer-item';
        div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-bottom:6px;font-size:13px;flex-wrap:wrap';
        var colorBox = document.createElement('span');
        colorBox.style.cssText = 'display:inline-block;width:16px;height:16px;border-radius:3px;border:1px solid var(--border);background:' + hexToRgba(l.color, l.opacity);
        div.appendChild(colorBox);
        var label = document.createElement('span');
        label.style.cssText = 'flex:1;min-width:120px';
        label.textContent = (l.inset ? 'inset ' : '') + l.h + 'px ' + l.v + 'px ' + l.blur + 'px ' + (l.spread !== 0 ? l.spread + 'px ' : '') + hexToRgba(l.color, l.opacity);
        div.appendChild(label);
        // Remove button
        var rmBtn = document.createElement('button');
        rmBtn.textContent = '✕';
        rmBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--danger,#e74c3c);font-size:14px;padding:2px 6px';
        rmBtn.title = isEN ? 'Remove layer' : '删除图层';
        rmBtn.addEventListener('click', function() {
          layers.splice(i, 1);
          renderLayers();
          updatePreview();
        });
        div.appendChild(rmBtn);
        layerList.appendChild(div);
      });
    }

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    // Add current layer to multi-shadow
    function addLayer() {
      var layer = getCurrentLayer();
      layers.push(layer);
      renderLayers();
      updatePreview();
      showMsg(T('已添加阴影图层', 'Shadow layer added'), false);
    }

    function clearAll() {
      layers = [];
      renderLayers();
      hOffset.value = '2';
      vOffset.value = '2';
      blur.value = '5';
      spread.value = '0';
      color.value = '#000000';
      opacity.value = '0.3';
      inset.checked = false;
      updatePreview();
      showMsg('', false);
    }

    // Event bindings
    [hOffset, vOffset, blur, spread, color, opacity, inset].forEach(function(el) {
      if (el) el.addEventListener('input', updatePreview);
    });

    if (addBtn) addBtn.addEventListener('click', addLayer);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', function () {
      if (output.value) {
        navigator.clipboard.writeText(output.value).then(function () {
          showMsg(T('已复制 CSS 代码', 'CSS copied to clipboard'), false);
        });
      }
    });

    // Preset buttons
    document.querySelectorAll('[data-bs-preset]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var preset = JSON.parse(btn.dataset.bsPreset);
        hOffset.value = preset.h || 0;
        vOffset.value = preset.v || 0;
        blur.value = preset.blur || 0;
        spread.value = preset.spread || 0;
        color.value = preset.color || '#000000';
        opacity.value = preset.opacity || 0.3;
        inset.checked = preset.inset || false;
        updatePreview();
      });
    });

    // Initial render
    clearAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();