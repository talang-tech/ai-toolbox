// Regex Pattern Library - common patterns library with real-time builder
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const catSel = document.getElementById('rplCategory');
  const patList = document.getElementById('rplPatternList');
  const patBld = document.getElementById('rplBuilder');
  const custPat = document.getElementById('rplCustomPattern');
  const testIn = document.getElementById('rplTestInput');
  const testFl = document.getElementById('rplTestFlags');
  const testRes = document.getElementById('rplTestResult');
  const resultCt = document.getElementById('rplResultCount');
  if (!catSel) return;
  const EN = document.documentElement.lang === 'en';

  const pats = {
    email:{icon:'📧',zh:'邮箱',en:'Email',items:[
      {nz:'标准邮箱',ne:'Standard Email',p:'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',dz:'匹配大多数标准邮箱格式，不包含中文域名',de:'Matches most standard email formats'},
      {nz:'宽松邮箱',ne:'Loose Email',p:'[\\w.-]+@[\\w.-]+\\.\\w+',dz:'宽松匹配，适用于从文本中提取邮箱',de:'Loose matching for email extraction'},
    ]},
    url:{icon:'🔗',zh:'网址',en:'URL',items:[
      {nz:'HTTP/HTTPS URL',ne:'HTTP/HTTPS URL',p:'https?://[\\w.-]+(:\\d+)?(/[\\w./%-]*)?',dz:'匹配 http 和 https 开头的 URL',de:'Matches URLs starting with http and https'},
      {nz:'完整URL(含FTP)',ne:'Full URL (incl. FTP)',p:'(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]',dz:'匹配 http/https/ftp/file 协议',de:'Matches http/https/ftp/file protocols'},
      {nz:'域名',ne:'Domain Name',p:'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$',dz:'匹配标准域名格式',de:'Matches standard domain name format'},
    ]},
    number:{icon:'🔢',zh:'数字',en:'Numbers',items:[
      {nz:'整数',ne:'Integer',p:'^-?\\d+$',dz:'匹配正整数、负整数和零',de:'Matches positive/negative integers and zero'},
      {nz:'浮点数',ne:'Float Number',p:'^-?\\d+(\\.\\d+)?$',dz:'匹配包含小数的数字',de:'Matches decimal numbers'},
      {nz:'科学计数法',ne:'Scientific Notation',p:'^-?\\d+(\\.\\d+)?[eE][+-]?\\d+$',dz:'匹配科学计数法表示的数字',de:'Matches scientific notation'},
    ]},
    id:{icon:'🆔',zh:'身份/证件',en:'Identity',items:[
      {nz:'身份证号(18位)',ne:'Chinese ID (18 digits)',p:'^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',dz:'匹配中国大陆 18 位身份证号',de:'Matches Chinese mainland 18-digit ID'},
      {nz:'手机号(中国大陆)',ne:'Phone (China)',p:'^1[3-9]\\d{9}$',dz:'匹配中国大陆手机号',de:'Matches Chinese mainland mobile number'},
      {nz:'中文字符',ne:'Chinese Characters',p:'[\\u4e00-\\u9fff]',dz:'匹配单个中文字符',de:'Matches a single Chinese character'},
    ]},
    phone:{icon:'📱',zh:'电话',en:'Phone',items:[
      {nz:'中国手机号',ne:'China Mobile',p:'^1[3-9]\\d{9}$',dz:'中国大陆11位手机号',de:'Chinese mainland 11-digit mobile number'},
      {nz:'中国固定电话',ne:'China Landline',p:'^0\\d{2,3}-?\\d{7,8}$',dz:'含区号的固定电话',de:'Landline with area code'},
      {nz:'国际电话格式',ne:'International Phone',p:'^\\+?\\d{1,4}[\\s-]?\\d{1,14}([\\s-]?\\d{1,13})?$',dz:'匹配 E.164 格式的国际电话',de:'Matches E.164 international phone format'},
    ]},
    date:{icon:'📅',zh:'日期/时间',en:'Date/Time',items:[
      {nz:'YYYY-MM-DD',ne:'YYYY-MM-DD',p:'^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',dz:'ISO 8601 日期格式',de:'ISO 8601 date format'},
      {nz:'日期时间(ISO 8601)',ne:'DateTime (ISO 8601)',p:'^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})?$',dz:'ISO 8601 完整日期时间格式',de:'Full ISO 8601 datetime format'},
      {nz:'24小时制时间',ne:'24-hour Time',p:'^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$',dz:'匹配 HH:MM:SS',de:'Matches HH:MM:SS'},
      {nz:'12小时制时间',ne:'12-hour Time',p:'^(1[0-2]|0?[1-9]):[0-5]\\d\\s?[APap][Mm]$',dz:'HH:MM AM/PM',de:'HH:MM AM/PM'},
    ]},
    web:{icon:'🌐',zh:'Web 开发',en:'Web Dev',items:[
      {nz:'HTML 标签',ne:'HTML Tag',p:'<[/!]?[^<>]+>',dz:'匹配 HTML/XML 标签',de:'Matches HTML/XML tags'},
      {nz:'IP 地址(IPv4)',ne:'IPv4 Address',p:'^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',dz:'匹配标准 IPv4 地址',de:'Matches standard IPv4 addresses'},
      {nz:'MAC 地址',ne:'MAC Address',p:'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',dz:'匹配 MAC 地址',de:'Matches MAC addresses'},
      {nz:'颜色十六进制',ne:'Hex Color',p:'^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',dz:'匹配 #RGB 或 #RRGGBB',de:'Matches #RGB or #RRGGBB'},
      {nz:'版本号(SemVer)',ne:'SemVer',p:'^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9.-]+)?(?:\\+[a-zA-Z0-9.-]+)?$',dz:'匹配语义化版本号',de:'Matches semantic version'},
    ]},
    security:{icon:'🔒',zh:'安全/验证',en:'Security',items:[
      {nz:'强密码(8位+大小写+数字+特殊)',ne:'Strong Password',p:'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:;"\'<>,.?/]).{8,}$',dz:'至少8位，含大小写字母、数字和特殊字符',de:'8+ chars with upper, lower, digit, special char'},
      {nz:'中密码(6位+字母+数字)',ne:'Medium Password',p:'^(?=.*[a-zA-Z])(?=.*\\d).{6,}$',dz:'至少6位，含字母和数字',de:'6+ chars with letters and digits'},
      {nz:'Base64',ne:'Base64',p:'^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',dz:'匹配标准 Base64',de:'Matches standard Base64'},
      {nz:'UUID/GUID v4',ne:'UUID/GUID v4',p:'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',dz:'匹配 UUID v4',de:'Matches UUID v4'},
    ]},
    text:{icon:'✏️',zh:'文本处理',en:'Text',items:[
      {nz:'空行/空白行',ne:'Empty Lines',p:'^\\s*$',dz:'匹配空白行',de:'Matches blank lines'},
      {nz:'行首尾空白',ne:'Leading/Trailing WS',p:'^\\s+|\\s+$',dz:'匹配行首或行尾的空白',de:'Matches leading/trailing whitespace'},
      {nz:'连续空格',ne:'Consecutive Spaces',p:' {2,}',dz:'匹配两个或以上连续空格',de:'Matches 2+ consecutive spaces'},
      {nz:'Emoji',ne:'Emoji',p:'[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{1F1E0}-\\u{1F1FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]',dz:'匹配Emoji表情',de:'Matches emoji',fl:'gu'},
    ]},
  };
  const pn = p => EN ? p.ne : p.nz;
  const pd = p => EN ? p.de : p.dz;

  function renderCats() {
    let h = '<option value="">' + (EN ? '-- Select a category --' : '-- 选择分类 --') + '</option>';
    for (const [k,c] of Object.entries(pats)) h += '<option value="' + k + '">' + c.icon + ' ' + (EN ? c.en : c.zh) + '</option>';
    catSel.innerHTML = h;
  }

  function renderPats(key) {
    const c = pats[key];
    if (!c) { patList.innerHTML = '<div style="color:var(--text-dim);padding:20px;text-align:center">' + (EN ? 'Select a category' : '请先选择分类') + '</div>'; return; }
    let h = '';
    c.items.forEach((p,i) => {
      h += '<div class="rpl-item" data-idx="' + i + '" style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
        '<strong>' + pn(p) + '</strong>' +
        '<code style="font-size:12px;color:var(--accent);font-family:monospace">' + p.p.substring(0,45) + (p.p.length>45?'…':'') + '</code></div>' +
        '<div style="font-size:13px;color:var(--text-dim);margin-top:4px">' + pd(p) + '</div></div>';
    });
    patList.innerHTML = h;
    patList.querySelectorAll('.rpl-item').forEach((el,i) => el.addEventListener('click', ()=>selectPat(key,i)));
    if (c.items.length) selectPat(key, 0);
  }

  function selectPat(key, idx) {
    const c = pats[key];
    if (!c || !c.items[idx]) return;
    const p = c.items[idx];
    custPat.value = p.p;
    testFl.value = p.fl || 'g';
    document.querySelectorAll('.rpl-item').forEach((el,i) => {
      el.style.borderColor = i===idx ? 'var(--accent)' : 'var(--border)';
      el.style.background = i===idx ? 'rgba(99,102,241,0.08)' : 'transparent';
    });
    const safeP = p.p.replace(/\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/`/g, '\\`');
    patBld.innerHTML = '<div style="padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">' +
      '<div><strong>' + pn(p) + '</strong><span style="color:var(--text-dim);font-size:13px;margin-left:8px">' + pd(p) + '</span></div>' +
      '<code style="font-size:13px;color:var(--accent);font-family:monospace">' + safeP + '</code></div>' +
      '<button class="btn" onclick="navigator.clipboard.writeText(\'' + safeP + '\')">📋 ' + (EN ? 'Copy Pattern' : '复制正则') + '</button></div>';
    runTest();
  }

  function runTest() {
    const pat = custPat.value.trim();
    const txt = testIn.value;
    const fl = testFl.value.trim() || 'g';
    if (!pat || !txt) {
      testRes.innerHTML = '<div style="color:var(--text-dim);padding:16px;text-align:center">' + (EN ? 'Enter pattern and test text' : '请输入正则和测试文本') + '</div>';
      if (resultCt) resultCt.textContent = '';
      return;
    }
    try {
      const re = new RegExp(pat, fl);
      let m; const ms=[]; let c=0;
      if (fl.includes('g')) { while ((m=re.exec(txt)) !== null && c < 100) { ms.push(m[0]); c++; } }
      else { m = re.exec(txt); if (m) ms.push(m[0]); }
      testRes.innerHTML = ms.length ? '<div style="white-space:pre-wrap;font-family:monospace;font-size:13px;padding:12px">' +
        ms.map(s => '<span style="background:rgba(255,200,0,0.3);border-radius:3px;padding:1px 0">' + s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span> ').join('') + '</div>'
        : '<div style="color:var(--text-dim);padding:16px;text-align:center">' + (EN ? 'No matches found' : '未找到匹配') + '</div>';
      if (resultCt) resultCt.textContent = EN ? ms.length + ' match(es)' : ms.length + ' 个匹配';
    } catch(e) {
      testRes.innerHTML = '<div style="color:var(--error);padding:12px">⚠ ' + e.message + '</div>';
      if (resultCt) resultCt.textContent = '';
    }
  }

  catSel.addEventListener('change', () => renderPats(catSel.value));
  custPat.addEventListener('input', runTest);
  testIn.addEventListener('input', runTest);
  testFl.addEventListener('input', runTest);
  renderCats();
  renderPats('email');
});
