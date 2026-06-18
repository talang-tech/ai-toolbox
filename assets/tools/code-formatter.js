// Code Formatter - HTML / CSS / JavaScript formatting in browser
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('code-input');
    const output = document.getElementById('code-output');
    const formatType = document.getElementById('format-type');
    const indentSize = document.getElementById('indent-size');
    const formatBtn = document.getElementById('format-btn');
    const copyBtn = document.getElementById('code-copy-btn');
    const clearBtn = document.getElementById('code-clear-btn');
    const charCount = document.getElementById('code-char-count');
    const errorMsg = document.getElementById('code-error');
    
    if (!input || !output) return;

    function updateCharCount() {
        if (charCount) {
            const len = input.value.length;
            const lines = input.value ? input.value.split('\n').length : 0;
            charCount.textContent = `${len} 字符 | ${lines} 行`;
        }
    }
    input.addEventListener('input', updateCharCount);
    updateCharCount();

    function showError(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = msg ? 'block' : 'none';
        }
    }

    // --- HTML Formatter ---
    function formatHTML(code, indent) {
        const indentChar = ' '.repeat(indent);
        let formatted = '';
        let depth = 0;
        let inTag = false;
        let isClosing = false;
        let inScript = false;
        let inStyle = false;
        let buffer = '';
        
        // Remove whitespace between tags
        code = code.replace(/>\s+</g, '><').trim();
        
        // Process character by character for accurate handling
        let i = 0;
        // Add root-level indentation support
        const tagStack = [];
        
        while (i < code.length) {
            if (code[i] === '<') {
                // Output text content before this tag (trimmed)
                if (buffer.trim()) {
                    formatted += indentChar.repeat(depth) + buffer.trim() + '\n';
                }
                buffer = '';
                
                // Check if closing tag
                isClosing = code[i + 1] === '/';
                
                // Extract tag name
                let tagEnd = code.indexOf('>', i);
                if (tagEnd === -1) break;
                
                const tagContent = code.slice(i + (isClosing ? 2 : 1), tagEnd).trim().split(/[\s>]/)[0];
                const tag = tagContent ? tagContent.toLowerCase() : '';
                
                // Handle self-closing tags
                const selfClosing = code[i + (tagEnd - 1)] === '/' || ['br','hr','img','input','meta','link','area','base','col','embed','source','track','wbr'].includes(tag);
                
                if (isClosing) {
                    depth = Math.max(0, depth - 1);
                    formatted += indentChar.repeat(depth) + code.slice(i, tagEnd + 1) + '\n';
                    tagStack.pop();
                } else {
                    formatted += indentChar.repeat(depth) + code.slice(i, tagEnd + 1) + '\n';
                    if (!selfClosing) {
                        tagStack.push(tag);
                        // Handle inline elements that shouldn't indent deeply
                        if (!['a','span','strong','em','b','i','u','code','small','label','sub','sup'].includes(tag)) {
                            depth++;
                        }
                    }
                }
                i = tagEnd + 1;
                
                // Handle script/style content
                if (tag === 'script' || tag === 'style') {
                    const closeTag = '</' + tag + '>';
                    const closeIdx = code.indexOf(closeTag, i);
                    if (closeIdx > i) {
                        const innerContent = code.slice(i, closeIdx);
                        if (innerContent.trim()) {
                            formatted += indentChar.repeat(depth) + innerContent.trim() + '\n';
                        }
                        formatted += indentChar.repeat(Math.max(0, depth - 1)) + closeTag + '\n';
                        tagStack.pop();
                        depth = Math.max(0, depth - 1);
                        i = closeIdx + closeTag.length;
                    }
                }
            } else {
                buffer += code[i];
                i++;
            }
        }
        
        // Remaining buffer
        if (buffer.trim()) {
            formatted += buffer.trim() + '\n';
        }
        
        return formatted.trim();
    }

    // --- CSS Formatter ---
    function formatCSS(code, indent) {
        const indentChar = ' '.repeat(indent);
        let formatted = '';
        let depth = 0;
        let inBlock = false;
        
        // Remove excess whitespace
        code = code.replace(/\s+/g, ' ').trim();
        
        // Handle each selector block
        // Split on closing braces to handle blocks
        const blocks = [];
        let blockStart = 0;
        let braceCount = 0;
        let inString = false;
        
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '"' || code[i] === "'") {
                const quote = code[i];
                i++;
                while (i < code.length && code[i] !== quote) {
                    if (code[i] === '\\') i++;
                    i++;
                }
                continue;
            }
            if (code[i] === '{') {
                if (braceCount === 0) {
                    blocks.push({ type: 'selector', content: code.slice(blockStart, i).trim() });
                    blockStart = i + 1;
                }
                braceCount++;
            }
            if (code[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    const props = code.slice(blockStart, i).trim();
                    if (props) {
                        // Format properties
                        const propLines = props.split(';').map(p => p.trim()).filter(p => p);
                        const formattedProps = propLines.map(p => {
                            const colonIdx = p.indexOf(':');
                            if (colonIdx > 0) {
                                return indentChar + p.slice(0, colonIdx).trim() + ': ' + p.slice(colonIdx + 1).trim() + ';';
                            }
                            return indentChar + p + ';';
                        }).join('\n');
                        blocks.push({ type: 'block', content: '\n' + formattedProps + '\n' });
                    }
                    blockStart = i + 1;
                }
            }
        }
        
        formatted = '';
        for (let b = 0; b < blocks.length; b++) {
            if (blocks[b].type === 'selector') {
                formatted += blocks[b].content + ' {\n';
                // Next block should be the properties
                if (b + 1 < blocks.length && blocks[b + 1].type === 'block') {
                    formatted += blocks[b + 1].content;
                    b++;
                }
                formatted += '}\n\n';
            }
        }
        
        // Handle @-rules (media, keyframes, etc.)
        formatted = formatted.replace(/@(\w[\w-]*)\s+/g, '@$1 ');
        
        return formatted.trim();
    }

    // --- JavaScript Formatter ---
    function formatJS(code, indent) {
        const indentChar = ' '.repeat(indent);
        let formatted = '';
        let depth = 0;
        let i = 0;
        let inSingleLineComment = false;
        let inMultiLineComment = false;
        let inString = false;
        let stringChar = '';
        let lineBuffer = '';
        
        while (i < code.length) {
            const ch = code[i];
            const next = code[i + 1] || '';
            
            // Handle comments
            if (!inString && !inSingleLineComment && ch === '/' && next === '/') {
                inSingleLineComment = true;
                lineBuffer += ch;
                i++;
                continue;
            }
            if (!inString && ch === '/' && next === '*') {
                inMultiLineComment = true;
                lineBuffer += ch;
                i++;
                continue;
            }
            if (inSingleLineComment) {
                if (ch === '\n') {
                    lineBuffer += ch;
                    formatted += indentChar.repeat(depth) + lineBuffer;
                    lineBuffer = '';
                    inSingleLineComment = false;
                } else {
                    lineBuffer += ch;
                }
                i++;
                continue;
            }
            if (inMultiLineComment) {
                if (ch === '*' && next === '/') {
                    lineBuffer += '*/';
                    i += 2;
                    inMultiLineComment = false;
                    formatted += indentChar.repeat(depth) + lineBuffer + '\n';
                    lineBuffer = '';
                    continue;
                }
                lineBuffer += ch;
                i++;
                continue;
            }
            
            // Handle strings
            if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
                inString = true;
                stringChar = ch;
                lineBuffer += ch;
                i++;
                continue;
            }
            if (inString) {
                if (ch === '\\') {
                    lineBuffer += ch;
                    i++;
                    if (i < code.length) {
                        lineBuffer += code[i];
                        i++;
                    }
                    continue;
                }
                if (ch === stringChar && stringChar !== '`') {
                    lineBuffer += ch;
                    i++;
                    inString = false;
                    continue;
                }
                if (stringChar === '`' && ch === '$' && next === '{') {
                    lineBuffer += ch + next;
                    i += 2;
                    continue;
                }
                if (stringChar === '`' && ch === '`') {
                    lineBuffer += ch;
                    i++;
                    inString = false;
                    continue;
                }
                lineBuffer += ch;
                i++;
                continue;
            }
            
            // Handle newlines in output
            if (ch === '\n') {
                if (lineBuffer.trim()) {
                    formatted += indentChar.repeat(depth) + lineBuffer.trim() + '\n';
                }
                lineBuffer = '';
                i++;
                continue;
            }
            
            // Handle braces
            if (ch === '{') {
                if (lineBuffer.trim()) {
                    formatted += indentChar.repeat(depth) + lineBuffer.trim() + ' {\n';
                } else {
                    formatted += indentChar.repeat(depth) + '{\n';
                }
                lineBuffer = '';
                depth++;
                // Skip spaces after {
                while (i + 1 < code.length && code[i + 1] === ' ') i++;
                i++;
                continue;
            }
            
            if (ch === '}') {
                if (lineBuffer.trim()) {
                    formatted += indentChar.repeat(depth) + lineBuffer.trim() + '\n';
                }
                depth = Math.max(0, depth - 1);
                formatted += indentChar.repeat(depth) + '}\n';
                lineBuffer = '';
                // Skip semicolons after }
                if (next === ';') {
                    i++;
                }
                i++;
                continue;
            }
            
            // Handle semicolons
            if (ch === ';') {
                lineBuffer += ';';
                if (lineBuffer.trim()) {
                    formatted += indentChar.repeat(depth) + lineBuffer.trim() + '\n';
                }
                lineBuffer = '';
                i++;
                continue;
            }
            
            lineBuffer += ch;
            i++;
        }
        
        // Flush remaining
        if (lineBuffer.trim()) {
            formatted += indentChar.repeat(depth) + lineBuffer.trim() + '\n';
        }
        
        return formatted.trim();
    }

    function format() {
        const code = input.value;
        if (!code.trim()) {
            showError('Please enter code to format');
            return;
        }
        showError('');
        
        const indent = parseInt(indentSize?.value) || 2;
        const type = formatType?.value || 'html';
        
        try {
            let result;
            switch (type) {
                case 'css':
                    result = formatCSS(code, indent);
                    break;
                case 'js':
                case 'javascript':
                    result = formatJS(code, indent);
                    break;
                default: // html
                    result = formatHTML(code, indent);
            }
            output.value = result;
        } catch (e) {
            showError('Formatting error: ' + e.message);
            output.value = code;
        }
    }

    function copyOutput() {
        if (!output.value) return;
        output.select();
        document.execCommand('copy');
        const original = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => copyBtn.textContent = original, 1500);
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        showError('');
        updateCharCount();
    }

    formatBtn?.addEventListener('click', format);
    copyBtn?.addEventListener('click', copyOutput);
    clearBtn?.addEventListener('click', clearAll);
    
    // Auto-format on type select change if there's input
    const typeEl = formatType;
    if (typeEl) {
        typeEl.addEventListener('change', () => {
            if (input.value.trim()) format();
        });
    }
    const indentEl = indentSize;
    if (indentEl) {
        indentEl.addEventListener('change', () => {
            if (input.value.trim()) format();
        });
    }

    // Sample code for demo
    const sampleCode = {
        'html': `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Page</title>
<style>
body{margin:0;padding:20px;background:#f5f5f5;}
.container{max-width:1200px;margin:0 auto;}
.card{padding:16px;background:white;border-radius:8px;}
h1{color:#333;font-size:24px;}
</style>
</head>
<body>
<div class="container">
<div class="card">
<h1>Hello World</h1>
<p>This is a sample paragraph.</p>
</div>
</div>
<script>
console.log("loaded");
</script>
</body>
</html>`,
        'css': `body { margin: 0; padding: 20px; background: #f5f5f5; font-family: sans-serif; }
.container { max-width: 1200px; margin: 0 auto; }
.card { padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h1 { color: #333; font-size: 24px; margin-bottom: 12px; }
p { line-height: 1.6; color: #666; }
.btn { display: inline-block; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn:hover { background: #0056b3; }
@media (max-width: 768px) { .container { padding: 10px; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
        'js': `function greet(name) { return 'Hello, ' + name + '!'; }
const data = { id: 1, name: 'test', values: [1,2,3] };
if (data.id) { console.log(greet(data.name)); for (let i=0;i<data.values.length;i++) { console.log(data.values[i]); } }
const result = data.values.map(v => v * 2).filter(v => v > 2);
console.log(result);

// Async example
async function fetchUser(id) {
const response = await fetch('/api/users/' + id);
if (!response.ok) { throw new Error('Failed'); }
return response.json();
}

class Calculator {
constructor(initial = 0) { this.value = initial; }
add(n) { this.value += n; return this; }
subtract(n) { this.value -= n; return this; }
getResult() { return this.value; }
}`
    };

    // Load sample on first click
    const loadSample = () => {
        const type = formatType?.value || 'html';
        if (!input.value) {
            input.value = sampleCode[type] || sampleCode.html;
            updateCharCount();
            format();
        }
    };
    
    formatBtn?.addEventListener('click', loadSample, { once: true });
    // If user already interacted, still format
    setTimeout(loadSample, 500);
});