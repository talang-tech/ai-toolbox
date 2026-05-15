// Cron Expression Parser
(() => {
  const input = document.getElementById('ceInput');
  const output = document.getElementById('ceOutput');
  const parseBtn = document.getElementById('ceParse');
  const isEN = document.documentElement.lang === 'en';

  // 简单的字段名
  const fieldNames = isEN 
    ? ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week']
    : ['分钟', '小时', '日期', '月份', '星期'];

  function parseCron(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) throw new Error(isEN ? 'Need 5 fields' : '需要 5 个字段');
    return parts;
  }

  function getNextRuns(expr, count = 5) {
    const parts = parseCron(expr);
    const [minExpr, hourExpr, dayExpr, monthExpr, dowExpr = parts;
    
    const result = [];
    let now = new Date();
    
    // 简单实现：只支持 * 和数字
    const matches = (val, expr) => {
      if (expr === '*') return true;
      if (expr.includes(',')) return expr.split(',').some(v => String(val) === v.trim());
      if (expr.includes('-')) {
        const [start, end = expr.split('-').map(Number);
        return val >= start && val <= end;
      }
      if (expr.startsWith('*/')) {
        const step = parseInt(expr.slice(2));
        return val % step === 0;
      }
      return String(val) === expr;
    };

    // 查找接下来的 count 个
    for (let i = 0; i < 10000 && result.length < count; i++) {
      now = new Date(now.getTime() + 60000); // +1 分钟
      if (
        matches(now.getMinutes(), minExpr) &&
        matches(now.getHours(), hourExpr) &&
        matches(now.getDate(), dayExpr) &&
        matches(now.getMonth() + 1, monthExpr) &&
        matches(now.getDay(), dowExpr === '7' ? 0 : (dowExpr === '*' ? true : (dowExpr === '0' ? 0 : dowExpr))
      ) {
        result.push(new Date(now));
      }
    }
    return result;
  }

  function parse() {
    try {
      const parts = parseCron(input.value);
      const nextRuns = getNextRuns(input.value);
      
      let html = `<h4 style="margin:12px 0 8px">${isEN ? 'Field breakdown' : '字段分解'}</h4>`;
      html += `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">`;
      for (let i = 0; i < 5; i++) {
        html += `<tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);width:120px">${fieldNames[i]}</th><td style="padding:6px 8px;border-bottom:1px solid var(--border)"><code>${parts[i]}</code></td></tr>`;
      }
      html += `</table>`;
      
      html += `<h4 style="margin:12px 0 8px">${isEN ? 'Next 5 runs' : '接下来 5 次执行'}</h4>`;
      html += `<ul style="margin:0;padding-left:20px">`;
      for (const run of nextRuns) {
        html += `<li style="padding:4px 0"><code>${run.toLocaleString()}</code></li>`;
      }
      if (nextRuns.length === 0) {
        html += `<li style="color:#ef4444">${isEN ? 'No matching times found' : '未找到匹配的执行时间'}</li>`;
      }
      html += `</ul>`;
      
      output.innerHTML = html;
      showToast(isEN ? 'Parsed!' : '已解析!');
    } catch (e) {
      output.innerHTML = `<div style="color:#ef4444">${e.message}</div>`;
    }
  }

  parseBtn.addEventListener('click', parse);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') parse(); });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
