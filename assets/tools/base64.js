// Base64 Encoder/Decoder (UTF-8 safe)
(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const isEN = document.documentElement.lang === 'en';

  function utf8ToB64(s) {
    return btoa(unescape(encodeURIComponent(s)));
  }
  function b64ToUtf8(s) {
    return decodeURIComponent(escape(atob(s)));
  }

  document.getElementById('encodeBtn').addEventListener('click', () => {
    try { output.value = utf8ToB64(input.value); }
    catch (e) { output.value = (isEN ? 'Encoding error: ' : '编码错误: ') + e.message; }
  });
  document.getElementById('decodeBtn').addEventListener('click', () => {
    try { output.value = b64ToUtf8(input.value.trim()); }
    catch (e) { output.value = (isEN ? 'Invalid Base64' : '无效的 Base64'); }
  });
  document.getElementById('clearBtn').addEventListener('click', () => {
    input.value = ''; output.value = '';
  });
  document.getElementById('copyBtn').addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });
})();
