// ULID Generator - browser-local, no dependencies
(() => {
  const input = document.getElementById('ug-count');
  const tsInput = document.getElementById('ug-timestamp');
  const output = document.getElementById('ug-output');
  const generateBtn = document.getElementById('ug-generate');
  const copyBtn = document.getElementById('ug-copy-all');
  const downloadTxt = document.getElementById('ug-download-txt');
  const downloadJson = document.getElementById('ug-download-json');
  const clearBtn = document.getElementById('ug-clear');
  const sortCheck = document.getElementById('ug-sort');
  const info = document.getElementById('ug-info');
  const msg = document.getElementById('ug-msg');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !generateBtn || !output) return;

  // Crockford's Base32 encoding
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const ENCODING_LEN = 32;

  function encodeBase32(num, len) {
    let result = '';
    for (let i = len - 1; i >= 0; i--) {
      result = ENCODING[num & 0x1f] + result;
      num = num >>> 5;
    }
    return result;
  }

  function randomChar() {
    return ENCODING[Math.floor(Math.random() * ENCODING_LEN)];
  }

  function generateULID(timestamp) {
    // 10 chars for timestamp (48 bits, millisecond precision)
    // 16 chars for random (80 bits)
    let time = timestamp || Date.now();
    let timeStr = encodeBase32(time, 10);
    let randomStr = '';
    for (let i = 0; i < 16; i++) {
      randomStr += randomChar();
    }
    return timeStr + randomStr;
  }

  function generate() {
    let count = parseInt(input.value) || 1;
    if (count < 1) count = 1;
    if (count > 100) count = 100;

    let customTs = null;
    if (tsInput && tsInput.value) {
      customTs = new Date(tsInput.value).getTime();
      if (isNaN(customTs)) customTs = null;
    }

    const ulids = [];
    for (let i = 0; i < count; i++) {
      ulids.push(generateULID(customTs));
    }

    // Sort if checkbox is checked
    if (sortCheck && sortCheck.checked) {
      ulids.sort();
    }

    output.value = ulids.join('\n');

    // Show info about the ULID
    if (ulids.length > 0) {
      const sample = ulids[0];
      const tsStr = sample.substring(0, 10);
      const randStr = sample.substring(10);
      const tsHex = parseInt(tsStr, 32).toString(16);
      let infoText = '';
      if (isEN) {
        infoText = `<strong>ULID Structure:</strong> ${sample}<br>`;
        infoText += `<strong>Timestamp</strong> (first 10 chars): ${tsStr} (48-bit, hex: 0x${tsHex})<br>`;
        infoText += `<strong>Random</strong> (last 16 chars): ${randStr} (80-bit)<br>`;
        infoText += `<strong>Generated:</strong> ${count} ULID${count > 1 ? 's' : ''} | `;
        infoText += `<strong>Sort by time:</strong> ${sortCheck && sortCheck.checked ? 'Yes' : 'No'}`;
      } else {
        infoText = `<strong>ULID 结构:</strong> ${sample}<br>`;
        infoText += `<strong>时间戳</strong>（前 10 字符）: ${tsStr}（48 位，十六进制: 0x${tsHex}）<br>`;
        infoText += `<strong>随机数</strong>（后 16 字符）: ${randStr}（80 位）<br>`;
        infoText += `<strong>生成数量:</strong> ${count} 个 | `;
        infoText += `<strong>按时间排序:</strong> ${sortCheck && sortCheck.checked ? '是' : '否'}`;
      }
      info.innerHTML = infoText;
    }

    show(isEN ? `${count} ULID${count > 1 ? 's' : ''} generated.` : `已生成 ${count} 个 ULID。`, 'success');
  }

  function show(text, type) {
    if (!msg) return;
    const colors = { info: 'var(--text-dim)', success: 'var(--success)', error: 'var(--error)' };
    msg.style.color = colors[type] || colors.info;
    msg.textContent = text;
  }

  function copyAll() {
    if (!output.value) {
      show(isEN ? 'No ULIDs to copy.' : '没有可复制的 ULID。', 'error');
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      show(isEN ? 'Copied!' : '已复制!', 'success');
    }).catch(() => {
      show(isEN ? 'Copy failed.' : '复制失败。', 'error');
    });
  }

  function downloadTxtFile() {
    if (!output.value) {
      show(isEN ? 'No ULIDs to download.' : '没有可下载的 ULID。', 'error');
      return;
    }
    const blob = new Blob([output.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    show(isEN ? 'Downloaded as TXT.' : '已下载 TXT 文件。', 'success');
  }

  function downloadJsonFile() {
    if (!output.value) {
      show(isEN ? 'No ULIDs to download.' : '没有可下载的 ULID。', 'error');
      return;
    }
    const items = output.value.split('\n').filter(Boolean);
    const json = JSON.stringify({ ulids: items, generatedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulids-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show(isEN ? 'Downloaded as JSON.' : '已下载 JSON 文件。', 'success');
  }

  function clear() {
    if (output) output.value = '';
    if (info) info.innerHTML = '';
    show(isEN ? 'Cleared.' : '已清空。', 'info');
  }

  // Bind events
  generateBtn.addEventListener('click', generate);
  if (copyBtn) copyBtn.addEventListener('click', copyAll);
  if (downloadTxt) downloadTxt.addEventListener('click', downloadTxtFile);
  if (downloadJson) downloadJson.addEventListener('click', downloadJsonFile);
  if (clearBtn) clearBtn.addEventListener('click', clear);

  // Generate on load
  generate();
})();