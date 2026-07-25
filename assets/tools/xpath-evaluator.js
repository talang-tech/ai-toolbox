/**
 * XPath Evaluator - Test and debug XPath expressions on XML/HTML
 * AI Toolbox - 100% client-side processing
 */

(function() {
  'use strict';

  const input = document.getElementById('xe-input');
  const xpathInput = document.getElementById('xe-xpath');
  const resultBox = document.getElementById('xe-result');
  const matchCount = document.getElementById('xe-count');
  const evalBtn = document.getElementById('xe-eval');
  const copyBtn = document.getElementById('xe-copy');
  const clearBtn = document.getElementById('xe-clear');
  const statusEl = document.getElementById('xe-status');

  function evaluateXPath() {
    const docText = input.value;
    const xpathExpr = xpathInput.value.trim();
    if (!docText) {
      setStatus('请输入 XML/HTML 文档内容', 'warn');
      resultBox.value = '';
      matchCount.textContent = '0';
      return;
    }
    if (!xpathExpr) {
      setStatus('请输入 XPath 表达式', 'warn');
      resultBox.value = '';
      matchCount.textContent = '0';
      return;
    }

    try {
      const parser = new DOMParser();
      const isHTML = docText.trim().toLowerCase().startsWith('<!doctype') || 
                     docText.trim().toLowerCase().startsWith('<html');
      const doc = isHTML ? parser.parseFromString(docText, 'text/html') 
                         : parser.parseFromString(docText, 'application/xml');

      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        setStatus('❌ XML/HTML 解析错误: ' + parseError.textContent, 'error');
        resultBox.value = '';
        matchCount.textContent = '0';
        return;
      }

      const evaluator = new XPathEvaluator();
      const result = evaluator.evaluate(xpathExpr, doc, null, 
        XPathResult.ANY_TYPE, null);

      const lines = [];
      let count = 0;
      let node = result.iterateNext();
      while (node) {
        count++;
        let tag = node.nodeType === 1 ? node.nodeName : 
                  node.nodeType === 3 ? '#text' :
                  node.nodeType === 2 ? '@' + node.nodeName : node.nodeName;
        let text = '';
        if (node.nodeType === 3) {
          text = node.textContent.trim().substring(0, 200);
        } else if (node.nodeType === 1) {
          text = node.textContent.trim().substring(0, 150);
        } else if (node.nodeType === 2) {
          text = node.value;
        }
        let path = getXPath(node);
        lines.push(`[${count}] <${tag}>`);
        if (text) lines.push(`     text: "${text}"`);
        lines.push(`     path: ${path}`);
        lines.push('');
        node = result.iterateNext();
      }

      if (count === 0) {
        setStatus('⚠️ 未找到匹配节点', 'warn');
        resultBox.value = '未找到匹配的节点。请检查 XPath 表达式或文档结构。';
      } else {
        setStatus(`✅ 匹配 ${count} 个节点`, 'success');
        resultBox.value = lines.join('\n');
      }
      matchCount.textContent = String(count);
    } catch (e) {
      setStatus('❌ XPath 错误: ' + e.message, 'error');
      resultBox.value = 'XPath 求值失败:\n' + e.message;
      matchCount.textContent = '0';
    }
  }

  function getXPath(node) {
    if (node.nodeType === 2) {
      // attribute node
      return '/@' + node.nodeName;
    }
    const parts = [];
    while (node && node.nodeType === 1) {
      let sibling = node.parentNode ? node.parentNode.firstChild : null;
      let idx = 1;
      while (sibling) {
        if (sibling.nodeName === node.nodeName) {
          if (sibling === node) break;
          idx++;
        }
        sibling = sibling.nextSibling;
      }
      const tag = node.nodeName.toLowerCase();
      parts.unshift(idx > 1 ? `${tag}[${idx}]` : tag);
      node = node.parentNode;
    }
    return '/' + parts.join('/');
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'status-' + (type || 'info');
  }

  function copyResult() {
    if (!resultBox.value) return;
    navigator.clipboard.writeText(resultBox.value).then(() => {
      setStatus('📋 已复制到剪贴板', 'success');
    }).catch(() => {
      resultBox.select();
      document.execCommand('copy');
      setStatus('📋 已复制到剪贴板', 'success');
    });
  }

  function clearAll() {
    input.value = '';
    xpathInput.value = '';
    resultBox.value = '';
    matchCount.textContent = '0';
    setStatus('已清空', 'info');
  }

  // Load sample data
  function loadSample() {
    if (input.value) return;
    input.value = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>12.99</price>
  </book>
  <book category="nonfiction">
    <title lang="en">A Brief History of Time</title>
    <author>Stephen Hawking</author>
    <price>18.99</price>
  </book>
  <book category="fiction">
    <title lang="zh">百年孤独</title>
    <author>Gabriel García Márquez</author>
    <price>15.99</price>
  </book>
  <book category="science">
    <title lang="en">The Selfish Gene</title>
    <author>Richard Dawkins</author>
    <price>14.99</price>
  </book>
</bookstore>`;
    xpathInput.value = '//book[@category="fiction"]/title';
    setStatus('已加载示例数据', 'info');
    setTimeout(evaluateXPath, 100);
  }

  // Events
  evalBtn.addEventListener('click', evaluateXPath);
  copyBtn.addEventListener('click', copyResult);
  clearBtn.addEventListener('click', clearAll);
  xpathInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') evaluateXPath();
  });

  // Auto-load sample
  loadSample();
})();