/**
 * CSS Clip-Path Generator
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
    'use strict';

    const shapeType = document.getElementById('ccp-shape-type');
    const closest = document.getElementById('ccp-closest');
    const vertices = document.getElementById('ccp-vertices');
    const verticesVal = document.getElementById('ccp-vertices-val');
    const preview = document.getElementById('ccp-clip-area');
    const previewContainer = document.getElementById('ccp-preview');
    const output = document.getElementById('ccp-output');
    const copyBtn = document.getElementById('ccp-copy');
    const copyClipBtn = document.getElementById('ccp-copy-clip');
    const controls = document.getElementById('ccp-controls');
    const presetBtns = document.querySelectorAll('.ccp-preset');

    if (!shapeType || !output || !preview) return;

    function generateClipPath() {
        const type = shapeType.value;
        let clipPath = '';

        if (type === 'polygon') {
            const n = parseInt(vertices.value);
            const points = [];
            for (let i = 0; i < n; i++) {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const cx = 50 + 45 * Math.cos(angle);
                const cy = 50 + 45 * Math.sin(angle);
                points.push(`${cx.toFixed(1)}% ${cy.toFixed(1)}%`);
            }
            clipPath = `polygon(${points.join(', ')})`;
        } else if (type === 'circle') {
            clipPath = `circle(${closest.value} at 50% 50%)`;
        } else if (type === 'ellipse') {
            clipPath = `ellipse(50% 50% at 50% 50%)`;
        } else if (type === 'inset') {
            clipPath = `inset(20% round 10%)`;
        }

        preview.style.clipPath = clipPath;
        preview.style.webkitClipPath = clipPath;
        output.value = `.clipped-element {\n  clip-path: ${clipPath};\n}`;
        return clipPath;
    }

    function applyPreset(btn) {
        const type = btn.dataset.type;
        const value = btn.dataset.value;
        shapeType.value = type;

        let clipPath = '';
        if (type === 'polygon') {
            clipPath = `polygon(${value})`;
        } else if (type === 'circle') {
            clipPath = `circle(${value})`;
        } else if (type === 'ellipse') {
            clipPath = `ellipse(${value})`;
        } else if (type === 'inset') {
            clipPath = `inset(${value})`;
        }

        // Show/hide controls based on type
        const polyControls = controls.querySelector('div:not(:first-child)');
        if (polyControls) {
            polyControls.style.display = type === 'polygon' ? 'block' : 'none';
        }
        const closestControls = controls.querySelector('div:first-child');
        if (closestControls) {
            closestControls.style.display = type === 'circle' ? 'block' : 'none';
        }

        preview.style.clipPath = clipPath;
        preview.style.webkitClipPath = clipPath;
        output.value = `.clipped-element {\n  clip-path: ${clipPath};\n}`;
    }

    // Shape type change
    shapeType.addEventListener('change', function() {
        generateClipPath();
    });

    // Vertices slider
    if (vertices) {
        vertices.addEventListener('input', function() {
            verticesVal.textContent = this.value;
            generateClipPath();
        });
    }

    // Closest side change
    if (closest) {
        closest.addEventListener('change', generateClipPath);
    }

    // Presets
    presetBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            applyPreset(this);
        });
    });

    // Copy CSS
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const text = output.value;
            if (!text) return;
            navigator.clipboard.writeText(text).then(function() {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.textContent = isEN ? 'Copied!' : '已复制!';
                    toast.classList.add('show');
                    setTimeout(function() { toast.classList.remove('show'); }, 1800);
                }
            });
        });
    }

    // Copy clip-path value
    if (copyClipBtn) {
        copyClipBtn.addEventListener('click', function() {
            const match = output.value.match(/clip-path: (.+);/);
            if (match) {
                navigator.clipboard.writeText(match[1]).then(function() {
                    const toast = document.getElementById('toast');
                    if (toast) {
                        toast.textContent = isEN ? 'Cloning value copied!' : 'clip-path 值已复制!';
                        toast.classList.add('show');
                        setTimeout(function() { toast.classList.remove('show'); }, 1800);
                    }
                });
            }
        });
    }

    // Initialize
    generateClipPath();
})();