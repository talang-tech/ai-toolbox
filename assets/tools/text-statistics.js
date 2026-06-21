// Text Statistics Analyzer
(function () {
  'use strict';

  const input = document.getElementById('input');
  const statGrid = document.getElementById('statGrid');
  const analysisResult = document.getElementById('analysisResult');
  const isEN = document.documentElement.lang === 'en';

  const T = {
    chars: isEN ? 'Characters' : '字符数',
    charsNoSpace: isEN ? 'Characters (no space)' : '字符数(不含空格)',
    cjkChars: isEN ? 'CJK Characters' : '汉字/全角字符',
    alphaChars: isEN ? 'Alphabetic Chars' : '英文字母',
    words: isEN ? 'Words' : '单词数',
    sentences: isEN ? 'Sentences' : '句子数',
    paragraphs: isEN ? 'Paragraphs' : '段落数',
    readingTime: isEN ? 'Reading Time' : '阅读时间',
    sec: isEN ? 'sec' : '秒',
    min: isEN ? 'min' : '分钟',
    showFreq: isEN ? 'Show Word Frequency' : '查看高频词',
    hideFreq: isEN ? 'Hide Word Frequency' : '隐藏高频词',
    wordLengthDist: isEN ? 'Word Length Distribution' : '词语长度分布',
    readability: isEN ? 'Readability' : '可读性评分',
    flesch: isEN ? 'Flesch Reading Ease' : 'Flesch 阅读容易度',
    cjkRead: isEN ? 'CJK Simplicity Ratio' : '中文简单率',
    topFreq: isEN ? 'Top Frequent Words' : '高频词汇 Top',
    word: isEN ? 'Word' : '词',
    count: isEN ? 'Count' : '次数',
    empty: isEN ? 'Paste text to see statistics...' : '粘贴文本以查看统计...',
    avgWordLen: isEN ? 'Avg Word Length' : '平均词长',
    longestWord: isEN ? 'Longest Word' : '最长词',
    uniqueWords: isEN ? 'Unique Words' : '不重复词数',
    minWordLen: isEN ? 'Min word length' : '最小词长',
    lang: isEN ? 'Language detected' : '检测语言',
    mixed: isEN ? 'Mixed' : '混合',
    chinese: isEN ? 'Chinese' : '中文',
    english: isEN ? 'English' : '英文',
  };

  let freqVisible = false;

  function analyze(text) {
    if (!text.trim()) {
      statGrid.innerHTML = `<span style="color:var(--text-dim)">${T.empty}</span>`;
      if (freqVisible) analysisResult.innerHTML = '';
      return;
    }

    // Characters
    const charsTotal = text.length;
    const charsNoSpace = text.replace(/[\s]/g, '').length;
    const cjkMatch = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/g);
    const cjkCount = cjkMatch ? cjkMatch.length : 0;
    const alphaMatch = text.match(/[a-zA-Z]/g);
    const alphaCount = alphaMatch ? alphaMatch.length : 0;

    // Words: split on whitespace/punctuation
    const wordsArr = text.split(/[\s，。、；：？！""''（）【】《》\.\,\;\:\?\!\(\)\[\]\{\}\n\r\t]+/).filter(w => w.length > 0);
    const wordCount = wordsArr.length;

    // Count CJK "words" as individual characters too
    const cjkWords = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || [];
    
    // Determine language
    let detectedLang = T.mixed;
    if (cjkCount > 0 && alphaCount === 0) detectedLang = T.chinese;
    else if (alphaCount > 0 && cjkCount === 0) detectedLang = T.english;

    // Sentences
    const sentenceCount = (text.match(/[。！？\.!\?…]+/g) || []).length || (text.trim() ? 1 : 0);
    
    // Paragraphs
    const paraCount = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);

    // Reading time (250 words/min English, 350 chars/min Chinese)
    let readingTimeMin = 0;
    if (detectedLang === T.chinese || detectedLang === T.mixed) {
      readingTimeMin = cjkCount / 350;
    } else {
      readingTimeMin = wordCount / 250;
    }
    const readingTimeDisplay = readingTimeMin < 1
      ? `< 1 ${T.min}`
      : `${Math.ceil(readingTimeMin)} ${T.min}`;

    // Unique words
    const uniqueWords = new Set(wordsArr.map(w => w.toLowerCase()));
    
    // Avg word length
    const totalWordChars = wordsArr.reduce((sum, w) => sum + w.length, 0);
    const avgWordLen = wordCount > 0 ? (totalWordChars / wordCount).toFixed(1) : '0';

    // Longest word
    const longestWord = wordsArr.reduce((a, b) => a.length >= b.length ? a : b, '');

    // Flesch Reading Ease (English only)
    let fleschScore = 'N/A';
    if (detectedLang === T.english && wordCount > 0) {
      const syllables = wordsArr.reduce((sum, w) => {
        let s = 0;
        w = w.toLowerCase().replace(/[^a-z]/g, '');
        if (w.length <= 3) return 1;
        // Count vowel groups
        const vowels = w.match(/[aeiouy]+/g);
        s = vowels ? vowels.length : 0;
        return Math.max(1, s);
      }, 0);
      const avgSyllables = syllables / wordCount;
      const avgSentenceLen = wordCount / Math.max(1, sentenceCount);
      fleschScore = (206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllables).toFixed(1);
    }

    // CJK simplicity ratio (% of short sentences)
    let cjkReadability = 'N/A';
    if (detectedLang === T.chinese || detectedLang === T.mixed) {
      const sentences = text.split(/[。！？\.!\?]+/).filter(s => s.trim());
      const shortSentences = sentences.filter(s => s.length <= 30);
      cjkReadability = sentences.length > 0 ? Math.round(shortSentences.length / sentences.length * 100) + '%' : 'N/A';
    }

    statGrid.innerHTML = `
      <div class="stat-item"><strong>${statsLabel(cjkCount + alphaCount, T.chars)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(charsNoSpace, T.charsNoSpace)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(cjkCount, T.cjkChars)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(alphaCount, T.alphaChars)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(wordCount, T.words)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(sentenceCount, T.sentences)}</strong></div>
      <div class="stat-item"><strong>${statsLabel(paraCount, T.paragraphs)}</strong></div>
      <div class="stat-item"><strong>${readingTimeDisplay}</strong> ${T.readingTime}</div>
      <div class="stat-item"><strong>${uniqueWords.size}</strong> ${T.uniqueWords}</div>
      <div class="stat-item"><strong>${avgWordLen}</strong> ${T.avgWordLen}</div>
      <div class="stat-item"><strong>${longestWord}</strong> ${T.longestWord}</div>
      <div class="stat-item"><strong>${detectedLang}</strong> ${T.lang}</div>
    `;

    // Store data for frequency display
    window.__textStats = { wordsArr, wordCount };
  }

  function statsLabel(val, label) {
    return `${val} ${label}`;
  }

  function showFreq() {
    if (!window.__textStats) return;
    const { wordsArr } = window.__textStats;
    if (wordsArr.length === 0) {
      analysisResult.innerHTML = '<p style="color:var(--text-dim)">No words to analyze.</p>';
      return;
    }

    const minLenEl = document.getElementById('minWordLenInput');
    const minLen = minLenEl ? parseInt(minLenEl.value) || 3 : 3;

    // Frequency
    const freq = {};
    for (const w of wordsArr) {
      const clean = w.replace(/[^a-zA-Z\u4e00-\u9fff0-9]/g, '');
      if (clean.length < minLen) continue;
      const key = clean.toLowerCase();
      freq[key] = (freq[key] || 0) + 1;
    }

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30);

    if (sorted.length === 0) {
      analysisResult.innerHTML = `<p style="color:var(--text-dim)">${isEN ? 'No words match min length filter.' : '没有匹配的词（调整最小词长）。'}</p>`;
      return;
    }

    // Word length distribution
    const lenDist = {};
    for (const w of wordsArr) {
      const l = w.length;
      lenDist[l] = (lenDist[l] || 0) + 1;
    }

    const maxFreq = sorted[0][1];
    const maxDist = Math.max(...Object.values(lenDist));

    let html = `
    <div style="margin-top:16px">
      <div style="font-weight:600;margin-bottom:4px">${isEN ? 'Word length filter:' : '最小词长过滤:'}</div>
      <input type="number" id="minWordLenInput" value="3" min="1" max="20" style="width:80px">
      <button class="btn" id="refreshFreqBtn" style="margin-left:8px">↻ ${isEN ? 'Refresh' : '刷新'}</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px">
    `;

    // Left: Frequency table
    html += '<div><h4 style="margin-bottom:12px">' + T.topFreq + '</h4>';
    html += '<div style="font-size:13px;max-height:400px;overflow-y:auto">';
    for (const [word, count] of sorted) {
      const barW = Math.round((count / maxFreq) * 100);
      html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">${word}</span>
        <span style="width:28px;color:var(--text-dim)">${count}</span>
        <div style="flex:1;height:14px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${barW}%;background:var(--primary);border-radius:3px"></div>
        </div>
      </div>`;
    }
    html += '</div></div>';

    // Right: Length distribution
    html += '<div><h4 style="margin-bottom:12px">' + T.wordLengthDist + '</h4>';
    html += '<div style="font-size:13px;max-height:400px;overflow-y:auto">';
    const sortedLens = Object.entries(lenDist).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    for (const [len, count] of sortedLens) {
      const barW = Math.round((count / maxDist) * 100);
      html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span style="width:50px;text-align:right;color:var(--text-dim)">${len} ch</span>
        <div style="flex:1;height:12px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${barW}%;background:var(--accent);border-radius:3px"></div>
        </div>
        <span style="width:28px;color:var(--text-dim)">${count}</span>
      </div>`;
    }
    html += '</div></div>';
    html += '</div>';

    // Readability section
    html += '<div style="margin-top:20px;font-size:13px">';
    html += `<h4>${T.readability}</h4>`;
    html += `<p>${T.flesch}: <strong>${window.__fleschScore || 'N/A'}</strong></p>`;
    html += `<p>${T.cjkRead}: <strong>${window.__cjkRead || 'N/A'}</strong></p>`;
    html += '</div>';

    analysisResult.innerHTML = html;

    // Wire refresh button
    document.getElementById('refreshFreqBtn')?.addEventListener('click', showFreq);
  }

  function update() {
    const text = input.value;
    analyze(text);

    // Compute readability scores for later display
    const wordsArr = text.split(/[\s，。、；：？！""''（）【】《》\.\,\;\:\?\!\(\)\[\]\{\}\n\r\t]+/).filter(w => w.length > 0);
    const sentenceCount = (text.match(/[。！？\.!\?…]+/g) || []).length || (text.trim() ? 1 : 0);

    if (wordsArr.length > 0 && sentenceCount > 0) {
      const syllables = wordsArr.reduce((sum, w) => {
        w = w.toLowerCase().replace(/[^a-z]/g, '');
        if (w.length <= 3) return sum + 1;
        const vowels = w.match(/[aeiouy]+/g);
        return sum + Math.max(1, vowels ? vowels.length : 0);
      }, 0);
      const avgSyllables = syllables / wordsArr.length;
      const avgSentenceLen = wordsArr.length / sentenceCount;
      window.__fleschScore = (206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllables).toFixed(1);

      const cjkSentences = text.split(/[。！？]+/).filter(s => s.trim());
      const shortCJK = cjkSentences.filter(s => s.length <= 30);
      window.__cjkRead = cjkSentences.length > 0 ? Math.round(shortCJK.length / cjkSentences.length * 100) + '%' : 'N/A';
    }

    if (freqVisible) showFreq();
  }

  // Frequency toggle
  document.getElementById('freqBtn')?.addEventListener('click', () => {
    freqVisible = !freqVisible;
    document.getElementById('freqBtn').textContent = freqVisible ? T.hideFreq : T.showFreq;
    if (freqVisible) {
      update();
    } else {
      analysisResult.innerHTML = '';
    }
  });

  // Clear button
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    input.value = '';
    statGrid.innerHTML = `<span style="color:var(--text-dim)">${T.empty}</span>`;
    analysisResult.innerHTML = '';
    freqVisible = false;
    document.getElementById('freqBtn').textContent = T.showFreq;
    window.__textStats = null;
  });

  // Auto-update on input
  input?.addEventListener('input', update);

  // Initial state
  statGrid.innerHTML = `<span style="color:var(--text-dim)">${T.empty}</span>`;
})();