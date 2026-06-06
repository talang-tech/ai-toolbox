/**
 * PDF 提取文字工具
 * 使用 pdfjs-dist 实现真正的文本提取
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';


  const waitForToolBase = () => new Promise((resolve) => {
    if (window.ToolBase) return resolve(window.ToolBase);
    const timer = setInterval(() => {
      if (window.ToolBase) {
        clearInterval(timer);
        resolve(window.ToolBase);
      }
    }, 50);
    setTimeout(() => clearInterval(timer), 5000);
  });

  const ToolBase = await waitForToolBase();

  // 等待 pdfjs-dist 加载
  const waitForPDFJS = () => new Promise((resolve) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const timer = setInterval(() => {
      if (window.pdfjsLib) {
        clearInterval(timer);
        resolve(window.pdfjsLib);
      }
    }, 100);
    setTimeout(() => clearInterval(timer), 10000);
  });

  const pdfjsLib = await waitForPDFJS();

  if (!pdfjsLib) {
    console.error('pdfjs-dist 加载失败');
    return;
  }

  // 设置 worker 路径
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  class PDFExtractTool extends ToolBase {
    constructor() {
      super({
        name: 'PDF 提取文字工具',
        accept: '.pdf',
        multiple: false
      });
      this.extractedText = '';
    }

    async process() {
      this.state.isProcessing = true;
      this.updateUI();

      try {
        const file = this.state.files[0];
        this.updateProgress(10, 100, '正在读取文件...');

        const arrayBuffer = await file.arrayBuffer();
        this.updateProgress(30, 100, '正在解析 PDF...');

        const text = await this.extractText(arrayBuffer);
        this.extractedText = text;

        this.updateProgress(100, 100, '提取完成！');

        const html = [
          '<div style="text-align:center;padding:20px;">',
          '  <div style="font-size:48px;margin-bottom:12px;">✅</div>',
          '  <h4 style="margin:0 0 16px 0;">提取完成！</h4>',
          '  <p style="color:var(--text-muted);margin-bottom:20px;">已提取 ' + text.length + ' 个字符</p>',
          '  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">',
          '    <button class="btn btn-primary" onclick="window.toolInstance.copyText()" style="padding:12px 24px;">📋 复制到剪贴板</button>',
          '    <button class="btn btn-secondary" onclick="window.toolInstance.downloadText()" style="padding:12px 24px;">📥 下载为 TXT</button>',
          '  </div>',
          '</div>',
          '<div style="margin-top:20px;">',
          '  <textarea id="extracted-text-output" style="width:100%;height:300px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);resize:vertical;" readonly></textarea>',
          '</div>'
        ].join('\n');
        this.showResult(html);
        const ta = document.getElementById('extracted-text-output');
        if (ta) {
          ta.value = text.substring(0, 5000);
          if (text.length > 5000) ta.value += '\n\n... (内容过长已截断，请下载完整文件)';
        }

      } catch (err) {
        console.error('Extract failed:', err);
        this.showMessage('提取失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    escapeHtml(str) {
      return str;
    }

    async extractText(arrayBuffer) {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let text = '';

      for (let i = 1; i <= totalPages; i++) {
        this.updateProgress(30 + Math.round((i / totalPages) * 60), 100, '正在提取第 ' + i + ' / ' + totalPages + ' 页...');
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += '=== 第 ' + i + ' 页 ===\n' + pageText + '\n\n';
      }

      text += '\n=== 文档信息 ===\n';
      text += '页数: ' + totalPages + '\n';

      return text;
    }

    copyText() {
      navigator.clipboard.writeText(this.extractedText).then(() => {
        this.showMessage('已复制到剪贴板！');
      }).catch(() => {
        this.showMessage('复制失败，请手动复制', 'error');
      });
    }

    downloadText() {
      const blob = new Blob([this.extractedText], { type: 'text/plain;charset=utf-8' });
      this.downloadBlob(blob, 'extracted.txt');
    }
  }

  window.toolInstance = new PDFExtractTool();
});