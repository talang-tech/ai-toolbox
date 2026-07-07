/**
 * HTML to PDF - Uses browser Print API, fully local
 * Zero dependencies
 */
(function() {
'use strict';

function init() {
    const input = document.getElementById('hpInput');
    const generateBtn = document.getElementById('hpGenerate');
    const paperSelect = document.getElementById('hpPaper');
    const orientationSelect = document.getElementById('hpOrientation');
    const marginCheckbox = document.getElementById('hpMargin');
    const statusEl = document.getElementById('hpStatus');

    if (!input || !generateBtn) return;

    function generatePDF() {
        const html = input.value.trim();
        if (!html) {
            setStatus('⚠️ 请先输入 HTML 内容', 'warning');
            return;
        }

        const paper = paperSelect ? paperSelect.value : 'a4';
        const orientation = orientationSelect ? orientationSelect.value : 'portrait';
        const noMargins = marginCheckbox ? marginCheckbox.checked : false;

        setStatus('⏳ 正在打开打印预览...', '');

        // Build the full HTML document
        let content = html;
        // Wrap bare content if needed
        if (!/<!DOCTYPE|<\s*html/i.test(content)) {
            content = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>Document</title><style>* { margin: 0; padding: 0; box-sizing: border-box; }</style></head><body>${content}</body></html>`;
        }

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        document.body.appendChild(iframe);

        // Calculate paper dimensions for @page
        const paperWidth = paper === 'letter' ? '8.5in' : '210mm';
        const paperHeight = paper === 'letter' ? '11in' : '297mm';
        const marginVal = noMargins ? '0' : '15mm';
        const pageCSS = `@page { size: ${paperWidth} ${paperHeight} ${orientation}; margin: ${marginVal}; }`;

        // Inject into iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();

        // Inject @page rule
        const style = iframeDoc.createElement('style');
        style.textContent = pageCSS;
        iframeDoc.head.appendChild(style);

        // Wait for iframe content to load, then print
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                setStatus('✅ PDF 打印预览已打开', 'success');
            } catch (e) {
                setStatus('❌ PDF 生成失败: ' + e.message, 'error');
            } finally {
                // Remove iframe after a delay (print dialog is blocking)
                setTimeout(() => {
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                }, 3000);
            }
        }, 500);
    }

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.style.color = type === 'error' ? 'var(--error, #dc3545)' :
                              type === 'success' ? 'var(--success, #28a745)' :
                              type === 'warning' ? 'var(--warning, #ffc107)' : 'var(--text-dim)';
    }

    generateBtn.addEventListener('click', generatePDF);

    // Enter key shortcut in textarea
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            generatePDF();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();