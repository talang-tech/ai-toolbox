// HTML Live Preview - Renders HTML/CSS/JS in real-time
(() => {
  const input = document.getElementById('hpInput');
  const iframe = document.getElementById('hpPreview');
  const runBtn = document.getElementById('hpRun');
  const clearBtn = document.getElementById('hpClear');
  const copyBtn = document.getElementById('hpCopy');

  if (!input || !iframe) return;

  function render(code) {
    // Use srcdoc instead of srcDoc for broader compatibility
    try {
      iframe.setAttribute('srcdoc', code);
    } catch (e) {
      // Fallback: write to document
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    }
  }

  function run() {
    const code = input.value;
    render(code);
  }

  // Auto-run on load
  run();

  // Run button
  if (runBtn) runBtn.addEventListener('click', run);

  // Ctrl+Enter shortcut
  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });

  // Auto-run after pause (debounced)
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 500);
  });

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; padding: 20px; }\n</style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>Start editing HTML here...</p>\n</body>\n</html>';
      run();
    });
  }

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = input.value;
      navigator.clipboard.writeText(text).then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
      });
    });
  }

  // Error handling in iframe
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'hp-error') {
      console.warn('[HTML Preview] Script error in preview:', e.data.message);
    }
  });
})();