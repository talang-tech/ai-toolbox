/**
 * CSS to SCSS Converter - Converts flat CSS to nested SCSS syntax
 * Auto-detects parent selectors, creates nesting, extracts variables.
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('c2s-input');
    const output = document.getElementById('c2s-output');
    const convertBtn = document.getElementById('c2s-convert-btn');
    const copyBtn = document.getElementById('c2s-copy-btn');
    const clearBtn = document.getElementById('c2s-clear-btn');
    const modeRadios = document.querySelectorAll('input[name="c2s-mode"]');
    const statsEl = document.getElementById('c2s-stats');
    const isEN = document.documentElement.lang === 'en';

    if (!input || !output || !convertBtn) return;
    const T = (zh, en) => isEN ? en : zh;

    function getMode() {
        for (const r of modeRadios) { if (r.checked) return r.value; }
        return 'scss';
    }

    // Parse CSS → array of rules { selector, declarations[], parentMatch }
    function parseCSS(css) {
        // Remove comments
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
                    if (prop && val) declarations.push({ prop: prop, val: val });
                }
            }
            if (declarations.length > 0) rules.push({ selector: selector, declarations: declarations });
        }
        return rules;
    }

    // Infer nesting by longest common prefix matching
    function buildNestedTree(rules) {
        // Group selectors by "parent" — heuristic: if selector A is a prefix of selector B
        // e.g. ".foo" and ".foo .bar" → .foo { ... .bar { ... } }
        // We'll use a simple approach: sort by specificity, then nest
        const nodes = rules.map(function(rule) {
            const parts = rule.selector.split(/\s+/).filter(Boolean);
            return { rule: rule, parts: parts, children: [] };
        });

        // Simple nesting: if a node's selector parts start with another node's parts as prefix
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                // Check if nodes[j] is a child of nodes[i]
                const pi = nodes[i].parts;
                const pj = nodes[j].parts;
                if (pj.length > pi.length && pj.slice(0, pi.length).join(' ') === pi.join(' ')) {
                    // The child part is the remaining suffix
                    const childSelector = pj.slice(pi.length).join(' ');
                    // Only add if not already added
                    let already = false;
                    for (let k = 0; k < nodes[i].children.length; k++) {
                        if (nodes[i].children[k].childSelector === childSelector) {
                            already = true;
                            break;
                        }
                    }
                    if (!already) {
                        nodes[i].children.push({
                            rule: nodes[j].rule,
                            childSelector: childSelector,
                            depth: pi.length
                        });
                    }
                }
            }
        }

        // Mark nodes that are children of others (to skip at top level)
        const isChild = {};
        for (const node of nodes) {
            for (const child of node.children) {
                isChild[child.rule.selector] = true;
            }
        }

        // Build top-level list (only non-child nodes)
        const topLevel = [];
        const seen = {};
        for (const node of nodes) {
            if (!isChild[node.rule.selector] && !seen[node.rule.selector]) {
                topLevel.push(node);
                seen[node.rule.selector] = true;
            }
        }

        // For nodes that are children but not nested in any top-level, add them as top-level
        for (const node of nodes) {
            if (!seen[node.rule.selector]) {
                topLevel.push(node);
                seen[node.rule.selector] = true;
            }
        }

        return { topLevel: topLevel, allNodes: nodes };
    }

    function formatSelector(sel) {
        // Convert ampersand-friendly selectors
        // e.g. ".foo:hover" stays as is; for child selectors, prepend &
        return sel;
    }

    function renderSCSS(node, indent) {
        indent = indent || 0;
        const pad = '  '.repeat(indent);
        let out = '';

        // For top-level nodes, use the full selector
        if (indent === 0) {
            out += pad + node.rule.selector + ' {\n';
        } else {
            // For child nodes, prepend &
            out += pad + '& ' + node.childSelector + ' {\n';
        }

        for (const decl of node.rule.declarations) {
            out += pad + '  ' + decl.prop + ': ' + decl.val + ';\n';
        }

        // Render children
        if (node.children) {
            for (const child of node.children) {
                out += pad + '  & ' + child.childSelector + ' {\n';
                for (const decl of child.rule.declarations) {
                    out += pad + '    ' + decl.prop + ': ' + decl.val + ';\n';
                }
                out += pad + '  }\n';
            }
        }

        out += pad + '}\n';
        return out;
    }

    function renderSCSSFlat(node, indent) {
        indent = indent || 0;
        const pad = '  '.repeat(indent);
        let out = '';

        out += pad + node.rule.selector + ' {\n';
        for (const decl of node.rule.declarations) {
            out += pad + '  ' + decl.prop + ': ' + decl.val + ';\n';
        }
        out += pad + '}\n';
        return out;
    }

    function renderSASS(node, indent) {
        indent = indent || 0;
        const pad = '  '.repeat(indent);
        let out = '';

        if (indent === 0) {
            out += pad + node.rule.selector + '\n';
        } else {
            out += pad + '&' + node.childSelector + '\n';
        }

        for (const decl of node.rule.declarations) {
            out += pad + '  ' + decl.prop + ': ' + decl.val + '\n';
        }

        if (node.children) {
            for (const child of node.children) {
                out += pad + '  &' + child.childSelector + '\n';
                for (const decl of child.rule.declarations) {
                    out += pad + '    ' + decl.prop + ': ' + decl.val + '\n';
                }
            }
        }
        return out;
    }

    // Extract common CSS variables
    function extractVariables(css) {
        const vars = {};
        // Look for custom properties
        const varRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
        let m;
        while ((m = varRegex.exec(css)) !== null) {
            vars['--' + m[1].trim()] = m[2].trim();
        }
        return vars;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function process() {
        const code = input.value;
        if (!code.trim()) {
            output.value = '';
            if (statsEl) statsEl.innerHTML = '';
            return;
        }

        const mode = getMode();
        const rules = parseCSS(code);
        if (rules.length === 0) {
            output.value = T('⚠️ 未能解析 CSS 规则。请检查 CSS 语法是否正确。', '⚠️ Could not parse CSS rules. Please check your CSS syntax.');
            if (statsEl) statsEl.innerHTML = T('⚠️ 解析失败', '⚠️ Parse failed');
            return;
        }

        const tree = buildNestedTree(rules);
        const vars = extractVariables(code);
        let result = '';

        // Add variable section if variables found
        if (Object.keys(vars).length > 0 && mode !== 'sass') {
            result += '// CSS Variables extracted\n';
            for (const [key, val] of Object.entries(vars)) {
                result += '$' + key.replace(/^--/, '') + ': ' + val + ';\n';
            }
            result += '\n';
        }

        // Render
        for (const node of tree.topLevel) {
            if (mode === 'sass') {
                result += renderSASS(node, 0);
            } else {
                result += renderSCSS(node, 0);
            }
            result += '\n';
        }

        // For any rules that weren't nested, add them flat
        const renderedSelectors = {};
        for (const node of tree.topLevel) {
            renderedSelectors[node.rule.selector] = true;
            if (node.children) {
                for (const child of node.children) {
                    renderedSelectors[child.rule.selector] = true;
                }
            }
        }
        for (const rule of rules) {
            if (!renderedSelectors[rule.selector]) {
                result += rule.selector + ' {\n';
                for (const decl of rule.declarations) {
                    result += '  ' + decl.prop + ': ' + decl.val + ';\n';
                }
                result += '}\n\n';
            }
        }

        output.value = result.trim();

        const inBytes = new TextEncoder().encode(code).length;
        const outBytes = new TextEncoder().encode(result).length;
        const rc = rules.length;
        const dc = rules.reduce(function(s, r) { return s + r.declarations.length; }, 0);
        if (statsEl) {
            statsEl.innerHTML = T(
                '解析了 ' + rc + ' 条规则，' + dc + ' 个声明 | 输入 ' + formatBytes(inBytes) + ' → 输出 ' + formatBytes(outBytes),
                'Parsed ' + rc + ' rules, ' + dc + ' declarations | Input ' + formatBytes(inBytes) + ' → Output ' + formatBytes(outBytes)
            );
        }
    }

    convertBtn.addEventListener('click', process);
    copyBtn.addEventListener('click', function() {
        if (output.value) {
            navigator.clipboard.writeText(output.value).then(function() {
                toast(T('✅ 已复制!', '✅ Copied!'));
            });
        }
    });
    clearBtn.addEventListener('click', function() {
        input.value = '';
        output.value = '';
        if (statsEl) statsEl.innerHTML = '';
        input.focus();
    });
    input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            process();
        }
    });
}

// Global toast if not defined
if (typeof toast !== 'function') {
    window.toast = function(msg) {
        const el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:8px;font-size:14px;z-index:9999;transition:opacity .3s';
        document.body.appendChild(el);
        setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 2000);
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();