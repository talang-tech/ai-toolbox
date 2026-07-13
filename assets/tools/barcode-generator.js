/**
 * Barcode Generator — Code128 / EAN-13 / UPC-A / Code39 / EAN-8
 * AI Toolbox - Privacy-first browser-local tool
 *
 * Pure JS Canvas implementation, no external dependencies.
 */
(function() {
'use strict';

function init() {
    const formatEl = document.getElementById('bg-format');
    const inputEl = document.getElementById('bg-input');
    const heightEl = document.getElementById('bg-height');
    const widthEl = document.getElementById('bg-width');
    const canvas = document.getElementById('bg-canvas');
    const statusEl = document.getElementById('bg-status');
    const dlPng = document.getElementById('bg-download-png');
    const dlSvg = document.getElementById('bg-download-svg');
    const isEN = document.documentElement.lang === 'en';

    if (!formatEl || !inputEl || !canvas) return;

    // --- Code128 encoding patterns ---
    var CODE128_PATTERNS = {};
    var c128 = [
        '11011001100','11001101100','11001100110','10010011000','10010001100',
        '10001001100','10011001000','10011000100','10001100100','11001001000',
        '11001000100','11000100100','10110011100','10011011100','10011001110',
        '10111001100','10011101100','10011100110','11001110010','11001011100',
        '11001001110','11011100100','11001110100','11101101110','11101001100',
        '11100101100','11100100110','11101100100','11100110100','11100110010',
        '11011011000','11011000110','11000110110','10100011000','10001011000',
        '10001000110','10110001000','10001101000','10001100010','11010001000',
        '11000101000','11000100010','10110111000','10110001110','10001101110',
        '10111011000','10111000110','10001110110','11101110110','11010001110',
        '11000101110','11011101000','11011100010','11011101110','11101011000',
        '11101000110','11100010110','11101101000','11101100010','11100011010',
        '11101111010','11001000010','11110001010','10100110000','10100001100',
        '10010110000','10010000110','10000101100','10000100110','10110010000',
        '10110000100','10011010000','10011000010','10000110100','10000110010',
        '11000010010','11001010000','11110111010','11000010100','10001111010',
        '10100111100','10010111100','10010011110','10111100100','10011110100',
        '10011110010','11110100100','11110010100','11110010010','11011011110',
        '11011110110','11110110110','10101111000','10100011110','10001011110',
        '10111101000','10111100010','10001111010','10111011110','10111101110',
        '11101011110','11110101110','11010000100','11010001100','11010011100',
        '11011011100'
    ];
    for (var i = 0; i < c128.length; i++) {
        CODE128_PATTERNS[i] = c128[i];
    }

    function encodeCode128B(text) {
        var data = '11010010000'; // Start B code=104
        var checksum = 104;
        for (var i = 0; i < text.length; i++) {
            var code = text.charCodeAt(i) - 32;
            if (code < 0 || code > 98) code = 0;
            data += CODE128_PATTERNS[code];
            checksum += code * (i + 1);
        }
        checksum = checksum % 103;
        data += CODE128_PATTERNS[checksum];
        data += '1100011101011'; // Stop
        return data;
    }

    // --- Code39 ---
    var CODE39_MAP = {
        '0':'101000111011101','1':'111010001010111','2':'101110001010111',
        '3':'111011100010101','4':'101000111010111','5':'111010001110101',
        '6':'101110001110101','7':'101000101110111','8':'111010001011101',
        '9':'101110001011101','A':'111010100010111','B':'101110100010111',
        'C':'111011101000101','D':'101011100010111','E':'111010111000101',
        'F':'101110111000101','G':'101010001110111','H':'111010100011101',
        'I':'101110100011101','J':'101011100011101','K':'111010101000111',
        'L':'101110101000111','M':'111011101010001','N':'101011101000111',
        'O':'111010111010001','P':'101110111010001','Q':'101010111000111',
        'R':'111010101110001','S':'101110101110001','T':'101011101110001',
        'U':'111000101010111','V':'101110001010111','W':'111011100010101',
        'X':'101000111010111','Y':'111000101110101','Z':'101110001110101',
        '-':'101000101110111','.':'111000101011101',' ':'101110001011101',
        '$':'111010100010001','/':'111010100010001','+':'111010100010001',
        '%':'111010100010001','*':'101011011100111'
    };

    function encodeCode39(text) {
        var data = '';
        var upper = text.toUpperCase();
        for (var i = 0; i < upper.length; i++) {
            if (CODE39_MAP[upper[i]]) {
                data += CODE39_MAP[upper[i]] + '0';
            }
        }
        if (data.length > 0) {
            data = CODE39_MAP['*'] + '0' + data + CODE39_MAP['*'];
        }
        return data;
    }

    // --- EAN patterns ---
    var EAN_L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
    var EAN_R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
    var EAN_G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
    var EAN_PARITY = [
        ['L','L','L','L','L','L'],['L','L','G','L','G','G'],['L','L','G','G','L','G'],
        ['L','L','G','G','G','L'],['L','G','L','L','G','G'],['L','G','G','L','L','G'],
        ['L','G','G','G','L','L'],['L','G','L','G','L','G'],['L','G','L','G','G','L'],
        ['L','G','G','L','G','L']
    ];

    function calcCheckDigit(digits) {
        var odd = 0, even = 0;
        for (var i = 0; i < digits.length; i++) {
            if (i % 2 === 0) odd += digits[i];
            else even += digits[i];
        }
        return (10 - ((odd * 3 + even) % 10)) % 10;
    }

    function encodeEAN13(text) {
        var clean = text.replace(/\D/g, '');
        while (clean.length < 12) clean += '0';
        if (clean.length > 12) clean = clean.slice(0, 12);
        var digits = clean.split('').map(Number);
        var check = calcCheckDigit(digits);
        digits.push(check);
        var data = '101';
        var parity = EAN_PARITY[digits[0]];
        for (var i = 0; i < 6; i++) {
            data += parity[i] === 'L' ? EAN_L[digits[i+1]] : EAN_G[digits[i+1]];
        }
        data += '01010';
        for (var j = 0; j < 6; j++) data += EAN_R[digits[j+7]];
        data += '101';
        return { data: data, digits: digits, check: check };
    }

    function encodeUPCA(text) {
        var clean = text.replace(/\D/g, '');
        while (clean.length < 11) clean += '0';
        if (clean.length > 11) clean = clean.slice(0, 11);
        var digits = clean.split('').map(Number);
        var check = calcCheckDigit(digits);
        digits.push(check);
        var data = '101';
        for (var i = 0; i < 6; i++) data += EAN_L[digits[i]];
        data += '01010';
        for (var j = 0; j < 6; j++) data += EAN_R[digits[j+6]];
        data += '101';
        return { data: data, digits: digits, check: check };
    }

    function encodeEAN8(text) {
        var clean = text.replace(/\D/g, '');
        while (clean.length < 7) clean += '0';
        if (clean.length > 7) clean = clean.slice(0, 7);
        var digits = clean.split('').map(Number);
        var check = calcCheckDigit(digits);
        digits.push(check);
        var data = '101';
        for (var i = 0; i < 4; i++) data += EAN_L[digits[i]];
        data += '01010';
        for (var j = 0; j < 4; j++) data += EAN_R[digits[j+4]];
        data += '101';
        return { data: data, digits: digits, check: check };
    }

    // --- Render ---

    function render() {
        var format = formatEl.value;
        var text = inputEl.value.trim();
        var barHeight = parseInt(heightEl.value) || 80;
        var barWidth = parseFloat(widthEl.value) || 2;
        var binary, displayText, humanText;

        if (!text) {
            statusEl.textContent = isEN ? 'Please enter data to encode' : '请输入要编码的数据';
            dlPng.style.display = 'none';
            dlSvg.style.display = 'none';
            return;
        }

        try {
            switch (format) {
                case 'code128':
                    binary = encodeCode128B(text);
                    displayText = text;
                    break;
                case 'code39':
                    binary = encodeCode39(text);
                    displayText = text.toUpperCase();
                    break;
                case 'ean13': {
                    var ean13 = encodeEAN13(text);
                    binary = ean13.data;
                    var d = ean13.digits;
                    displayText = d.join('');
                    humanText = d[0] + ' ' + d.slice(1,7).join('') + ' ' + d.slice(7,12).join('') + ' ' + d[12];
                    break;
                }
                case 'upca': {
                    var upca = encodeUPCA(text);
                    binary = upca.data;
                    var du = upca.digits;
                    displayText = du.join('');
                    humanText = du[0] + ' ' + du.slice(1,6).join('') + ' ' + du.slice(6,11).join('') + ' ' + du[11];
                    break;
                }
                case 'ean8': {
                    var ean8 = encodeEAN8(text);
                    binary = ean8.data;
                    var d8 = ean8.digits;
                    displayText = d8.join('');
                    humanText = d8.slice(0,4).join('') + ' ' + d8.slice(4,8).join('');
                    break;
                }
                default:
                    statusEl.textContent = isEN ? 'Unknown format' : '未知格式';
                    return;
            }
        } catch (e) {
            statusEl.textContent = isEN ? 'Encoding error: ' + e.message : '编码错误: ' + e.message;
            return;
        }

        var totalWidth = binary.length * barWidth;
        var padding = 20;
        var labelText = humanText || displayText;
        var textHeight = labelText ? 20 : 0;
        var canvasWidth = totalWidth + padding * 2;
        var canvasHeight = barHeight + textHeight + padding * 2;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        var ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw bars
        var x = padding;
        ctx.fillStyle = '#000000';
        for (var i = 0; i < binary.length; i++) {
            if (binary[i] === '1') {
                ctx.fillRect(x, padding, barWidth, barHeight);
            }
            x += barWidth;
        }

        // Draw human-readable text
        if (labelText) {
            ctx.fillStyle = '#000000';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(labelText, canvasWidth / 2, barHeight + padding + 4);
        }

        statusEl.textContent = isEN ? '✓ Barcode generated successfully' : '✓ 条形码已生成';

        // Download buttons
        dlPng.style.display = 'inline-flex';
        dlPng.onclick = function() {
            var link = document.createElement('a');
            link.download = 'barcode-' + format + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        dlSvg.style.display = 'inline-flex';
        dlSvg.onclick = function() {
            var svg = canvasToSVG(canvas, binary, labelText, padding, barHeight, totalWidth, canvasWidth, canvasHeight);
            var blob = new Blob([svg], { type: 'image/svg+xml' });
            var link = document.createElement('a');
            link.download = 'barcode-' + format + '.svg';
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        };
    }

    function canvasToSVG(canvas, binary, labelText, padding, barHeight, totalWidth, cw, ch) {
        var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
        svg += '<svg xmlns="http://www.w3.org/2000/svg" width="' + cw + '" height="' + ch + '" viewBox="0 0 ' + cw + ' ' + ch + '">\n';
        svg += '  <rect width="100%" height="100%" fill="#ffffff"/>\n';
        // Bars
        var x = padding;
        for (var i = 0; i < binary.length; i++) {
            if (binary[i] === '1') {
                svg += '  <rect x="' + x + '" y="' + padding + '" width="' + (parseFloat(widthEl.value) || 2) + '" height="' + barHeight + '" fill="#000000"/>\n';
            }
            x += parseFloat(widthEl.value) || 2;
        }
        // Text
        if (labelText) {
            svg += '  <text x="' + (cw/2) + '" y="' + (barHeight + padding + 4) + '" text-anchor="middle" font-family="monospace" font-size="14" fill="#000000">' + escXml(labelText) + '</text>\n';
        }
        svg += '</svg>';
        return svg;
    }

    function escXml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // --- Event bindings ---

    function handleInput() { render(); }

    formatEl.addEventListener('change', handleInput);
    inputEl.addEventListener('input', handleInput);
    heightEl.addEventListener('input', handleInput);
    widthEl.addEventListener('input', handleInput);

    // Initial render
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();