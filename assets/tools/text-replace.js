// Text Find & Replace - browser-local batch replacement
(() => {
  'use strict';

  const input = document.getElementById('replaceInput');
  const output = document.getElementById('replaceOutput');
  const findField = document.getElementById('replaceFind');
  const withField = document.getElementById('replaceWith');
  const useRegex = document.getElementById('replaceRegex');
  const caseSensitive = document.getElementById('replaceCase');
  const globalReplace = document.getElementById('replaceGlobal');
  const replaceBtn = document.getElementById('replaceBtn');
  const copyBtn = document.getElementById('replaceCopy');
  const clearBtn = document.getElementById('replaceClear');
  const stats = document.getElementById('replaceStats');
  const isEN = document.documentElement.lang === 'en';

  if (!replaceBtn) return;

  const t = {
    empty: isEN ? 'Paste some text first.' : '请先粘贴文本。',
    noFind: isEN ? 'Enter text or regex to find.' : '请输入要查找的文本或正则。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    regexError: (msg) => isEN ? `Regex error: ${msg}` : `正则错误: ${msg}`,
    done: (count) => isEN ? `Replaced ${count} occurrence${count !== 1 ? 's' : ''}.` : `已替换 ${count} 处。`,
  };

  function toastMsg(msg) {
    if (typeof toast === 'function') toast(msg);
  }

  function process() {
    const text = input.value;
    if (!text.trim()) {
      output.value = '';
      stats.textContent = t.empty;
      return;
    }

    const find = findField.value;
    if (!find.trim()) {
      stats.textContent = t.noFind;
      return;
    }

    const replacement = withField.value;
    let count = 0;

    try {
      if (useRegex.checked) {
        const flags = globalReplace.checked ? 'g' : '';
        const caseFlag = caseSensitive.checked ? '' : 'i';
        const regex = new RegExp(find, flags + caseFlag);
        // Count matches before replacement so $1/$2 capture references keep native behavior.
        const matchArr = text.match(new RegExp(find, 'g' + caseFlag));
        count = matchArr ? matchArr.length : 0;
        if (!globalReplace.checked && count > 0) count = 1;
        output.value = text.replace(regex, replacement);
      } else {
        let result = text;
        if (globalReplace.checked) {
          if (caseSensitive.checked) {
            const parts = text.split(find);
            count = parts.length - 1;
            result = parts.join(replacement);
          } else {
            const lower = text.toLocaleLowerCase();
            const lowerFind = find.toLocaleLowerCase();
            const parts = [];
            let lastIndex = 0;
            let idx = lower.indexOf(lowerFind);
            while (idx !== -1) {
              parts.push(text.slice(lastIndex, idx));
              parts.push(replacement);
              count++;
              lastIndex = idx + find.length;
              idx = lower.indexOf(lowerFind, lastIndex);
            }
            parts.push(text.slice(lastIndex));
            result = parts.join('');
          }
        } else {
          if (caseSensitive.checked) {
            const idx = text.indexOf(find);
            if (idx !== -1) {
              count = 1;
              result = text.slice(0, idx) + replacement + text.slice(idx + find.length);
            } else {
              result = text;
              count = 0;
            }
          } else {
            const lower = text.toLocaleLowerCase();
            const lowerFind = find.toLocaleLowerCase();
            const idx = lower.indexOf(lowerFind);
            if (idx !== -1) {
              count = 1;
              result = text.slice(0, idx) + replacement + text.slice(idx + find.length);
            } else {
              result = text;
              count = 0;
            }
          }
        }
        output.value = result;
      }
    } catch (e) {
      stats.textContent = t.regexError(e.message);
      return;
    }

    stats.textContent = t.done(count);
  }

  replaceBtn.addEventListener('click', process);
  [input, findField, withField, useRegex, caseSensitive, globalReplace].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        if (findField.value.trim()) process();
      });
      el.addEventListener('change', () => {
        if (findField.value.trim()) process();
      });
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      toastMsg(t.copied);
    } catch (err) {
      output.select();
      document.execCommand('copy');
      toastMsg(t.copied);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    findField.value = '';
    withField.value = '';
    stats.textContent = t.cleared;
  });
})();