/**
 * CSS to JS Converter - Pure CSS to CSS-in-JS (camelCase) converter
 * Supports three output modes: JS object, inline style, styled-components.
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('c2j-input');
    const output = document.getElementById('c2j-output');
    const convertBtn = document.getElementById('c2j-convert-btn');
    const copyBtn = document.getElementById('c2j-copy-btn');
    const clearBtn = document.getElementById('c2j-clear-btn');
    const modeRadios = document.querySelectorAll('input[name="c2j-mode"]');
    const statsEl = document.getElementById('c2j-stats');
    const isEN = document.documentElement.lang === 'en';
    if (!input || !output || !convertBtn) return;
    const T = (zh, en) => isEN ? en : zh;

    function getMode() {
        for (const r of modeRadios) { if (r.checked) return r.value; }
        return 'object';
    }

    const cssToCamel = {
        'align-content':'alignContent','align-items':'alignItems','align-self':'alignSelf',
        'animation-delay':'animationDelay','animation-direction':'animationDirection',
        'animation-duration':'animationDuration','animation-fill-mode':'animationFillMode',
        'animation-iteration-count':'animationIterationCount','animation-name':'animationName',
        'animation-play-state':'animationPlayState','animation-timing-function':'animationTimingFunction',
        'backface-visibility':'backfaceVisibility','background-attachment':'backgroundAttachment',
        'background-blend-mode':'backgroundBlendMode','background-clip':'backgroundClip',
        'background-color':'backgroundColor','background-image':'backgroundImage',
        'background-origin':'backgroundOrigin','background-position':'backgroundPosition',
        'background-repeat':'backgroundRepeat','background-size':'backgroundSize',
        'border-bottom-color':'borderBottomColor','border-bottom-left-radius':'borderBottomLeftRadius',
        'border-bottom-right-radius':'borderBottomRightRadius','border-bottom-style':'borderBottomStyle',
        'border-bottom-width':'borderBottomWidth','border-collapse':'borderCollapse',
        'border-color':'borderColor','border-image':'borderImage',
        'border-image-outset':'borderImageOutset','border-image-repeat':'borderImageRepeat',
        'border-image-slice':'borderImageSlice','border-image-source':'borderImageSource',
        'border-image-width':'borderImageWidth','border-left-color':'borderLeftColor',
        'border-left-style':'borderLeftStyle','border-left-width':'borderLeftWidth',
        'border-radius':'borderRadius','border-right-color':'borderRightColor',
        'border-right-style':'borderRightStyle','border-right-width':'borderRightWidth',
        'border-spacing':'borderSpacing','border-style':'borderStyle',
        'border-top-color':'borderTopColor','border-top-left-radius':'borderTopLeftRadius',
        'border-top-right-radius':'borderTopRightRadius','border-top-style':'borderTopStyle',
        'border-top-width':'borderTopWidth','border-width':'borderWidth',
        'box-shadow':'boxShadow','box-sizing':'boxSizing',
        'break-after':'breakAfter','break-before':'breakBefore','break-inside':'breakInside',
        'caption-side':'captionSide','caret-color':'caretColor','clip-path':'clipPath',
        'column-count':'columnCount','column-fill':'columnFill','column-gap':'columnGap',
        'column-rule':'columnRule','column-rule-color':'columnRuleColor',
        'column-rule-style':'columnRuleStyle','column-rule-width':'columnRuleWidth',
        'column-span':'columnSpan','column-width':'columnWidth',
        'counter-increment':'counterIncrement','counter-reset':'counterReset',
        'empty-cells':'emptyCells',
        'flex-basis':'flexBasis','flex-direction':'flexDirection','flex-flow':'flexFlow',
        'flex-grow':'flexGrow','flex-shrink':'flexShrink','flex-wrap':'flexWrap',
        'font-family':'fontFamily','font-feature-settings':'fontFeatureSettings',
        'font-kerning':'fontKerning','font-size':'fontSize','font-size-adjust':'fontSizeAdjust',
        'font-stretch':'fontStretch','font-style':'fontStyle','font-synthesis':'fontSynthesis',
        'font-variant':'fontVariant','font-variant-caps':'fontVariantCaps',
        'font-variant-east-asian':'fontVariantEastAsian','font-variant-ligatures':'fontVariantLigatures',
        'font-variant-numeric':'fontVariantNumeric','font-variant-position':'fontVariantPosition',
        'font-weight':'fontWeight',
        'grid-area':'gridArea','grid-auto-columns':'gridAutoColumns','grid-auto-flow':'gridAutoFlow',
        'grid-auto-rows':'gridAutoRows','grid-column':'gridColumn','grid-column-end':'gridColumnEnd',
        'grid-column-gap':'gridColumnGap','grid-column-start':'gridColumnStart',
        'grid-gap':'gridGap','grid-row':'gridRow','grid-row-end':'gridRowEnd',
        'grid-row-gap':'gridRowGap','grid-row-start':'gridRowStart',
        'grid-template':'gridTemplate','grid-template-areas':'gridTemplateAreas',
        'grid-template-columns':'gridTemplateColumns','grid-template-rows':'gridTemplateRows',
        'hanging-punctuation':'hangingPunctuation','image-rendering':'imageRendering',
        'justify-content':'justifyContent','justify-items':'justifyItems','justify-self':'justifySelf',
        'letter-spacing':'letterSpacing','line-break':'lineBreak','line-height':'lineHeight',
        'list-style':'listStyle','list-style-image':'listStyleImage',
        'list-style-position':'listStylePosition','list-style-type':'listStyleType',
        'margin-bottom':'marginBottom','margin-left':'marginLeft','margin-right':'marginRight',
        'margin-top':'marginTop',
        'mask-clip':'maskClip','mask-composite':'maskComposite','mask-image':'maskImage',
        'mask-mode':'maskMode','mask-origin':'maskOrigin','mask-position':'maskPosition',
        'mask-repeat':'maskRepeat','mask-size':'maskSize','mask-type':'maskType',
        'max-height':'maxHeight','max-width':'maxWidth','min-height':'minHeight','min-width':'minWidth',
        'mix-blend-mode':'mixBlendMode','object-fit':'objectFit','object-position':'objectPosition',
        'outline-color':'outlineColor','outline-offset':'outlineOffset',
        'outline-style':'outlineStyle','outline-width':'outlineWidth',
        'overflow-wrap':'overflowWrap','overflow-x':'overflowX','overflow-y':'overflowY',
        'padding-bottom':'paddingBottom','padding-left':'paddingLeft','padding-right':'paddingRight',
        'padding-top':'paddingTop',
        'page-break-after':'pageBreakAfter','page-break-before':'pageBreakBefore',
        'page-break-inside':'pageBreakInside',
        'perspective':'perspective','perspective-origin':'perspectiveOrigin',
        'pointer-events':'pointerEvents','row-gap':'rowGap',
        'scroll-behavior':'scrollBehavior','tab-size':'tabSize','table-layout':'tableLayout',
        'text-align':'textAlign','text-align-last':'textAlignLast',
        'text-combine-upright':'textCombineUpright','text-decoration':'textDecoration',
        'text-decoration-color':'textDecorationColor','text-decoration-line':'textDecorationLine',
        'text-decoration-style':'textDecorationStyle','text-decoration-thickness':'textDecorationThickness',
        'text-emphasis':'textEmphasis','text-emphasis-color':'textEmphasisColor',
        'text-emphasis-position':'textEmphasisPosition','text-emphasis-style':'textEmphasisStyle',
        'text-indent':'textIndent','text-justify':'textJustify','text-orientation':'textOrientation',
        'text-overflow':'textOverflow','text-rendering':'textRendering','text-shadow':'textShadow',
        'text-transform':'textTransform','text-underline-offset':'textUnderlineOffset',
        'text-underline-position':'textUnderlinePosition','touch-action':'touchAction',
        'transform-box':'transformBox','transform-origin':'transformOrigin','transform-style':'transformStyle',
        'transition':'transition','transition-delay':'transitionDelay','transition-duration':'transitionDuration',
        'transition-property':'transitionProperty','transition-timing-function':'transitionTimingFunction',
        'unicode-bidi':'unicodeBidi','user-select':'userSelect','vertical-align':'verticalAlign',
        'white-space':'whiteSpace','will-change':'willChange','word-break':'wordBreak',
        'word-spacing':'wordSpacing','word-wrap':'wordWrap','writing-mode':'writingMode','z-index':'zIndex'
    };

    function toCamelCase(prop) {
        if (cssToCamel[prop]) return cssToCamel[prop];
        return prop.replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); });
    }

    function parseCSS(css) {
        const rules = [];
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        const ruleRegex = /([^{]+)\{([^}]*)\}/g;
        let match;
        while ((match = ruleRegex.exec(css)) !== null) {
            const selector = match[1].trim().replace(/[\n\r]+/g, ' ');
            const body = match[2].trim();
            const declarations = [];
            const decls = body.split(';');
            for (const decl of decls) {
                const colonIdx = decl.indexOf(':');
                if (colonIdx > 0) {
                    const prop = decl.substring(0, colonIdx).trim();
                    const val = decl.substring(colonIdx + 1).trim();
                    if (prop && val) declarations.push({ prop: prop, val: val });
                }
            }
            if (declarations.length > 0) rules.push({ selector: selector, declarations: declarations });
        }
        return rules;
    }

    function fmtVal(val) {
        const nv = parseFloat(val);
        const isNum = !isNaN(nv) && val === String(nv);
        const isDim = /^-?\d+(\.\d+)?(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax|s|ms|deg|rad|grad|turn)$/.test(val);
        const isQ = (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"));
        const isVar = val.startsWith('var(');
        const isUrl = val.startsWith('url(');
        const isFn = /^[a-z-]+\(.*\)$/i.test(val) && !isQ && !isVar && !isUrl;
        if (isNum) return val;
        if (isDim) return '"' + val + '"';
        if (isQ) return val;
        if (isVar || isUrl || isFn) return '"' + val.replace(/"/g, '\\"') + '"';
        return '"' + val + '"';
    }

    function convertToObject(rules) {
        let r = '';
        rules.forEach(function(rule, idx) {
            if (idx > 0) r += '\n\n';
            r += 'const styles = {\n  "' + rule.selector + '": {\n';
            rule.declarations.forEach(function(decl, di) {
                r += '    ' + toCamelCase(decl.prop) + ': ' + fmtVal(decl.val);
                if (di < rule.declarations.length - 1) r += ',';
                r += '\n';
            });
            r += '  }\n};\n';
        });
        return r;
    }

    function convertToInline(rules) {
        let r = '';
        rules.forEach(function(rule, idx) {
            if (idx > 0) r += '\n\n';
            r += '// ' + rule.selector + '\nstyle={{\n';
            rule.declarations.forEach(function(decl, di) {
                r += '  ' + toCamelCase(decl.prop) + ': ' + fmtVal(decl.val);
                if (di < rule.declarations.length - 1) r += ',';
                r += '\n';
            });
            r += '}}';
        });
        return r;
    }

    function convertToStyled(rules) {
        let r = '';
        rules.forEach(function(rule, idx) {
            if (idx > 0) r += '\n\n';
            var cn = rule.selector.replace(/^\./, '').replace(/^[a-z]/, function(c) { return c.toUpperCase(); }).replace(/-([a-z])/g, function(_, c) { return c.toUpperCase(); });
            r += 'const ' + cn + ' = styled.div`\n  ' + rule.selector + ' {\n';
            rule.declarations.forEach(function(decl) {
                r += '    ' + decl.prop + ': ' + decl.val + ';\n';
            });
            r += '  }\n`;\n';
        });
        return r;
    }

    function process() {
        const code = input.value;
        if (!code.trim()) { output.value = ''; if (statsEl) statsEl.innerHTML = ''; return; }
        const mode = getMode();
        const rules = parseCSS(code);
        if (rules.length === 0) {
            output.value = T('未能解析 CSS 规则。请检查 CSS 语法是否正确。', 'Could not parse CSS rules. Please check your CSS syntax.');
            if (statsEl) statsEl.innerHTML = T('⚠️ 解析失败', '⚠️ Parse failed');
            return;
        }
        var result;
        switch (mode) {
            case 'object': result = convertToObject(rules); break;
            case 'inline': result = convertToInline(rules); break;
            case 'styled': result = convertToStyled(rules); break;
            default: result = convertToObject(rules);
        }
        output.value = result;
        const bb = new TextEncoder().encode(code).length;
        const ab = new TextEncoder().encode(result).length;
        const rc = rules.length;
        const dc = rules.reduce(function(s, r) { return s + r.declarations.length; }, 0);
        if (statsEl) statsEl.innerHTML = T('解析了 ' + rc + ' 条规则，' + dc + ' 个声明 | 输入 ' + fmtB(bb) + ' → 输出 ' + fmtB(ab), 'Parsed ' + rc + ' rules, ' + dc + ' declarations | Input ' + fmtB(bb) + ' → Output ' + fmtB(ab));
    }

    function fmtB(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    convertBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', function() {
        if (output.value) navigator.clipboard.writeText(output.value).then(function() { toast(T('已复制!', 'Copied!')); });
    });
    clearBtn.addEventListener('click', function() { input.value = ''; output.value = ''; if (statsEl) statsEl.innerHTML = ''; input.focus(); });
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); process(); }
    });
}

if (typeof toast !== 'function') {
    window.toast = function(msg) {
        var el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:8px;font-size:14px;z-index:9999;transition:opacity .3s';
        document.body.appendChild(el);
        setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 2000);
    };
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();