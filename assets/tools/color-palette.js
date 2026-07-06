(function() {
  'use strict';

  const isEN = window.location.pathname.startsWith('/en/');

  // HSL to Hex
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return '#' + [r, g, b].map(function(v) {
      return v.toString(16).padStart(2, '0');
    }).join('');
  }

  // Hex to HSL
  function hexToHSL(hex) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function generatePalettes(h, s, l) {
    return {
      complementary: [
        hslToHex(h, s, l),
        hslToHex(h, s, Math.max(0, l - 15)),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 180) % 360, s, Math.min(100, l + 15)),
        hslToHex((h + 180) % 360, s, Math.max(0, l - 10))
      ],
      analogous: [
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h - 15 + 360) % 360, s, l),
        hslToHex(h, s, l),
        hslToHex((h + 15) % 360, s, l),
        hslToHex((h + 30) % 360, s, l)
      ],
      triadic: [
        hslToHex(h, s, l),
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex((h + 120) % 360, s, Math.max(0, l - 12)),
        hslToHex((h + 240) % 360, s, Math.max(0, l - 12))
      ],
      tetradic: [
        hslToHex(h, s, l),
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
        hslToHex(h, s, Math.max(0, l - 15))
      ],
      monochromatic: [
        hslToHex(h, s, Math.max(0, l - 30)),
        hslToHex(h, s, Math.max(0, l - 15)),
        hslToHex(h, s, l),
        hslToHex(h, s, Math.min(100, l + 15)),
        hslToHex(h, s, Math.min(100, l + 30))
      ]
    };
  }

  // Scheme names
  var schemeNamesZH = {
    complementary: '互补色 (180°)',
    analogous: '类似色 (30°)',
    triadic: '三角色 (120°)',
    tetradic: '四角色 (90°)',
    monochromatic: '单色'
  };

  var schemeNamesEN = {
    complementary: 'Complementary (180°)',
    analogous: 'Analogous (30°)',
    triadic: 'Triadic (120°)',
    tetradic: 'Tetradic (90°)',
    monochromatic: 'Monochromatic'
  };

  var schemeIcons = {
    complementary: '🔄',
    analogous: '🌈',
    triadic: '🔺',
    tetradic: '🔲',
    monochromatic: '🎨'
  };

  function render() {
    var hex = document.getElementById('cpBase').value;
    var hsl = hexToHSL(hex);
    var palettes = generatePalettes(hsl.h, hsl.s, hsl.l);
    var result = document.getElementById('cpResults');
    if (!result) return;

    var names = isEN ? schemeNamesEN : schemeNamesZH;
    var html = '';
    Object.keys(palettes).forEach(function(key) {
      var colors = palettes[key];
      html += '<div style="margin-bottom:16px">';
      html += '<div style="font-size:14px;font-weight:600;margin-bottom:6px">' + schemeIcons[key] + ' ' + names[key] + '</div>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
      colors.forEach(function(color) {
        var isLight = true;
        var rgb = {
          r: parseInt(color.slice(1,3), 16),
          g: parseInt(color.slice(3,5), 16),
          b: parseInt(color.slice(5,7), 16)
        };
        var brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        var textColor = brightness > 128 ? '#333' : '#fff';
        html += '<div onclick="cpCopyColor(\'' + color + '\')" style="cursor:pointer;width:64px;height:64px;border-radius:8px;background:' + color + ';display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;font-family:monospace;color:' + textColor + ';border:1px solid ' + (brightness > 200 ? '#ddd' : 'transparent') + ';transition:transform 0.15s;position:relative" onmouseover="this.style.transform=\'scale(1.08)\'" onmouseout="this.style.transform=\'scale(1)\'" title="' + (isEN ? 'Click to copy' : '点击复制') + '">';
        html += '<span style="font-weight:600">' + color + '</span>';
        html += '<span style="font-size:9px;opacity:0.8;margin-top:2px">' + (isEN ? 'copy' : '复制') + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });

    result.innerHTML = html;
  }

  window.cpGenerate = function() {
    var hex = document.getElementById('cpBase').value;
    document.getElementById('cpHexInput').value = hex;
    render();
  };

  window.cpFromHex = function() {
    var input = document.getElementById('cpHexInput').value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(input)) {
      document.getElementById('cpBase').value = input;
      render();
    }
  };

  window.cpCopyColor = function(hex) {
    navigator.clipboard.writeText(hex).then(function() {
      toast(isEN ? 'Copied: ' + hex : '已复制: ' + hex);
    }).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast(isEN ? 'Copied: ' + hex : '已复制: ' + hex);
    });
  };

  function init() {
    var base = document.getElementById('cpBase');
    var hexInput = document.getElementById('cpHexInput');
    var result = document.getElementById('cpResults');
    if (!base || !result) return;
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();