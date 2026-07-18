/**
 * HTML to Pug Converter - Converts HTML to Pug/Jade template syntax
 * Pure JS, zero dependencies, runs entirely in browser.
 * Supports: elements, attributes, classes, IDs, text, nesting, self-closing tags
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('h2p-input');
    const output = document.getElementById('h2p-output');
    const convertBtn = document.getElementById('h2p-convert-btn');
    const copyBtn = document.getElementById('h2p-copy-btn');
    const clearBtn = document.getElementById('h2p-clear-btn');
    const statsEl = document.getElementById('h2p-stats');
    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !convertBtn) return;

    // Self-closing (void) HTML elements
    const VOID_ELEMENTS = {
        'area': true, 'base': true, 'br': true, 'col': true, 'embed': true,
        'hr': true, 'img': true, 'input': true, 'link': true, 'meta': true,
        'param': true, 'source': true, 'track': true, 'wbr': true
    };

    // Elements that are typically block-level in Pug
    const BLOCK_ELEMENTS = {
        'div': true, 'p': true, 'h1': true, 'h2': true, 'h3': true, 'h4': true,
        'h5': true, 'h6': true, 'ul': true, 'ol': true, 'li': true, 'table': true,
        'tr': true, 'td': true, 'th': true, 'thead': true, 'tbody': true, 'tfoot': true,
        'section': true, 'article': true, 'nav': true, 'aside': true, 'header': true,
        'footer': true, 'main': true, 'figure': true, 'figcaption': true,
        'form': true, 'fieldset': true, 'legend': true, 'label': true,
        'select': true, 'optgroup': true, 'option': true, 'textarea': true,
        'button': true, 'datalist': true, 'details': true, 'summary': true,
        'dialog': true, 'menu': true, 'pre': true, 'blockquote': true,
        'dl': true, 'dt': true, 'dd': true, 'address': true
    };

    // Simple HTML tokenizer → elements tree
    function tokenize(html) {
        html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
        const tokens = [];
        const tagRegex = /<\/?([a-zA-Z0-9-]+)((?:\s+[a-zA-Z_:][a-zA-Z0-9_:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
        let lastIndex = 0;
        let m;

        while ((m = tagRegex.exec(html)) !== null) {
            // Text before this tag
            if (m.index > lastIndex) {
                const text = html.substring(lastIndex, m.index).trim();
                if (text) tokens.push({ type: 'text', content: text });
            }

            const isClosing = m[0].startsWith('</');
            const tagName = m[1].toLowerCase();
            const attrStr = m[2].trim();
            const selfClosing = m[3] === '/' || VOID_ELEMENTS[tagName];

            if (isClosing) {
                tokens.push({ type: 'close', tag: tagName });
            } else {
                // Parse attributes
                const attrs = {};
                const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
                let am;
                while ((am = attrRegex.exec(attrStr)) !== null) {
                    const key = am[1];
                    const val = am[2] !== undefined ? am[2] : (am[3] !== undefined ? am[3] : (am[4] !== undefined ? am[4] : ''));
                    attrs[key] = val;
                }
                tokens.push({ type: 'open', tag: tagName, attrs: attrs, selfClosing: selfClosing });
            }
            lastIndex = tagRegex.lastIndex;
        }

        // Remaining text
        if (lastIndex < html.length) {
            const text = html.substring(lastIndex).trim();
            if (text) tokens.push({ type: 'text', content: text });
        }

        return tokens;
    }

    // Build tree from tokens
    function buildTree(tokens) {
        const root = { children: [] };
        const stack = [root];
        let i = 0;

        while (i < tokens.length) {
            const tok = tokens[i];
            const parent = stack[stack.length - 1];

            if (tok.type === 'open') {
                const node = {
                    tag: tok.tag,
                    attrs: tok.attrs,
                    selfClosing: tok.selfClosing,
                    text: '',
                    children: []
                };
                parent.children.push(node);
                if (!tok.selfClosing) {
                    stack.push(node);
                }
            } else if (tok.type === 'close') {
                if (stack.length > 1) {
                    const top = stack[stack.length - 1];
                    if (top.tag === tok.tag) {
                        stack.pop();
                    }
                }
            } else if (tok.type === 'text') {
                const text = tok.content.trim();
                if (text) {
                    // If parent has children, add as text node
                    // Check if it's inline or block
                    if (parent.children.length > 0) {
                        const lastChild = parent.children[parent.children.length - 1];
                        if (lastChild.text === '') {
                            lastChild.text = ' '; // placeholder
                        }
                        // Append as separate text
                        parent.children.push({ tag: '', attrs: {}, text: text, children: [] });
                    } else {
                        parent.text = (parent.text ? parent.text + ' ' : '') + text;
                    }
                }
            }
            i++;
        }

        return root;
    }

    function escapePugText(text) {
        if (!text) return '';
        // Escape pipe for multi-line
        return text.replace(/\|/g, '\\|');
    }

    function formatAttrs(attrs, tag) {
        const parts = [];

        // Separate class and id from other attrs
        let cls = attrs['class'] || '';
        const id = attrs['id'] || '';

        // Build shorthand
        let shorthand = '';
        if (id) {
            shorthand += '#' + id;
            delete attrs['id'];
        }
        if (cls) {
            const classes = cls.trim().split(/\s+/);
            shorthand += '.' + classes.join('.');
            delete attrs['class'];
        }

        // Remaining attributes
        const remaining = {};
        for (const [k, v] of Object.entries(attrs)) {
            if (v !== undefined && v !== null) {
                remaining[k] = v;
            }
        }

        const attrKeys = Object.keys(remaining);
        if (attrKeys.length > 0) {
            const attrParts = attrKeys.map(function(k) {
                const v = remaining[k];
                // Boolean attribute
                if (v === '' || v === k) {
                    return k;
                }
                // Quote value
                const escaped = v.replace(/"/g, '&quot;');
                return k + '="' + escaped + '"';
            });
            if (shorthand) {
                shorthand += '(' + attrParts.join(' ') + ')';
            } else {
                shorthand = '(' + attrParts.join(' ') + ')';
            }
        }

        return shorthand;
    }

    function renderNode(node, indent) {
        indent = indent || 0;
        const pad = '  '.repeat(indent);
        let out = '';

        // Text-only node
        if (!node.tag) {
            if (node.text) {
                out += pad + '| ' + node.text + '\n';
            }
            return out;
        }

        const tag = node.tag;
        const attrStr = formatAttrs(Object.assign({}, node.attrs), tag);

        // Self-closing
        if (node.selfClosing) {
            out += pad + tag + attrStr + '\n';
            return out;
        }

        // Element with text content
        if (node.text && node.children.length === 0) {
            const text = node.text.trim();
            if (text) {
                // Check if text contains HTML entities that need escaping
                const containsAngle = text.indexOf('<') >= 0;
                if (containsAngle) {
                    // Use pipe for raw text
                    out += pad + tag + attrStr + '\n';
                    out += pad + '  | ' + text + '\n';
                } else {
                    out += pad + tag + attrStr + ' ' + text + '\n';
                }
            } else {
                out += pad + tag + attrStr + '\n';
            }
            return out;
        }

        // Element with children
        out += pad + tag + attrStr + '\n';

        // Render children
        if (node.children.length > 0) {
            for (const child of node.children) {
                out += renderNode(child, indent + 1);
            }
        }

        return out;
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

        try {
            const tokens = tokenize(code);
            const tree = buildTree(tokens);
            let result = '';

            for (const child of tree.children) {
                result += renderNode(child, 0);
            }

            // Clean up extra blank lines
            result = result.replace(/\n{3,}/g, '\n\n').trim();

            if (!result) {
                output.value = T('⚠️ 未能解析 HTML。请检查 HTML 语法是否正确。', '⚠️ Could not parse HTML. Please check your HTML syntax.');
                if (statsEl) statsEl.innerHTML = T('⚠️ 解析失败', '⚠️ Parse failed');
                return;
            }

            output.value = result;

            const inBytes = new TextEncoder().encode(code).length;
            const outBytes = new TextEncoder().encode(result).length;
            const elCount = (code.match(/<[a-zA-Z]/g) || []).length;
            if (statsEl) {
                statsEl.innerHTML = T(
                    '解析了 ' + elCount + ' 个元素 | 输入 ' + formatBytes(inBytes) + ' → 输出 ' + formatBytes(outBytes),
                    'Parsed ' + elCount + ' elements | Input ' + formatBytes(inBytes) + ' → Output ' + formatBytes(outBytes)
                );
            }
        } catch (e) {
            output.value = T('⚠️ 解析错误: ' + e.message, '⚠️ Parse error: ' + e.message);
            if (statsEl) statsEl.innerHTML = T('⚠️ 错误', '⚠️ Error');
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