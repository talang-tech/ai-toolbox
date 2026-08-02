/**
 * CSS to LESS Converter - Converts flat CSS to nested LESS syntax
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('css2less-input');
    const output = document.getElementById('css2less-output');
    const convertBtn = document.getElementById('css2less-convert');
    const copyBtn = document.getElementById('css2less-copy');
    const clearBtn = document.getElementById('css2less-clear');
    const statusEl = document.getElementById('css2less-status');
    const statsEl = document.getElementById('css2less-stats');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !convertBtn) return;

    // Parse CSS into rules
    function parseCSS(css) {
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        const rules = [];
        const ruleRegex = /([^{]+)\{([^}]*)\}/g;
        let match;
        while ((match = ruleRegex.exec(css)) !== null) {
            const selector = match[1].trim().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
            if (!selector) continue;
            const body = match[2].trim();
            const declarations = [];
            const decls = body.split(';');
            for (const decl of decls) {
                const colonIdx = decl.indexOf(':');
                if (colonIdx > 0) {
                    const prop = decl.substring(0, colonIdx).trim();
                    const val = decl.substring(colonIdx + 1).trim();
                    if (prop && val) declarations.push({ prop, val });
                }
            }
            if (declarations.length > 0 || body.trim()) {
                rules.push({ selector, declarations, body });
            }
        }
        return rules;
    }

    // Check if a selector is a media query or keyframe
    function isAtRule(selector) {
        return selector.startsWith('@');
    }

    // Build nested LESS tree
    function buildLESS(rules) {
        const lines = [];
        const atRules = {};

        // Separate at-rules
        const normalRules = [];
        for (const rule of rules) {
            if (isAtRule(rule.selector)) {
                const match = rule.selector.match(/^(@media[^{]+)\{/);
                if (match) {
                    const mediaQuery = match[1].trim();
                    if (!atRules[mediaQuery]) atRules[mediaQuery] = [];
                    atRules[mediaQuery].push(rule);
                } else {
                    // Other at-rules like @keyframes, @font-face
                    normalRules.push(rule);
                }
            } else {
                normalRules.push(rule);
            }
        }

        // Build parent-child tree for normal rules
        const nodes = normalRules.map((rule, idx) => {
            const parts = rule.selector.split(/\s+/).filter(Boolean);
            return { rule, parts, children: [], idx };
        });

        // Nest: if selector of A is prefix of selector of B, B becomes child of A
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const pi = nodes[i].parts;
                const pj = nodes[j].parts;
                if (pj.length > pi.length && 
                    pj.slice(0, pi.length).every((p, k) => p === pi[k])) {
                    const childSelector = pj.slice(pi.length).join(' ');
                    // Check if already a child
                    let exists = false;
                    for (const child of nodes[i].children) {
                        if (child.childSelector === childSelector) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        nodes[i].children.push({
                            childSelector,
                            declarations: nodes[j].rule.declarations,
                            selector: nodes[j].rule.selector
                        });
                    }
                }
            }
        }

        // Track which nodes have been used as children
        const usedAsChild = new Set();
        for (const node of nodes) {
            for (const child of node.children) {
                for (let k = 0; k < nodes.length; k++) {
                    if (nodes[k].rule.selector === child.selector) {
                        usedAsChild.add(k);
                        break;
                    }
                }
            }
        }

        // Generate output
        for (let i = 0; i < nodes.length; i++) {
            if (usedAsChild.has(i)) continue;
            const node = nodes[i];
            lines.push(node.rule.selector + ' {');
            for (const decl of node.rule.declarations) {
                lines.push('  ' + decl.prop + ': ' + decl.val + ';');
            }
            for (const child of node.children) {
                lines.push('  ' + child.childSelector + ' {');
                for (const decl of child.declarations) {
                    lines.push('    ' + decl.prop + ': ' + decl.val + ';');
                }
                lines.push('  }');
            }
            lines.push('}');
            lines.push('');
        }

        // Handle parent reference (&)
        lines.unshift('// Generated by AI Toolbox - CSS to LESS Converter');
        lines.unshift('');

        return lines.join('\n');
    }

    function convert() {
        try {
            const raw = input.value.trim();
            if (!raw) {
                statusEl.textContent = T('请输入 CSS 代码', 'Please enter CSS code');
                statusEl.style.color = 'var(--text-dim)';
                return;
            }

            const rules = parseCSS(raw);
            if (rules.length === 0) {
                statusEl.textContent = T('未找到 CSS 规则', 'No CSS rules found');
                statusEl.style.color = 'var(--text-dim)';
                return;
            }

            const less = buildLESS(rules);
            output.value = less;

            const ruleCount = rules.length;
            const charCount = less.length;
            if (statsEl) {
                statsEl.textContent = T(
                    ruleCount + ' 条规则 | ' + charCount + ' 字符',
                    ruleCount + ' rules | ' + charCount + ' chars'
                );
            }

            statusEl.textContent = T(
                '✅ 已转换 ' + ruleCount + ' 条 CSS 规则为 LESS',
                '✅ Converted ' + ruleCount + ' CSS rules to LESS'
            );
            statusEl.style.color = '#27ae60';

        } catch (e) {
            statusEl.textContent = T('错误: ' + e.message, 'Error: ' + e.message);
            statusEl.style.color = '#e74c3c';
        }
    }

    copyBtn.addEventListener('click', function () {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(function () {
            const orig = copyBtn.textContent;
            copyBtn.textContent = T('✅ 已复制', '✅ Copied');
            setTimeout(function () { copyBtn.textContent = orig; }, 2000);
        }).catch(function () {
            output.select();
            document.execCommand('copy');
            const orig = copyBtn.textContent;
            copyBtn.textContent = T('✅ 已复制', '✅ Copied');
            setTimeout(function () { copyBtn.textContent = orig; }, 2000);
        });
    });

    clearBtn.addEventListener('click', function () {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.textContent = '';
        statusEl.textContent = '';
    });

    convertBtn.addEventListener('click', convert);

    if (input.value.trim()) convert();

    input.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            convert();
        }
    });

})();