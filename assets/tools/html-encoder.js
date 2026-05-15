// HTML Encoder
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('html-input');
    const encodedOutput = document.getElementById('encoded-output');
    const decodedOutput = document.getElementById('decoded-output');
    const encodeNamed = document.getElementById('encode-named');
    const encodeNumeric = document.getElementById('encode-numeric');
    
    if (!input || !encodedOutput) return;

    const NAMED_ENTITIES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        ' ': '&nbsp;',
        '¡': '&iexcl;',
        '¢': '&cent;',
        '£': '&pound;',
        '¥': '&yen;',
        '©': '&copy;',
        '®': '&reg;',
        '™': '&trade;',
        '×': '&times;',
        '÷': '&divide;'
    };

    function encodeHTML(str, useNumeric = false) {
        if (useNumeric) {
            return str.replace(/[\u00A0-\u9999<>&"']/g, c => 
                `&#${c.charCodeAt(0)};`
            );
        }
        return str.replace(/[<>&"'\u00A0-\u00FF]/g, c => 
            NAMED_ENTITIES[c] || `&#${c.charCodeAt(0)};`
        );
    }

    function decodeHTML(str) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    }

    function update() {
        const text = input.value;
        const useNumeric = encodeNumeric?.checked;
        
        encodedOutput.value = encodeHTML(text, useNumeric);
        decodedOutput.value = decodeHTML(text);
    }

    input.addEventListener('input', update);
    encodeNamed?.addEventListener('change', update);
    encodeNumeric?.addEventListener('change', update);

    // Copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const target = document.getElementById(targetId);
            if (target) {
                target.select();
                document.execCommand('copy');
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = original, 1500);
            }
        });
    });

    // Sample data
    input.value = '<div class="container">\n    <h1>Hello, World!</h1>\n    <p>This is a "test" with special chars: &copy; &trade;</p>\n</div>';
    update();
});
