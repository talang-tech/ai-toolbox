// Cron Expression Generator
// Generates cron expressions from presets, natural language, or manual input
(function() {
  const preset = document.getElementById('cgPreset');
  const natural = document.getElementById('cgNatural');
  const parseBtn = document.getElementById('cgParseNatural');
  const cgMin = document.getElementById('cgMin');
  const cgHour = document.getElementById('cgHour');
  const cgDay = document.getElementById('cgDay');
  const cgMonth = document.getElementById('cgMonth');
  const cgDow = document.getElementById('cgDow');
  const buildBtn = document.getElementById('cgBuild');
  const resultDiv = document.getElementById('cgResult');
  const nextRunsDiv = document.getElementById('cgNextRuns');

  if (!preset) return;

  const isEN = document.documentElement.lang === 'en';

  // Common presets
  preset.addEventListener('change', () => {
    const val = preset.value;
    if (!val) return;
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      cgMin.value = parts[0];
      cgHour.value = parts[1];
      cgDay.value = parts[2];
      cgMonth.value = parts[3];
      cgDow.value = parts[4];
      buildCron();
    }
  });

  // Build from manual fields
  function buildCron() {
    const fields = [cgMin.value.trim() || '*', cgHour.value.trim() || '*', cgDay.value.trim() || '*', cgMonth.value.trim() || '*', cgDow.value.trim() || '*'];
    const expr = fields.join(' ');
    showResult(expr);
    showNextRuns(expr);
  }

  function validateFields(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(isEN ? 'Need exactly 5 fields' : '需要恰好 5 个字段');
    }
    const ranges = [[0,59],[0,23],[1,31],[1,12],[0,7]];
    const names = isEN ? ['minute','hour','day','month','weekday'] : ['分钟','小时','日期','月份','星期'];
    for (let i = 0; i < 5; i++) {
      const field = parts[i];
      if (field === '*') continue;
      // Check each token
      for (const token of field.split(',')) {
        if (token === '*') continue;
        // Remove step
        const base = token.includes('/') ? token.split('/')[0] : token;
        if (base === '*') continue;
        if (base.includes('-')) {
          const [l, r] = base.split('-').map(Number);
          if (isNaN(l) || isNaN(r) || l < ranges[i][0] || r > ranges[i][1] || l > r) {
            throw new Error(names[i] + ' ' + (isEN ? 'range error' : '范围错误'));
          }
        } else {
          const v = parseInt(base, 10);
          if (isNaN(v) || v < ranges[i][0] || v > ranges[i][1]) {
            throw new Error(names[i] + ' ' + v + ' ' + (isEN ? 'out of range' : '超出范围'));
          }
        }
      }
    }
  }

  function showResult(expr) {
    try {
      validateFields(expr);
      resultDiv.innerHTML = '<div style="padding:16px;background:var(--bg-card);border-radius:12px;border:1px solid var(--border)">' +
        '<div style="display:flex;align-items:center;gap:12px;justify-content:space-between">' +
        '<div><span style="color:var(--text-dim);font-size:13px">' + (isEN ? 'Expression' : '表达式') + '</span><br>' +
        '<code style="font-size:22px;font-weight:700;color:var(--accent);font-family:monospace">' + expr + '</code></div>' +
        '<button class="btn" onclick="navigator.clipboard.writeText(\'' + expr.replace(/'/g, "\\'") + '\').then(()=>toast(\'' + (isEN ? 'Copied!' : '已复制!') + '\'))">📋 ' + (isEN ? 'Copy' : '复制') + '</button></div></div>';
    } catch (e) {
      resultDiv.innerHTML = '<div style="color:var(--error);padding:12px">⚠ ' + e.message + '</div>';
    }
  }

  // Show next 5 run times (reuse simple logic from cron-parser)
  function showNextRuns(expr) {
    try {
      const parts = expr.trim().split(/\s+/);
      if (parts.length !== 5) return;
      const [minExpr, hourExpr, dayExpr, monthExpr, dowExpr] = parts;

      const matches = (val, e) => {
        if (e === '*') return true;
        if (e.includes(',')) return e.split(',').some(v => String(val) === v.trim());
        if (e.includes('-')) { const [s, end] = e.split('-').map(Number); return val >= s && val <= end; }
        if (e.includes('/')) {
          const step = parseInt(e.split('/')[1]);
          return val % step === 0;
        }
        return String(val) === e;
      };

      const nextRuns = [];
      let now = new Date();
      for (let i = 0; i < 10000 && nextRuns.length < 5; i++) {
        now = new Date(now.getTime() + 60000);
        if (
          matches(now.getMinutes(), minExpr) &&
          matches(now.getHours(), hourExpr) &&
          matches(now.getDate(), dayExpr) &&
          matches(now.getMonth() + 1, monthExpr) &&
          matches(now.getDay(), dowExpr === '7' ? '0' : dowExpr)
        ) {
          nextRuns.push(new Date(now));
        }
      }

      if (nextRuns.length === 0) {
        nextRunsDiv.innerHTML = '<div style="color:var(--text-dim);margin-top:8px">' + (isEN ? 'No future runs found' : '未找到后续执行时间') + '</div>';
        return;
      }

      const fmt = d => {
        const pad = n => String(n).padStart(2,'0');
        return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      };

      nextRunsDiv.innerHTML = '<div style="margin-top:12px;padding:12px;background:var(--bg-hover);border-radius:8px">' +
        '<div style="color:var(--text-dim);font-size:13px;margin-bottom:8px">' + (isEN ? 'Next 5 runs' : '接下来 5 次执行时间') + ':</div>' +
        '<div style="font-family:monospace;font-size:14px;line-height:1.8">' +
        nextRuns.map((d, i) => '<div>' + (i+1) + '. ' + fmt(d) + '</div>').join('') +
        '</div></div>';
    } catch (e) {
      nextRunsDiv.innerHTML = '';
    }
  }

  // Natural language to cron
  function parseNatural(text) {
    const t = (text || '').trim().toLowerCase();
    if (!t) return null;

    // Chinese patterns
    const patterns = [
      // 每N分钟
      { re: /每\s*(\d+)\s*分(?:钟)?/, fn: (m) => '*/' + m[1] + ' * * * *' },
      // 每隔N分钟
      { re: /每隔\s*(\d+)\s*分(?:钟)?/, fn: (m) => '*/' + m[1] + ' * * * *' },
      // 每N小时
      { re: /每\s*(\d+)\s*小?时(?:整)?/, fn: (m) => '0 */' + m[1] + ' * * *' },
      // 每隔N小时
      { re: /每隔\s*(\d+)\s*小?时/, fn: (m) => '0 */' + m[1] + ' * * *' },
      // 每天凌晨/早上/上午 N 点
      { re: /每天(?:凌晨|早上|上午|早晨)\s*(\d+)\s*点/, fn: (m) => '0 ' + m[1] + ' * * *' },
      // 每天下午 N 点
      { re: /每天(?:下午|晚上)\s*(\d+)\s*点/, fn: (m) => '0 ' + (parseInt(m[1]) + 12) + ' * * *' },
      // 每天 N 点
      { re: /每天\s*(\d+)\s*点/, fn: (m) => '0 ' + m[1] + ' * * *' },
      // 每周一/二/三
      { re: /每周([一二三四五六日天])/, fn: (m) => { const map={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':0,'天':0}; return '0 0 * * ' + (map[m[1]] ?? '*'); } },
      // 每月 N 号
      { re: /每月\s*(\d+)\s*[号日]/, fn: (m) => '0 0 ' + m[1] + ' * *' },
      // 每分钟
      { re: /每分(?:钟)?/, fn: () => '* * * * *' },
      // English patterns
      { re: /every\s+(\d+)\s+min/, fn: (m) => '*/' + m[1] + ' * * * *' },
      { re: /every\s+(\d+)\s+hour/, fn: (m) => '0 */' + m[1] + ' * * *' },
      { re: /daily at (\d+)/, fn: (m) => '0 ' + m[1] + ' * * *' },
      { re: /every\s+min/, fn: () => '* * * * *' },
      { re: /every\s+hour/, fn: () => '0 * * * *' },
      { re: /every\s+day/, fn: () => '0 0 * * *' },
      { re: /every\s+week/, fn: () => '0 0 * * 1' },
      { re: /every\s+month/, fn: () => '0 0 1 * *' },
    ];

    for (const p of patterns) {
      const m = t.match(p.re);
      if (m) return p.fn(m);
    }

    return null;
  }

  parseBtn.addEventListener('click', () => {
    const expr = parseNatural(natural.value);
    if (expr) {
      const parts = expr.split(/\s+/);
      if (parts.length === 5) {
        cgMin.value = parts[0];
        cgHour.value = parts[1];
        cgDay.value = parts[2];
        cgMonth.value = parts[3];
        cgDow.value = parts[4];
        buildCron();
      }
    } else {
      resultDiv.innerHTML = '<div style="color:var(--error);padding:12px">⚠ ' + (isEN ? 'Cannot parse description. Try: every 15 min, daily at 3 AM, every 2 hours' : '无法解析描述。试试：每15分钟、每天凌晨3点、每隔2小时') + '</div>';
      nextRunsDiv.innerHTML = '';
    }
  });

  natural.addEventListener('keydown', e => {
    if (e.key === 'Enter') parseBtn.click();
  });

  buildBtn.addEventListener('click', buildCron);

  // Initial state
  preset.value = '0 0 * * *';
  preset.dispatchEvent(new Event('change'));
})();