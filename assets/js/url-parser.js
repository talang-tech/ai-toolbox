// URL Parser / Parameter Extractor
(() => {
  const input = document.getElementById('upInput');
  const output = document.getElementById('upOutput');
  const parseBtn = document.getElementById('upParse');
  const copyBtn = document.getElementById('upCopy');
  const isEN = document.documentElement.lang === 'en';

  function parse() {
    try {
      const url = new URL(input.value.trim());
      const params = Array.from(url.searchParams.entries());
      const result = {
        href: url.href,
        protocol: url.protocol,
        origin: url.origin,
        host: url.host,
        hostname: url.hostname,
        port: url.port || '(default)',
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        username: url.username || '(none)',
        parameters: Object.fromEntries(params)
      };
      
      let html = `<table style="width:100%;border-collapse:collapse;">
        ${Object.entries(result).map(([k,v]) => {
          if (k === 'parameters') {
            return `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid var(--border)">${k}</th><td style="padding:8px;border-bottom:1px solid var(--border)"><pre style="margin:0">${JSON.stringify(v, null, 2)}</pre></td></tr>`;
          }
          return `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid var(--border);width:140px">${k}</th><td style="padding:8px;border-bottom:1px solid var(--border)"><code>${v}</code></td></tr>`;
        }).join('')}
      </table>`;
      
      output.innerHTML = html;
      showToast(isEN ? 'Parsed!' : '已解析!');
    } catch (e) {
      output.innerHTML = `<div style="color:#ef4444">${isEN ? 'Invalid URL' : 'URL 格式错误'}: ${e.message}</div>`;
    }
  }

  parseBtn.addEventListener('click', parse);
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(input.value);
    showToast(isEN ? 'Copied!' : '已复制!');
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') parse(); });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
