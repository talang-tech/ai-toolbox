// Text Sorter - browser-local line sorting
(() => {
  'use strict';

  const input = document.getElementById('sortInput');
  const output = document.getElementById('sortOutput');
  const mode = document.getElementById('sortMode');
  const ignoreCase = document.getElementById('sortIgnoreCase');
  const removeEmpty = document.getElementById('sortRemoveEmpty');
  const removeDup = document.getElementById('sortRemoveDup');
  const sortBtn = document.getElementById('sortBtn');
  const copyBtn = document.getElementById('sortCopy');
  const clearBtn = document.getElementById('sortClear');
  const stats = document.getElementById('sortStats');
  const isEN = document.documentElement.lang === 'en';

  if (!input || !output || !sortBtn) return;

  const t = {
    empty: isEN ? 'Paste some text first.' : '请先粘贴文本。',
    copied: isEN ? 'Copied!' : '已复制!',
    cleared: isEN ? 'Cleared.' : '已清空。',
    done: (inCount, outCount, removed) => isEN
      ? `Sorted ${outCount} lines. Original: ${inCount}. Removed: ${removed}.`
      : `已排序 ${outCount} 行。原始：${inCount} 行，移除：${removed} 行。`,
  };

  function toastMsg(msg) {
    if (typeof toast === 'function') toast(msg);
  }

  function normalize(line) {
    return ignoreCase.checked ? line.toLocaleLowerCase() : line;
  }

  function numericValue(line) {
    const match = String(line).match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i);
    return match ? Number(match[0]) : Number.NaN;
  }

  function sortLines(lines) {
    const sortMode = mode.value;
    if (sortMode === 'random') {
      const shuffled = [...lines];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    const sorted = [...lines];
    sorted.sort((a, b) => {
      if (sortMode.startsWith('num')) {
        const na = numericValue(a);
        const nb = numericValue(b);
        if (Number.isNaN(na) && Number.isNaN(nb)) return normalize(a).localeCompare(normalize(b), undefined, { numeric: true });
        if (Number.isNaN(na)) return 1;
        if (Number.isNaN(nb)) return -1;
        return na - nb;
      }
      if (sortMode.startsWith('length')) {
        const diff = a.length - b.length;
        return diff || normalize(a).localeCompare(normalize(b), undefined, { numeric: true });
      }
      return normalize(a).localeCompare(normalize(b), undefined, { numeric: true });
    });

    if (sortMode.endsWith('desc')) sorted.reverse();
    return sorted;
  }

  function process() {
    const raw = input.value;
    if (!raw.trim()) {
      output.value = '';
      stats.textContent = t.empty;
      return;
    }

    const originalLines = raw.replace(/\r\n?/g, '\n').split('\n');
    let lines = [...originalLines];

    if (removeEmpty.checked) lines = lines.filter(line => line.trim() !== '');

    if (removeDup.checked) {
      const seen = new Set();
      lines = lines.filter(line => {
        const key = ignoreCase.checked ? line.toLocaleLowerCase() : line;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const sorted = sortLines(lines);
    output.value = sorted.join('\n');
    const removed = originalLines.length - sorted.length;
    stats.textContent = t.done(originalLines.length, sorted.length, removed);
  }

  sortBtn.addEventListener('click', process);
  [input, mode, ignoreCase, removeEmpty, removeDup].forEach(el => {
    el.addEventListener('input', process);
    el.addEventListener('change', process);
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
    stats.textContent = t.cleared;
  });
})();
