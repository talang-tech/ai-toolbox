// Case Converter
(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const copyBtn = document.getElementById('copyBtn');

  const transforms = {
    upper: s => s.toUpperCase(),
    lower: s => s.toLowerCase(),
    title: s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    sentence: s => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
    camel: s => s.toLowerCase().replace(/[\s_-]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, c => c.toLowerCase()),
    snake: s => s.trim().replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase(),
    kebab: s => s.trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase(),
    const: s => s.trim().replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toUpperCase(),
  };

  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      output.value = transforms[mode](input.value);
    });
  });

  copyBtn.addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });
})();
