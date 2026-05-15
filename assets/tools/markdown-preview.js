// Markdown Live Preview
(() => {
  const mdInput = document.getElementById('mdInput');
  const preview = document.getElementById('mdPreview');

  function mdToHtml(text) {
    // 简单 Markdown 转 HTML (基础实现
    let html = text;
    
    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => 
      `<pre><code class="lang-${lang || ''}">${code.trim()}</code></pre>`);
    
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 标题
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    
    // 粗体和斜体
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 链接和图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 列表
    html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
    html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
    
    // 分隔线
    html = html.replace(/^---$/gm, '<hr>');
    
    // 引用
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    
    // 段落 (非特殊标记的行)
    const lines = html.split('\n');
    let inParagraph = false;
    let result = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        if (inParagraph) { result.push('</p>'); inParagraph = false; }
        continue;
      }
      if (/^<(h|p|pre|blockquote|li|ul|ol|hr)/.test(line)) {
        if (inParagraph) { result.push('</p>'); inParagraph = false; }
        result.push(line);
      } else {
        if (!inParagraph) { result.push('<p>'); inParagraph = true; }
        result.push(line + ' ');
      }
    }
    if (inParagraph) result.push('</p>');
    
    return result.join('\n');
  }

  function update() {
    preview.innerHTML = mdToHtml(mdInput.value);
  }

  mdInput.addEventListener('input', update);
  //  // 初始化
  setTimeout(update);
})();
