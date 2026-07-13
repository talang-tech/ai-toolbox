/**
 * Color Contrast Checker — WCAG contrast ratio calculator
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const fgPicker = document.getElementById('cc-fg-picker');
    const fgInput = document.getElementById('cc-fg-input');
    const bgPicker = document.getElementById('cc-bg-picker');
    const bgInput = document.getElementById('cc-bg-input');
    const ratioEl = document.getElementById('cc-ratio');
    const aaEl = document.getElementById('cc-aa');
    const aaLargeEl = document.getElementById('cc-aa-large');
    const aaaEl = document.getElementById('cc-aaa');
    const aaaLargeEl = document.getElementById('cc-aaa-large');
    const previewEl = document.getElementById('cc-preview');
    const resultEl = document.getElementById('cc-result');
    const isEN = document.documentElement.lang === 'en';

    if (!fgInput || !bgInput) return;

    // --- Color parsing helpers ---

    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    // Parse a color string (hex / rgb / hsl) into {r,g,b} 0-255, or null if invalid
    function parseColor(str) {
        if (!str) return null;
        var s = str.trim().toLowerCase();

        // Hex: #fff, #ffffff, #ffff (4-digit with alpha), #ffffffff (8-digit)
        var hexMatch = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
        if (hexMatch) {
            var hex = hexMatch[1];
            var r, g, b;
            if (hex.length === 3 || hex.length === 4) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
            }
            return { r: r, g: g, b: b };
        }

        // rgb / rgba
        var rgbMatch = s.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*[\d.%]+\s*)?\)$/);
        if (rgbMatch) {
            var rr = parseColorChannel(rgbMatch[1]);
            var gg = parseColorChannel(rgbMatch[2]);
            var bb = parseColorChannel(rgbMatch[3]);
            return { r: clamp(rr, 0, 255), g: clamp(gg, 0, 255), b: clamp(bb, 0, 255) };
        }

        // hsl / hsla
        var hslMatch = s.match(/^hsla?\(\s*([\d.]+)\s*(?:deg)?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*(?:[,/]\s*[\d.%]+\s*)?\)$/);
        if (hslMatch) {
            var h = parseFloat(hslMatch[1]);
            var sat = parseFloat(hslMatch[2]) / 100;
            var light = parseFloat(hslMatch[3]) / 100;
            return hslToRgb(h, clamp(sat, 0, 1), clamp(light, 0, 1));
        }

        return null;
    }

    function parseColorChannel(v) {
        if (v.indexOf('%') !== -1) {
            return Math.round(parseFloat(v) / 100 * 255);
        }
        return Math.round(parseFloat(v));
    }

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360 / 360;
        var r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            var hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function rgbToHex(c) {
        function h(v) {
            var s = clamp(Math.round(v), 0, 255).toString(16);
            return s.length === 1 ? '0' + s : s;
        }
        return '#' + h(c.r) + h(c.g) + h(c.b);
    }

    // --- Luminance & contrast ---

    function relativeLuminance(c) {
        var channels = [c.r, c.g, c.b].map(function(v) {
            var srgb = v / 255;
            return srgb <= 0.04045
                ? srgb / 12.92
                : Math.pow((srgb + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    function contrastRatio(c1, c2) {
        var l1 = relativeLuminance(c1);
        var l2 = relativeLuminance(c2);
        var lighter = Math.max(l1, l2);
        var darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // --- Rendering ---

    function setPassFail(el, pass) {
        if (!el) return;
        var passTxt = isEN ? '✓ Pass' : '✓ 通过';
        var failTxt = isEN ? '✗ Fail' : '✗ 未通过';
        el.textContent = pass ? passTxt : failTxt;
        el.style.color = pass ? '#16a34a' : '#dc2626';
        el.classList.remove('pass', 'fail');
        el.classList.add(pass ? 'pass' : 'fail');
    }

    function update() {
        var fg = parseColor(fgInput.value);
        var bg = parseColor(bgInput.value);

        if (!fg || !bg) {
            if (ratioEl) ratioEl.textContent = '—';
            [aaEl, aaLargeEl, aaaEl, aaaLargeEl].forEach(function(el) {
                if (el) {
                    el.textContent = '—';
                    el.style.color = '';
                    el.classList.remove('pass', 'fail');
                }
            });
            return;
        }

        var ratio = contrastRatio(fg, bg);
        var ratioStr = ratio.toFixed(1) + ':1';
        if (ratioEl) ratioEl.textContent = ratioStr;

        setPassFail(aaEl, ratio >= 4.5);
        setPassFail(aaLargeEl, ratio >= 3);
        setPassFail(aaaEl, ratio >= 7);
        setPassFail(aaaLargeEl, ratio >= 4.5);

        if (previewEl) {
            previewEl.style.backgroundColor = rgbToHex(bg);
            previewEl.style.color = rgbToHex(fg);
        }
    }

    // --- Sync picker <-> text input ---

    function syncFromPicker(picker, textEl) {
        if (!picker) return;
        picker.addEventListener('input', function() {
            textEl.value = picker.value;
            update();
        });
    }

    function syncFromText(textEl, picker) {
        textEl.addEventListener('input', function() {
            var c = parseColor(textEl.value);
            if (c && picker) {
                picker.value = rgbToHex(c);
            }
            update();
        });
    }

    syncFromPicker(fgPicker, fgInput);
    syncFromPicker(bgPicker, bgInput);
    syncFromText(fgInput, fgPicker);
    syncFromText(bgInput, bgPicker);

    // Initialize text inputs from pickers if empty
    if (fgPicker && !fgInput.value) fgInput.value = fgPicker.value;
    if (bgPicker && !bgInput.value) bgInput.value = bgPicker.value;
    // Or sync pickers from any preset text values
    var fgInit = parseColor(fgInput.value);
    if (fgInit && fgPicker) fgPicker.value = rgbToHex(fgInit);
    var bgInit = parseColor(bgInput.value);
    if (bgInit && bgPicker) bgPicker.value = rgbToHex(bgInit);

    update();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();
