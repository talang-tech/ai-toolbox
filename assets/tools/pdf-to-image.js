/**
 * PDF 转图片工具
 * 使用 pdfjs-dist 实现真正的 PDF 页面渲染
 */

document.addEventListener('DOMContentLoaded', async () => {

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

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  class PDFToImageTool extends ToolBase {
    constructor() {
      super({
        name: 'PDF 转图片工具',
        accept: '.pdf',
        multiple: false
      });
      this.results = [];
    }

    async process() {
      this.state.isProcessing = true;
      this.updateUI();
      this.results = [];

      try {
        const file = this.state.files[0];
        const format = document.getElementById('format')?.value || 'image/png';
        const scale = parseFloat(document.getElementById('scale')?.value || 2);

        this.updateProgress(10, 100, '正在读取 PDF...');
        const arrayBuffer = await file.arrayBuffer();
        this.updateProgress(30, 100, '正在解析 PDF...');

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
          this.updateProgress(30 + Math.round((i / totalPages) * 60), 100, '正在渲染第 ' + i + ' / ' + totalPages + ' 页...');

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: scale });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.9));
          const ext = format === 'image/jpeg' ? 'jpg' : 'png';
          this.results.push({
            name: 'page_' + i + '.' + ext,
            blob: blob,
            url: URL.createObjectURL(blob)
          });
        }

        this.updateProgress(100, 100, '转换完成！');
        this.showResultHtml(totalPages);

      } catch (err) {
        console.error('Convert failed:', err);
        this.showMessage('转换失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    showResultHtml(totalPages) {
      const html = [
        '<div style="text-align:center;padding:20px;">',
        '  <div style="font-size:48px;margin-bottom:12px;">✅</div>',
        '  <h4 style="margin:0 0 16px 0;">转换完成！</h4>',
        '  <p style="color:var(--text-muted);margin-bottom:20px;">共 ' + totalPages + ' 页已转换为图片</p>',
        '  <button class="btn btn-primary" onclick="window.toolInstance.downloadAll()" style="padding:12px 32px;">📥 全部下载</button>',
        '</div>',
        '<div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">',
        this.results.map((r, i) => [
          '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">',
          '  <img src="' + r.url + '" style="width:100%;aspect-ratio:4/5;object-fit:cover;border-bottom:1px solid var(--border);">',
          '  <div style="padding:12px;">',
          '    <div style="font-size:14px;font-weight:500;margin-bottom:8px;">第 ' + (i + 1) + ' 页</div>',
          '    <button class="btn btn-secondary" onclick="window.toolInstance.downloadSingle(' + i + ')" style="width:100%;padding:8px;">下载</button>',
          '  </div>',
          '</div>'
        ].join('\n')).join('\n'),
        '</div>'
      ].join('\n');
      this.showResult(html);
    }

    downloadSingle(index) {
      const result = this.results[index];
      if (result) {
        this.downloadBlob(result.blob, result.name);
      }
    }

    downloadAll() {
      this.results.forEach((r, i) => {
        setTimeout(() => this.downloadBlob(r.blob, r.name), i * 300);
      });
    }
  }

  window.toolInstance = new PDFToImageTool();
});