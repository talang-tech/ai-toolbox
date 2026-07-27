/**
 * Cron to Text - Translate Cron expressions into human-readable descriptions
 * AI Toolbox - 100% client-side processing
 */

(function() {
  'use strict';

  const input = document.getElementById('ct-input');
  const translateBtn = document.getElementById('ct-translate');
  const copyBtn = document.getElementById('ct-copy');
  const clearBtn = document.getElementById('ct-clear');
  const statusEl = document.getElementById('ct-status');
  const resultEl = document.getElementById('ct-result');
  const detailEl = document.getElementById('ct-detail');
  const fieldsEl = document.getElementById('ct-fields');

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const DAYS_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const MONTHS_CN = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const SPECIAL = {
    '@reboot': { zh: '系统启动时运行', en: 'Run at system startup' },
    '@yearly': { zh: '每年 1 月 1 日午夜运行', en: 'Run at midnight on January 1st every year' },
    '@annually': { zh: '每年 1 月 1 日午夜运行', en: 'Run at midnight on January 1st every year' },
    '@monthly': { zh: '每月 1 日午夜运行', en: 'Run at midnight on the first day of every month' },
    '@weekly': { zh: '每周日午夜运行', en: 'Run at midnight on Sunday every week' },
    '@daily': { zh: '每天午夜运行', en: 'Run at midnight every day' },
    '@hourly': { zh: '每小时运行一次', en: 'Run at the beginning of every hour' }
  };

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === 'error' ? '#e74c3c' : type === 'warn' ? '#f39c12' : type === 'success' ? '#27ae60' : 'var(--text-dim)';
  }

  function isChinese() {
    return document.documentElement.lang === 'zh' || document.documentElement.lang === 'zh-CN';
  }

  function _() {
    const args = arguments;
    const key = args[0];
    const zh = args[1];
    const en = args[2];
    return isChinese() ? zh : en;
  }

  function parseField(field, min, max, names) {
    if (field === '*') return { all: true, desc: _('', '任意', 'any') };
    if (field === '?') return { any: true, desc: _('', '任意（不指定）', 'any (not specified)') };

    const parts = field.split(',');
    const ranges = [];
    let steps = [];

    for (const part of parts) {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        steps.push(parseInt(step));
        if (range === '*') {
          ranges.push({ from: min, to: max, step: parseInt(step) });
        } else if (range.includes('-')) {
          const [from, to] = range.split('-').map(Number);
          ranges.push({ from, to, step: parseInt(step) });
        } else {
          const v = parseInt(range);
          ranges.push({ from: v, to: v, step: parseInt(step) });
        }
      } else if (part.includes('-')) {
        const [from, to] = part.split('-').map(Number);
        ranges.push({ from, to, step: 1 });
      } else if (part.includes('#')) {
        const [dow, occurrence] = part.split('#').map(Number);
        ranges.push({ from: dow, to: dow, step: 1, occurrence: occurrence });
      } else if (part === 'L') {
        ranges.push({ last: true });
      } else if (part.endsWith('W')) {
        const day = parseInt(part);
        ranges.push({ weekday: true, day });
      } else if (part.endsWith('L')) {
        const dow = parseInt(part);
        ranges.push({ lastDow: true, dow });
      } else {
        const v = parseInt(part);
        if (!isNaN(v)) ranges.push({ from: v, to: v, step: 1 });
      }
    }

    return { ranges, steps };
  }

  function describeField(field, min, max, names, fieldName) {
    const parsed = parseField(field, min, max, names);
    if (parsed.all) return _('', '每次', 'every');
    if (parsed.any) return _('', '不指定', 'not specified');

    const parts = [];
    const isEn = !isChinese();
    const namesArr = isEn ? DAYS : DAYS_CN;
    const monthNames = isEn ? MONTHS : MONTHS_CN;

    for (const r of parsed.ranges) {
      if (r.last) {
        if (fieldName === 'dom') parts.push(isEn ? 'last day of month' : '当月最后一天');
        else if (fieldName === 'dow') parts.push(isEn ? 'Saturday' : '周六');
        continue;
      }
      if (r.lastDow) {
        parts.push(isEn ? 'last ' + (DAYS[r.dow] || '') + ' of month' : '本月最后一个' + (DAYS_CN[r.dow] || ''));
        continue;
      }
      if (r.weekday) {
        parts.push(isEn ? 'nearest weekday to the ' + r.day + 'th' : r.day + ' 日最近的工作日');
        continue;
      }
      if (r.occurrence) {
        const dowName = isEn ? DAYS[r.from] : DAYS_CN[r.from];
        const ord = isEn ? (['first','second','third','fourth','fifth'][r.occurrence - 1] || r.occurrence) : ['第一','第二','第三','第四','第五'][r.occurrence - 1] || r.occurrence;
        parts.push(isEn ? ord + ' ' + dowName + ' of month' : '每月第' + ord + '个' + dowName);
        continue;
      }
      if (r.from === r.to) {
        const val = names ? namesArr[r.from] : r.from;
        parts.push(val);
      } else {
        const from = names ? namesArr[r.from] : r.from;
        const to = names ? namesArr[r.to] : r.to;
        parts.push(isEn ? from + ' to ' + to : from + ' 到 ' + to);
      }
    }

    return parts.join(isEn ? ', ' : '、');
  }

  function translateFiveFields(fields) {
    const isEn = !isChinese();
    const [minute, hour, dom, month, dow] = fields;

    const minDesc = describeField(minute, 0, 59, null, 'min');
    const hourDesc = describeField(hour, 0, 23, null, 'hour');
    const domDesc = describeField(dom, 1, 31, null, 'dom');
    const monthDesc = describeField(month, 1, 12, null, 'month');
    const dowDesc = describeField(dow, 0, 7, DAYS, 'dow');

    const parts = [];

    if (minute === '*' && hour === '*') {
      parts.push(isEn ? 'Every minute' : '每分钟');
    } else if (minute === '*') {
      if (hourDesc.includes(',') || hourDesc.includes('、') || hourDesc.includes('to') || hourDesc.includes('到')) {
        parts.push(isEn ? 'Every minute during hour(s): ' + hourDesc : '每小时 ' + hourDesc + ' 每分钟');
      } else {
        parts.push(isEn ? 'Every minute past the hour, between ' + hourDesc : '在 ' + hourDesc + ' 时每分钟');
      }
    } else if (hour === '*') {
      if (minute.includes('/')) {
        const step = minute.split('/')[1];
        parts.push(isEn ? 'Every ' + step + ' minute(s)' : '每 ' + step + ' 分钟');
      } else if (minute.includes(',')) {
        parts.push(isEn ? 'At minute(s): ' + minDesc : '在分钟: ' + minDesc);
      } else {
        parts.push(isEn ? 'At minute ' + minDesc : '在第 ' + minDesc + ' 分钟');
      }
    } else {
      parts.push(isEn ? 'At ' + minDesc + ' past ' + hourDesc : '在 ' + hourDesc + ':' + minDesc);
    }

    // Day of month
    if (dom !== '*') {
      parts.push(isEn ? 'on day(s): ' + domDesc : '在日期: ' + domDesc);
    } else if (dow === '*') {
      parts.push(isEn ? 'every day' : '每天');
    }

    // Month
    if (month !== '*') {
      parts.push(isEn ? 'in ' + monthDesc : '在 ' + monthDesc);
    }

    // Day of week (complement to dom)
    if (dow !== '*') {
      if (dom !== '*') {
        parts.push(isEn ? 'and also on ' + dowDesc : '也在 ' + dowDesc);
      } else {
        parts.push(isEn ? 'on ' + dowDesc : '每周 ' + dowDesc);
      }
    }

    // Step info
    if (minute.includes('/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      const step = minute.split('/')[1];
      return isEn ? 'Every ' + step + ' minute(s)' : '每 ' + step + ' 分钟运行一次';
    }

    if (hour.includes('/') && minute === '0' && dom === '*' && month === '*' && dow === '*') {
      const step = hour.split('/')[1];
      return isEn ? 'Every ' + step + ' hour(s) at minute 0' : '每 ' + step + ' 小时（整点）运行一次';
    }

    return parts.join(' ');
  }

  function translateCron(expr) {
    const isEn = !isChinese();
    expr = expr.trim();

    // Check special strings
    if (SPECIAL[expr]) {
      return SPECIAL[expr][isEn ? 'en' : 'zh'];
    }
    if (expr.startsWith('@')) {
      return isEn ? 'Unknown special string: ' + expr : '未知 Cron 特殊字符串: ' + expr;
    }

    const fields = expr.split(/\s+/);
    let result;

    if (fields.length === 5) {
      result = translateFiveFields(fields);
    } else if (fields.length === 6) {
      // 6 fields: second minute hour dom month dow
      const secDesc = describeField(fields[0], 0, 59, null, 'sec');
      const fiveRes = translateFiveFields(fields.slice(1));
      result = isEn ? 'At second ' + secDesc + ', ' + fiveRes : '在 ' + secDesc + ' 秒，' + fiveRes;
    } else if (fields.length === 7) {
      // 7 fields: second minute hour dom month dow year
      const secDesc = describeField(fields[0], 0, 59, null, 'sec');
      const yearDesc = describeField(fields[6], 1970, 2099, null, 'year');
      const fiveRes = translateFiveFields(fields.slice(1, 6));
      result = isEn ? 'At second ' + secDesc + ', ' + fiveRes + ', year(s): ' + yearDesc : '在 ' + secDesc + ' 秒，' + fiveRes + '，年份: ' + yearDesc;
    } else {
      result = isEn ? 'Invalid Cron expression: ' + fields.length + ' fields (expected 5, 6, or 7)' : '无效的 Cron 表达式: ' + fields.length + ' 个字段（需要 5、6 或 7 个字段）';
    }

    return result;
  }

  function fieldBreakdown(expr) {
    const isEn = !isChinese();
    expr = expr.trim();

    if (expr.startsWith('@')) {
      return isEn ? 'Special shortcut string' : '特殊快捷字符串';
    }

    const fields = expr.split(/\s+/);
    const labels = isEn
      ? ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week']
      : ['分钟', '小时', '日期', '月份', '星期'];

    if (fields.length === 6) {
      labels.unshift(isEn ? 'Second' : '秒');
    } else if (fields.length === 7) {
      labels.unshift(isEn ? 'Second' : '秒');
      labels.push(isEn ? 'Year' : '年');
    }

    if (fields.length >= 5 && fields.length <= 7) {
      let result = '';
      const startIdx = fields.length === 5 ? 0 : 0;
      for (let i = 0; i < fields.length; i++) {
        result += labels[i] + ': ' + fields[i] + '\n';
      }
      return result;
    }

    return '';
  }

  function handleTranslate() {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please enter a Cron expression', 'warn');
      return;
    }

    const result = translateCron(text);
    resultEl.textContent = result;

    const breakdown = fieldBreakdown(text);
    if (breakdown) {
      detailEl.style.display = 'block';
      fieldsEl.textContent = breakdown;
    } else {
      detailEl.style.display = 'none';
    }

    setStatus('Translation complete', 'success');
  }

  function handleCopy() {
    const text = resultEl.textContent;
    if (!text) {
      setStatus('Nothing to copy', 'warn');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setStatus('Copied to clipboard', 'success');
    }).catch(() => {
      setStatus('Failed to copy', 'error');
    });
  }

  function handleClear() {
    input.value = '';
    resultEl.textContent = '';
    detailEl.style.display = 'none';
    fieldsEl.textContent = '';
    setStatus('', '');
  }

  // Examples click handler
  document.querySelectorAll('[data-example]').forEach(el => {
    el.addEventListener('click', function() {
      input.value = this.getAttribute('data-example');
      handleTranslate();
    });
  });

  // Event listeners
  translateBtn.addEventListener('click', handleTranslate);
  copyBtn.addEventListener('click', handleCopy);
  clearBtn.addEventListener('click', handleClear);

  // Enter key
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      handleTranslate();
    }
  });

  // Auto-translate initial value
  setTimeout(handleTranslate, 100);
})();
