/**
 * Text Justify - Justify, align, and format text to a specified width
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('tj-input');
    const output = document.getElementById('tj-output');
    const justifyBtn = document.getElementById('tj-justify');
    const copyBtn = document.getElementById('tj-copy');
    const clearBtn = document.getElementById('tj-clear');
    const statusEl = document.getElementById('tj-status');
    const widthInput = document.getElementById('tj-width');
    const fillInput = document.getElementById('tj-fill');
    const indentInput = document.getElementById('tj-indent');
    const spacingInput = document.getElementById('tj-spacing');
    const alignSelect = document.getElementById('tj-align');
    const preserveBreaks = document.getElementById('tj-preserve-breaks');

    const isEN = document.documentElement.lang === 'en';
    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !justifyBtn) return;

    // Measure visual width (Chinese chars = 2, ASCII = 1)
    function visualWidth(str) {
        let w = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code > 0x7e || (code < 0x20)) {
                w += 2; // CJK and fullwidth
            } else {
                w += 1;
            }
        }
        return w;
    }

    // Pad a string to a target visual width
    function padToWidth(str, targetWidth, fillChar) {
        const current = visualWidth(str);
        if (current >= targetWidth) return str;
        return str + fillChar.repeat(targetWidth - current);
    }

    // Justify a single line: add spaces between words to reach target width
    function justifyLine(line, targetWidth, fillChar) {
        const trimmed = line.trim();
        if (!trimmed) return fillChar.repeat(targetWidth);
        const current = visualWidth(trimmed);
        if (current >= targetWidth) return trimmed;

        // Split into words (by whitespace)
        const words = trimmed.split(/\s+/);
        if (words.length <= 1) return padToWidth(trimmed, targetWidth, fillChar);

        // Calculate total padding needed
        const charsLen = visualWidth(words.join(''));
        const totalPad = targetWidth - charsLen;
        const gaps = words.length - 1;
        const basePad = Math.floor(totalPad / gaps);
        let extra = totalPad - basePad * gaps;

        const result = [];
        for (let i = 0; i < words.length; i++) {
            result.push(words[i]);
            if (i < words.length - 1) {
                let pad = basePad + (extra > 0 ? 1 : 0);
                if (extra > 0) extra--;
                result.push(fillChar.repeat(pad));
            }
        }
        return result.join('');
    }

    // Main justify function
    function justify() {
        const raw = input.value;
        if (!raw.trim()) {
            output.value = '';
            statusEl.textContent = T('请先输入文本。', 'Please enter text first.');
            statusEl.style.color = 'var(--error, #e74c3c)';
            return;
        }

        const targetWidth = parseInt(widthInput.value, 10) || 60;
        const fillChar = fillInput.value || ' ';
        const indent = parseInt(indentInput.value, 10) || 0;
        const spacing = parseInt(spacingInput.value, 10) || 0;
        const align = alignSelect.value;
        const preserve = preserveBreaks.checked;

        const indentStr = fillChar.repeat(indent);
        const spacingStr = '\n'.repeat(spacing);

        let lines;
        if (preserve) {
            // Split by existing newlines, preserving paragraph breaks
            lines = raw.split('\n');
        } else {
            // Merge all text into one paragraph
            lines = [raw.replace(/\s+/g, ' ').trim()];
        }

        const resultLines = [];
        let charCount = 0;
        let wordCount = 0;
        let lineCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Empty line: preserve as blank line
            if (!trimmed) {
                if (preserve) {
                    resultLines.push('');
                }
                continue;
            }

            // Wrap long lines to fit target width first
            const wrapped = wrapLine(trimmed, targetWidth, fillChar);
            for (let j = 0; j < wrapped.length; j++) {
                let wl = wrapped[j];
                // Apply indent
                wl = indentStr + wl;
                const visualLen = visualWidth(wl);

                // Apply alignment
                let aligned;
                if (align === 'justify') {
                    // Strip indent before justify, then re-add
                    const content = wl.slice(indent);
                    aligned = indentStr + justifyLine(content, targetWidth, fillChar);
                } else if (align === 'left') {
                    aligned = wl;
                } else if (align === 'right') {
                    const padding = targetWidth - visualLen;
                    aligned = (padding > 0 ? fillChar.repeat(padding) : '') + wl;
                } else if (align === 'center') {
                    const padding = targetWidth - visualLen;
                    const leftPad = Math.floor(padding / 2);
                    const rightPad = padding - leftPad;
                    aligned = (leftPad > 0 ? fillChar.repeat(leftPad) : '') + wl + (rightPad > 0 ? fillChar.repeat(rightPad) : '');
                } else {
                    aligned = wl;
                }

                resultLines.push(aligned);
                lineCount++;

                // Count chars and words
                for (const ch of wl) {
                    if (ch.charCodeAt(0) > 0x7e) charCount += 2;
                    else charCount += 1;
                }
                wordCount += wl.split(/\s+/).filter(w => w.length > 0).length;
            }

            // Add paragraph spacing
            if (spacing > 0 && i < lines.length - 1) {
                for (let s = 0; s < spacing; s++) {
                    resultLines.push('');
                }
            }
        }

        output.value = resultLines.join('\n');

        // Show stats
        statusEl.textContent = T(
            `✓ 已完成: ${lineCount} 行, ${wordCount} 词, ${charCount} 字符`,
            `✓ Done: ${lineCount} lines, ${wordCount} words, ${charCount} chars`
        );
        statusEl.style.color = 'var(--success, #27ae60)';
    }

    // Wrap a single line of text to fit within targetWidth
    function wrapLine(text, targetWidth, fillChar) {
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';
        let currentWidth = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = visualWidth(word);
            const spaceWidth = currentLine.length > 0 ? visualWidth(fillChar) : 0;

            if (currentWidth + spaceWidth + wordWidth <= targetWidth) {
                if (currentLine.length > 0) {
                    currentLine += fillChar;
                    currentWidth += spaceWidth;
                }
                currentLine += word;
                currentWidth += wordWidth;
            } else {
                if (currentLine.length > 0) {
                    lines.push(currentLine);
                }
                // If word itself is wider than target, still add it
                if (wordWidth > targetWidth) {
                    lines.push(word);
                    currentLine = '';
                    currentWidth = 0;
                } else {
                    currentLine = word;
                    currentWidth = wordWidth;
                }
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        return lines;
    }

    function copy() {
        if (!output.value) {
            statusEl.textContent = T('没有可复制的内容。', 'Nothing to copy.');
            statusEl.style.color = 'var(--muted)';
            return;
        }
        navigator.clipboard.writeText(output.value).then(() => {
            statusEl.textContent = T('✓ 已复制!', '✓ Copied!');
            statusEl.style.color = 'var(--success, #27ae60)';
        }).catch(() => {
            output.select();
            document.execCommand('copy');
            statusEl.textContent = T('✓ 已复制!', '✓ Copied!');
            statusEl.style.color = 'var(--success, #27ae60)';
        });
    }

    function clearAll() {
        input.value = '';
        output.value = '';
        statusEl.textContent = T('已清空。', 'Cleared.');
        statusEl.style.color = 'var(--muted)';
    }

    // Events
    justifyBtn.addEventListener('click', justify);
    copyBtn.addEventListener('click', copy);
    clearBtn.addEventListener('click', clearAll);

    // Ctrl+Enter to justify
    input.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            justify();
        }
    });

    console.log('Text Justify initialized');
})();