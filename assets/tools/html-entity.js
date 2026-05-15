// HTML Entity Encoder / Decoder
(() => {
  const input = document.getElementById('heInput');
  const output = document.getElementById('heOutput');
  const encodeBtn = document.getElementById('heEncode');
  const decodeBtn = document.getElementById('heDecode');
  const copyBtn = document.getElementById('heCopy');
  const isEN = document.documentElement.lang === 'en';

  const entities = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    '©': '&copy;', '®': '&reg;', '€': '&euro;', '£': '&pound;', '¥': '&yen;',
    '°': '&deg;', '±': '&plusmn;', '×': '&times;', '÷': '&divide;',
    '…': '&hellip;', '“': '&ldquo;', '”': '&rdquo;', '‘': '&lsquo;', '’': '&rsquo;',
    '–': '&ndash;', '—': '&mdash;', ' ': '&nbsp;'
  };
  const reverse = Object.fromEntries(Object.entries(entities).map(([k,v]) => [v,k]));

  function encode() {
    let text = input.value;
    for (const [char, entity] of Object.entries(entities)) {
      text = text.split(char).join(entity);
    }
    output.value = text;
    showToast(isEN ? 'Encoded!' : '已编码!');
  }

  function decode() {
    let text = input.value;
    // 先解码命名实体
    for (const [entity, char] of Object.entries(reverse)) {
      text = text.split(entity).join(char);
    }
    // 解码数字实体 &#xXX; &#DDD;
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
    output.value = text;
    showToast(isEN ? 'Decoded!' : '已解码!');
  }

  encodeBtn.addEventListener('click', encode);
  decodeBtn.addEventListener('click', decode);
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    showToast(isEN ? 'Copied!' : '已复制!');
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
