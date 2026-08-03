/**
 * CSS to SCSS/SASS Converter - Converts flat CSS to nested SCSS syntax
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('css2sass-input');
    const output = document.getElementById('css2sass-output');
    const convertBtn = document.getElementById('css2sass-convert');
    const copyBtn = document.getElementById('css2sass-copy');
    const clearBtn = document.getElementById('css2sass-clear');
    const statusEl = document.getElementById('css2sass-status');
    const statsEl = document.getElementById('css2sass-stats');
    const syntaxRadios = document.querySelectorAll('input[name="css2sass-syntax"]');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !convertBtn) return;

    function getSyntax() {
        for (const r of syntaxRadios) {
            if (r.checked) return r.value;
        }
        return 'scss';
    }

    function showStatus(text, type) {
        if (!statusEl) return;
        const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)' };
        statusEl.style.color = colors[type] || colors.info;
        statusEl.textContent = text;
    }

    // Parse CSS into selector => declarations map
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
            if (declarations.length > 0) {
                rules.push({ selector, declarations });
            }
        }
        return rules;
    }

    // Get nesting depth for a selector (count of parts)
    function getSelectorParts(selector) {
        // Remove pseudo-classes, combinators etc
        const parts = selector.split(/\s+/).filter(p => p && p !== '>' && p !== '+' && p !== '~');
        return parts;
    }

    // Build nesting tree from flat rules
    function buildNestingTree(rules) {
        const tree = [];
        for (const rule of rules) {
            tree.push({
                selector: rule.selector,
                declarations: rule.declarations,
                children: []
            });
        }
        return tree;
    }

    // Try to nest rules by matching selector prefixes
    function nestRules(rules) {
        const result = [];
        const used = new Set();

        for (let i = 0; i < rules.length; i++) {
            if (used.has(i)) continue;
            const parts = getSelectorParts(rules[i].selector);
            if (parts.length < 2) {
                result.push({ ...rules[i], children: [] });
                used.add(i);
                continue;
            }

            const parentCandidate = parts.slice(0, -1).join(' ');
            const childSelector = parts[parts.length - 1];
            // Check if parent uses "&" convention or just the full prefix
            let parentIdx = -1;
            for (let j = 0; j < rules.length; j++) {
                if (used.has(j) || i === j) continue;
                if (rules[j].selector === parentCandidate) {
                    parentIdx = j;
                    break;
                }
            }

            if (parentIdx >= 0) {
                const parent = result.find(r => r.selector === parentCandidate);
                if (parent) {
                    parent.children.push({
                        selector: childSelector,
                        declarations: rules[i].declarations,
                        children: []
                    });
                    used.add(i);
                    if (!used.has(parentIdx)) used.add(parentIdx);
                } else {
                    result.push({
                        selector: rules[parentIdx].selector,
                        declarations: rules[parentIdx].declarations,
                        children: [{
                            selector: childSelector,
                            declarations: rules[i].declarations,
                            children: []
                        }]
                    });
                    used.add(parentIdx);
                    used.add(i);
                }
            } else {
                result.push({ ...rules[i], children: [] });
                used.add(i);
            }
        }

        return result;
    }

    function convert(rules, syntax) {
        const indent = syntax === 'sass' ? '  ' : '  ';
        const useBrackets = syntax === 'scss';
        const lines = [];
        const nested = nestRules(rules);

        function writeNode(node, depth) {
            const pad = indent.repeat(depth);
            const selector = node.selector;
            if (useBrackets) {
                lines.push(`${pad}${selector} {`);
                for (const decl of node.declarations) {
                    lines.push(`${pad}${indent}${decl.prop}: ${decl.val};`);
                }
                for (const child of node.children) {
                    writeNode(child, depth + 1);
                }
                lines.push(`${pad}}`);
            } else {
                lines.push(`${pad}${selector}`);
                for (const decl of node.declarations) {
                    lines.push(`${pad}${indent}${decl.prop}: ${decl.val}`);
                }
                for (const child of node.children) {
                    writeNode(child, depth + 1);
                }
                // Empty line between rules in SASS syntax
                if (node.children.length > 0 || node.declarations.length > 0) {
                    lines.push('');
                }
            }
        }

        for (const node of nested) {
            writeNode(node, 0);
        }

        return lines.join('\n');
    }

    function run() {
        const css = input.value.trim();
        if (!css) {
            showStatus(T('请先粘贴 CSS 代码。', 'Please paste CSS content first.'), 'error');
            return;
        }

        const syntax = getSyntax();
        const rules = parseCSS(css);
        if (rules.length === 0) {
            showStatus(T('未找到有效的 CSS 规则。', 'No valid CSS rules found.'), 'error');
            return;
        }

        const result = convert(rules, syntax);
        output.value = result;
        showStatus(T('转换成功。所有处理在浏览器本地完成。', 'Converted successfully. All processing is local.'), 'success');

        if (statsEl) {
            statsEl.textContent = T(
                `共 ${rules.length} 条规则，${result.length} 字符`,
                `${rules.length} rules, ${result.length} chars`
            );
        }
    }

    function copy() {
        if (!output.value) {
            showStatus(T('没有可复制的内容。', 'Nothing to copy.'), 'error');
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus(T('已复制！', 'Copied!'), 'success');
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            showStatus(T('已复制！', 'Copied!'), 'success');
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.textContent = '';
        showStatus(T('已清空。', 'Cleared.'), 'info');
    }

    convertBtn.addEventListener('click', run);
    copyBtn.addEventListener('click', copy);
    clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter to convert
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            run();
        }
    });

})();