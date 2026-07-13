/**
 * CSS Animation Generator — create @keyframes animations with live preview
 * AI Toolbox - Privacy-first browser-local tool
 */
(function() {
'use strict';

function init() {
    const typeEl = document.getElementById('ca-type');
    const durationEl = document.getElementById('ca-duration');
    const timingEl = document.getElementById('ca-timing');
    const delayEl = document.getElementById('ca-delay');
    const iterationEl = document.getElementById('ca-iteration');
    const directionEl = document.getElementById('ca-direction');
    const fillEl = document.getElementById('ca-fill');
    const previewEl = document.getElementById('ca-preview');
    const outputEl = document.getElementById('ca-output');
    const copyBtn = document.getElementById('ca-copy-btn');
    const statusEl = document.getElementById('ca-status');
    const isEN = document.documentElement.lang === 'en';

    if (!typeEl || !durationEl || !previewEl || !outputEl) return;

    // --- Animation definitions ---

    var ANIMATIONS = {
        'fadeIn': {
            label_zh: '淡入',
            label_en: 'Fade In',
            keyframes: [
                { pct: 0, css: 'opacity:0' },
                { pct: 100, css: 'opacity:1' }
            ]
        },
        'fadeOut': {
            label_zh: '淡出',
            label_en: 'Fade Out',
            keyframes: [
                { pct: 0, css: 'opacity:1' },
                { pct: 100, css: 'opacity:0' }
            ]
        },
        'slideInLeft': {
            label_zh: '从左滑入',
            label_en: 'Slide In Left',
            keyframes: [
                { pct: 0, css: 'transform:translateX(-100px);opacity:0' },
                { pct: 100, css: 'transform:translateX(0);opacity:1' }
            ]
        },
        'slideInRight': {
            label_zh: '从右滑入',
            label_en: 'Slide In Right',
            keyframes: [
                { pct: 0, css: 'transform:translateX(100px);opacity:0' },
                { pct: 100, css: 'transform:translateX(0);opacity:1' }
            ]
        },
        'slideInUp': {
            label_zh: '从下滑入',
            label_en: 'Slide In Up',
            keyframes: [
                { pct: 0, css: 'transform:translateY(100px);opacity:0' },
                { pct: 100, css: 'transform:translateY(0);opacity:1' }
            ]
        },
        'slideInDown': {
            label_zh: '从上滑入',
            label_en: 'Slide In Down',
            keyframes: [
                { pct: 0, css: 'transform:translateY(-100px);opacity:0' },
                { pct: 100, css: 'transform:translateY(0);opacity:1' }
            ]
        },
        'bounce': {
            label_zh: '弹跳',
            label_en: 'Bounce',
            keyframes: [
                { pct: '0,20,53,80,100', css: 'animation-timing-function:cubic-bezier(0.215,0.61,0.355,1);transform:translateY(0)' },
                { pct: '40,43', css: 'animation-timing-function:cubic-bezier(0.755,0.05,0.855,0.06);transform:translateY(-30px)' },
                { pct: 70, css: 'animation-timing-function:cubic-bezier(0.755,0.05,0.855,0.06);transform:translateY(-15px)' },
                { pct: 90, css: 'transform:translateY(-4px)' }
            ]
        },
        'shake': {
            label_zh: '抖动',
            label_en: 'Shake',
            keyframes: [
                { pct: '0,100', css: 'transform:translateX(0)' },
                { pct: '10,30,50,70,90', css: 'transform:translateX(-5px)' },
                { pct: '20,40,60,80', css: 'transform:translateX(5px)' }
            ]
        },
        'rotate': {
            label_zh: '旋转',
            label_en: 'Rotate',
            keyframes: [
                { pct: 0, css: 'transform:rotate(0deg)' },
                { pct: 100, css: 'transform:rotate(360deg)' }
            ]
        },
        'pulse': {
            label_zh: '脉冲',
            label_en: 'Pulse',
            keyframes: [
                { pct: '0,100', css: 'transform:scale(1)' },
                { pct: 50, css: 'transform:scale(1.1)' }
            ]
        },
        'flip': {
            label_zh: '翻转',
            label_en: 'Flip',
            keyframes: [
                { pct: 0, css: 'transform:perspective(400px) rotateY(0)' },
                { pct: 100, css: 'transform:perspective(400px) rotateY(360deg)' }
            ]
        },
        'zoomIn': {
            label_zh: '放大进入',
            label_en: 'Zoom In',
            keyframes: [
                { pct: 0, css: 'transform:scale(0);opacity:0' },
                { pct: 100, css: 'transform:scale(1);opacity:1' }
            ]
        },
        'zoomOut': {
            label_zh: '缩小退出',
            label_en: 'Zoom Out',
            keyframes: [
                { pct: 0, css: 'transform:scale(1);opacity:1' },
                { pct: 100, css: 'transform:scale(0);opacity:0' }
            ]
        },
        'slideOutLeft': {
            label_zh: '向左滑出',
            label_en: 'Slide Out Left',
            keyframes: [
                { pct: 0, css: 'transform:translateX(0);opacity:1' },
                { pct: 100, css: 'transform:translateX(-100px);opacity:0' }
            ]
        },
        'slideOutRight': {
            label_zh: '向右滑出',
            label_en: 'Slide Out Right',
            keyframes: [
                { pct: 0, css: 'transform:translateX(0);opacity:1' },
                { pct: 100, css: 'transform:translateX(100px);opacity:0' }
            ]
        },
        'heartBeat': {
            label_zh: '心跳',
            label_en: 'Heart Beat',
            keyframes: [
                { pct: '0,100', css: 'transform:scale(1)' },
                { pct: 14, css: 'transform:scale(1.3)' },
                { pct: 28, css: 'transform:scale(1)' },
                { pct: 42, css: 'transform:scale(1.3)' },
                { pct: 70, css: 'transform:scale(1)' }
            ]
        }
    };

    // --- Generate CSS ---

    function generateCSS() {
        var type = typeEl.value;
        var duration = parseFloat(durationEl.value) || 1;
        var timing = timingEl.value;
        var delay = parseFloat(delayEl.value) || 0;
        var iteration = iterationEl.value;
        var direction = directionEl.value;
        var fill = fillEl.value;

        var anim = ANIMATIONS[type];
        if (!anim) return { css: '', className: '' };

        var name = 'anim-' + type;
        var keyframes = '@keyframes ' + name + ' {\n';
        for (var i = 0; i < anim.keyframes.length; i++) {
            var kf = anim.keyframes[i];
            var pcts = typeof kf.pct === 'number' ? [kf.pct] : kf.pct.split(',');
            for (var j = 0; j < pcts.length; j++) {
                keyframes += '  ' + pcts[j] + '% { ' + kf.css + ' }\n';
            }
        }
        keyframes += '}\n';

        var className = '.anim-' + type + ' {\n';
        className += '  animation-name: ' + name + ';\n';
        className += '  animation-duration: ' + duration + 's;\n';
        className += '  animation-timing-function: ' + timing + ';\n';
        if (delay > 0) className += '  animation-delay: ' + delay + 's;\n';
        className += '  animation-iteration-count: ' + iteration + ';\n';
        className += '  animation-direction: ' + direction + ';\n';
        className += '  animation-fill-mode: ' + fill + ';\n';
        className += '}\n';

        return { css: keyframes + '\n' + className, className: 'anim-' + type, name: name };
    }

    function update() {
        var result = generateCSS();
        outputEl.value = result.css;

        // Update preview
        var type = typeEl.value;
        var anim = ANIMATIONS[type];
        var label = isEN ? 'Preview' : '预览';
        previewEl.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-size:28px;font-weight:bold">' + label + '</div>';

        var duration = parseFloat(durationEl.value) || 1;
        var timing = timingEl.value;
        var delay = parseFloat(delayEl.value) || 0;
        var iteration = iterationEl.value === 'infinite' ? 'infinite' : '1';
        var direction = directionEl.value;
        var fill = fillEl.value;

        // Create a style element for preview
        var styleId = 'ca-preview-style';
        var oldStyle = document.getElementById(styleId);
        if (oldStyle) oldStyle.remove();

        var style = document.createElement('style');
        style.id = styleId;
        style.textContent = result.css;
        document.head.appendChild(style);

        var previewElDiv = previewEl.querySelector('div');
        if (previewElDiv) {
            previewElDiv.style.animation = 'none';
            previewElDiv.style.animationDelay = '0s';
            // Force reflow
            void previewElDiv.offsetHeight;
            previewElDiv.style.animation = result.name + ' ' + duration + 's ' + timing + ' ' + delay + 's ' + iteration + ' ' + direction + ' ' + fill;
        }

        statusEl.textContent = '';
    }

    // --- Copy ---

    copyBtn.addEventListener('click', function() {
        if (outputEl.value) {
            navigator.clipboard.writeText(outputEl.value).then(function() {
                copyBtn.textContent = isEN ? '✓ Copied!' : '✓ 已复制!';
                setTimeout(function() {
                    copyBtn.textContent = isEN ? '📋 Copy CSS' : '📋 复制 CSS';
                }, 2000);
            }).catch(function() {
                // Fallback
                outputEl.select();
                document.execCommand('copy');
                copyBtn.textContent = isEN ? '✓ Copied!' : '✓ 已复制!';
                setTimeout(function() {
                    copyBtn.textContent = isEN ? '📋 Copy CSS' : '📋 复制 CSS';
                }, 2000);
            });
        }
    });

    // --- Event bindings ---

    typeEl.addEventListener('change', update);
    durationEl.addEventListener('input', update);
    timingEl.addEventListener('change', update);
    delayEl.addEventListener('input', update);
    iterationEl.addEventListener('change', update);
    directionEl.addEventListener('change', update);
    fillEl.addEventListener('change', update);

    // Initial render
    update();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();