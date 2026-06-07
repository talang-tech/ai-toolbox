// URL Encoder/Decoder
(function () {
  'use strict';

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const isEN = document.documentElement.lang === 'en';

  function encodeInput() {
    try { output.value = encodeURIComponent(input.value); }
    catch (e) { output.value = (isEN ? 'Error: ' : '错误: ') + e.message; }
  }

  function decodeInput() {
    try { output.value = decodeURIComponent(input.value); }
    catch (e) { output.value = (isEN ? 'Invalid encoded URL' : '无效的编码 URL'); }
  }

  document.getElementById('encodeBtn').addEventListener('click', encodeInput);
  document.getElementById('decodeBtn').addEventListener('click', decodeInput);
  document.getElementById('copyBtn').addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });
})();
