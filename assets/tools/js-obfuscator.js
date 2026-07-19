/**
 * JS Obfuscator - Obfuscates / beautifies JavaScript code
 * Pure JS, zero dependencies, runs entirely in browser.
 * Techniques: variable renaming, string splitting, numeric encoding, whitespace removal
 */
(function() {
'use strict';

function init() {
    var input = document.getElementById('jso-input');
    var output = document.getElementById('jso-output');
    var obfuscateBtn = document.getElementById('jso-obfuscate-btn');
    var beautifyBtn = document.getElementById('jso-beautify-btn');
    var copyBtn = document.getElementById('jso-copy-btn');
    var clearBtn = document.getElementById('jso-clear-btn');
    var statsEl = document.getElementById('jso-stats');
    var presetSelect = document.getElementById('jso-preset');
    var isEN = document.documentElement.lang === 'en';
    function T(zh, en) { return isEN ? en : zh; }

    if (!input || !output || !obfuscateBtn) return;

    function tokenize(code) {
        var tokens = [];
        var i = 0, len = code.length;
        while (i < len) {
            if (/^\s/.test(code[i])) {
                var start = i;
                while (i < len && /^\s/.test(code[i])) i++;
                tokens.push({ type: 'ws', value: code.slice(start, i) });
                continue;
            }
            if (code[i] === '/' && code[i+1] === '/') {
                var start = i;
                while (i < len && code[i] !== '\n') i++;
                tokens.push({ type: 'comment', value: code.slice(start, i) });
                continue;
            }
            if (code[i] === '/' && code[i+1] === '*') {
                var start = i;
                i += 2;
                while (i < len && !(code[i] === '*' && code[i+1] === '/')) i++;
                if (i < len) i += 2;
                tokens.push({ type: 'comment', value: code.slice(start, i) });
                continue;
            }
            if (code[i] === '`') {
                var start = i; i++;
                while (i < len && code[i] !== '`') { if (code[i] === '\\') i++; i++; }
                if (i < len) i++;
                tokens.push({ type: 'string', value: code.slice(start, i) });
                continue;
            }
            if (code[i] === '"' || code[i] === "'") {
                var start = i;
                var quote = code[i]; i++;
                while (i < len && code[i] !== quote) { if (code[i] === '\\') i++; i++; }
                if (i < len) i++;
                tokens.push({ type: 'string', value: code.slice(start, i) });
                continue;
            }
            if (code[i] === '/' && i > 0 && /[=(,;!&|{}[\]]/.test(code[i-1])) {
                var start = i; i++;
                var inClass = false;
                while (i < len && (code[i] !== '/' || inClass)) {
                    if (code[i] === '[') inClass = true;
                    if (code[i] === ']') inClass = false;
                    if (code[i] === '\\') i++;
                    i++;
                }
                if (i < len) i++;
                tokens.push({ type: 'regex', value: code.slice(start, i) });
                continue;
            }
            if (/[0-9]/.test(code[i]) || (code[i] === '.' && i+1 < len && /[0-9]/.test(code[i+1]))) {
                var start = i;
                if (code[i] === '0' && (code[i+1] === 'x' || code[i+1] === 'X')) {
                    i += 2;
                    while (i < len && /[0-9a-fA-F.]/.test(code[i])) i++;
                } else {
                    while (i < len && /[0-9.eE+\-xXoObBa-fA-F]/.test(code[i])) i++;
                }
                tokens.push({ type: 'number', value: code.slice(start, i) });
                continue;
            }
            if (/[a-zA-Z_$]/.test(code[i])) {
                var start = i;
                while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) i++;
                tokens.push({ type: 'ident', value: code.slice(start, i) });
                continue;
            }
            tokens.push({ type: 'punct', value: code[i] });
            i++;
        }
        return tokens;
    }

    function tokensToString(tokens) {
        var out = '';
        for (var i = 0; i < tokens.length; i++) out += tokens[i].value;
        return out;
    }

    var RESERVED = {
        'break':1,'case':1,'catch':1,'continue':1,'debugger':1,'default':1,'delete':1,'do':1,
        'else':1,'finally':1,'for':1,'function':1,'if':1,'in':1,'instanceof':1,'new':1,
        'return':1,'switch':1,'this':1,'throw':1,'try':1,'typeof':1,'var':1,'void':1,
        'while':1,'with':1,'class':1,'const':1,'enum':1,'export':1,'extends':1,'import':1,
        'super':1,'implements':1,'interface':1,'let':1,'package':1,'private':1,'protected':1,
        'public':1,'static':1,'yield':1,'async':1,'await':1,'of':1,'true':1,'false':1,
        'null':1,'undefined':1,'NaN':1,'Infinity':1,'arguments':1,'eval':1
    };

    function shortName(index, prefix) {
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
        var chars2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$0123456789';
        var name = prefix || '';
        if (index < chars.length) { name += chars[index]; }
        else {
            var n = index;
            while (n >= 0) { name += chars2[n % chars2.length]; n = Math.floor(n / chars2.length) - 1; }
        }
        return name;
    }

    function obfuscate(code, options) {
        options = options || {};
        var renameVars = options.renameVars !== false;
        var encodeStrings = options.encodeStrings === true;
        var encodeNumbers = options.encodeNumbers === true;
        var removeComments = options.removeComments !== false;
        var removeWhitespace = options.removeWhitespace !== false;
        var prefix = options.prefix || '_0x';

        var tokens = tokenize(code);
        if (removeComments) {
            tokens = tokens.filter(function(t) { return t.type !== 'comment'; });
        }

        var scopedVars = {};
        var varCounter = 0;

        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.type === 'ident' && (t.value === 'var' || t.value === 'let' || t.value === 'const')) {
                var j = i + 1;
                while (j < tokens.length) {
                    if (tokens[j].type === 'ident' && !RESERVED[tokens[j].value]) {
                        if (!scopedVars[tokens[j].value]) scopedVars[tokens[j].value] = shortName(varCounter++, prefix);
                        j++;
                    } else if (tokens[j].type === 'punct' && tokens[j].value === ',') { j++; }
                    else { break; }
                }
            }
            if (t.type === 'ident' && t.value === 'function') {
                var j = i + 1;
                if (j < tokens.length && tokens[j].type === 'ident') j++;
                if (j < tokens.length && tokens[j].type === 'punct' && tokens[j].value === '(') {
                    j++;
                    while (j < tokens.length) {
                        if (tokens[j].type === 'ident' && !RESERVED[tokens[j].value]) {
                            if (!scopedVars[tokens[j].value]) scopedVars[tokens[j].value] = shortName(varCounter++, prefix);
                            j++;
                        } else if (tokens[j].type === 'punct' && (tokens[j].value === ',' || tokens[j].value === '=')) { j++; }
                        else { break; }
                    }
                }
            }
            if (t.type === 'punct' && t.value === '=>' && i >= 1) {
                var j = i - 1;
                while (j >= 0 && tokens[j].type === 'ws') j--;
                if (j >= 0 && tokens[j].type === 'punct' && tokens[j].value === ')') {
                    var parens = 1; j--;
                    while (j >= 0 && parens > 0) {
                        if (tokens[j].type === 'punct') { if (tokens[j].value === ')') parens++; if (tokens[j].value === '(') parens--; }
                        j--;
                    }
                    while (j >= 0) {
                        if (tokens[j].type === 'ident' && !RESERVED[tokens[j].value]) {
                            if (!scopedVars[tokens[j].value]) scopedVars[tokens[j].value] = shortName(varCounter++, prefix);
                        } else if (tokens[j].type === 'punct' && tokens[j].value === ',') { j--; continue; }
                        else { break; }
                        j--;
                    }
                } else if (j >= 0 && tokens[j].type === 'ident' && !RESERVED[tokens[j].value]) {
                    if (!scopedVars[tokens[j].value]) scopedVars[tokens[j].value] = shortName(varCounter++, prefix);
                }
            }
            if (t.type === 'ident' && t.value === 'catch') {
                var j = i + 1;
                while (j < tokens.length && tokens[j].type !== 'punct') j++;
                if (j < tokens.length && tokens[j].value === '(') {
                    j++;
                    while (j < tokens.length && tokens[j].type === 'ws') j++;
                    if (j < tokens.length && tokens[j].type === 'ident' && !RESERVED[tokens[j].value]) {
                        if (!scopedVars[tokens[j].value]) scopedVars[tokens[j].value] = shortName(varCounter++, prefix);
                    }
                }
            }
        }

        if (renameVars) {
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                if (t.type === 'ident' && scopedVars[t.value] && !RESERVED[t.value]) {
                    t.value = scopedVars[t.value];
                }
            }
        }

        if (encodeNumbers) {
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                if (t.type === 'number') {
                    var num = parseFloat(t.value);
                    if (!isNaN(num) && Number.isInteger(num) && num >= 0 && num < 10000) {
                        t.value = '0x' + num.toString(16);
                    }
                }
            }
        }

        if (encodeStrings) {
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                if (t.type === 'string' && t.value.length > 6) {
                    var q = t.value[0];
                    var c = t.value.slice(1, -1);
                    if (c.length > 4 && c.indexOf("'") === -1 && c.indexOf('"') === -1) {
                        var mid = Math.floor(c.length / 2);
                        t.value = q + c.slice(0, mid) + q + ' + ' + q + c.slice(mid) + q;
                    }
                }
            }
        }

        if (removeWhitespace) {
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].type === 'ws') {
                    var prev = i > 0 ? tokens[i-1] : null;
                    var next = i < tokens.length - 1 ? tokens[i+1] : null;
                    var needsSep = prev && next && ((prev.type === 'ident' || prev.type === 'number') && (next.type === 'ident' || next.type === 'number'));
                    tokens[i].value = needsSep ? ' ' : '';
                }
            }
        }

        return tokensToString(tokens);
    }

    function beautify(code) {
        var result = '', indent = 0, indentStr = '  ';
        var inString = false, stringChar = '';
        for (var i = 0; i < code.length; i++) {
            var ch = code[i];
            if (inString) {
                result += ch;
                if (ch === '\\') { i++; if (i < code.length) result += code[i]; }
                else if (ch === stringChar) inString = false;
                continue;
            }
            if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; result += ch; continue; }
            if (ch === '{') { result += ch + '\n' + indentStr.repeat(++indent); continue; }
            if (ch === '}') { indent = Math.max(0, indent - 1); result += '\n' + indentStr.repeat(indent) + '}' + '\n' + indentStr.repeat(indent); continue; }
            if (ch === ';') { result += ';\n' + indentStr.repeat(indent); continue; }
            if (ch === ',') { result += ', '; continue; }
            if (/\s/.test(ch)) { if (result.length > 0 && !/\s/.test(result[result.length-1])) result += ' '; continue; }
            result += ch;
        }
        return result.replace(/\n{3,}/g, '\n\n').trim();
    }

    function doObfuscate() {
        var code = input.value.trim();
        if (!code) { output.value = T('⚠️ 请输入 JavaScript 代码', '⚠️ Please enter JavaScript code'); return; }
        try {
            var preset = presetSelect ? presetSelect.value : 'light';
            var options;
            if (preset === 'light') options = { renameVars: true, encodeStrings: false, encodeNumbers: false, removeComments: true, removeWhitespace: true, prefix: '_0x' };
            else if (preset === 'medium') options = { renameVars: true, encodeStrings: true, encodeNumbers: false, removeComments: true, removeWhitespace: true, prefix: '_0x' };
            else options = { renameVars: true, encodeStrings: true, encodeNumbers: true, removeComments: true, removeWhitespace: true, prefix: '_0x' };
            var result = obfuscate(code, options);
            output.value = result;
            updateStats(code.length, result.length);
        } catch (e) { output.value = T('❌ 混淆失败: ', '❌ Obfuscation failed: ') + e.message; }
    }

    function doBeautify() {
        var code = input.value.trim();
        if (!code) { output.value = T('⚠️ 请输入 JavaScript 代码', '⚠️ Please enter JavaScript code'); return; }
        try {
            var result = beautify(code);
            output.value = result;
            updateStats(code.length, result.length);
        } catch (e) { output.value = T('❌ 美化失败: ', '❌ Beautify failed: ') + e.message; }
    }

    function updateStats(inputLen, outputLen) {
        if (!statsEl) return;
        var ratio = inputLen > 0 ? ((outputLen / inputLen) * 100).toFixed(1) : '0';
        statsEl.innerHTML = isEN ? ('Input: ' + inputLen + ' chars | Output: ' + outputLen + ' chars | Ratio: ' + ratio + '%') : ('输入: ' + inputLen + ' 字符 | 输出: ' + outputLen + ' 字符 | 压缩比: ' + ratio + '%');
    }

    function doCopy() {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(function() {
            var orig = copyBtn.textContent;
            copyBtn.textContent = T('✅ 已复制', '✅ Copied');
            setTimeout(function() { copyBtn.textContent = orig; }, 1500);
        }).catch(function() { output.select(); document.execCommand('copy'); });
    }

    function doClear() { input.value = ''; output.value = ''; updateStats(0, 0); input.focus(); }

    input.addEventListener('keydown', function(e) { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doObfuscate(); } });
    obfuscateBtn.addEventListener('click', doObfuscate);
    if (beautifyBtn) beautifyBtn.addEventListener('click', doBeautify);
    if (copyBtn) copyBtn.addEventListener('click', doCopy);
    if (clearBtn) clearBtn.addEventListener('click', doClear);
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
else { init(); }
})();
