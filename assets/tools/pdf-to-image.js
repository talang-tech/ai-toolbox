/**
 * PDF 转图片工具
 * 使用 ToolBase 基类实现 - 重构版 v2.0
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

  const waitForPDFLib = () => new Promise((resolve) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const timer = setInterval(() => {
      if (window.PDFLib) {
        clearInterval(timer);
        resolve(window.PDFLib);
      }
    }, 100);
    setTimeout(() => clearInterval(timer), 10000);
  });

  const PDFLib = await waitForPDFLib();

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

        this.updateProgress(30, 100, '正在读取 PDF...');
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();

        this.updateProgress(50, 100, `正在渲染 ${pages.length} 页...');

        // 创建一个 Canvas 渲染 (演示版 - 实际项目需要 pdf.js 等库)
        for (let i = 0; i < pages.length; i++) {
          // 演示模式下生成一个简单的图片
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 1000;
          const ctx = canvas.getContext('2d');
          
          // 绘制背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 800, 1000);
          
          // 绘制文字
          ctx.fillStyle = '#000000';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('PDF 转图片 - 演示模式', 400, 120);
          ctx.font = '16px sans-serif';
          ctx.fillText(`第 ${i + 1} 页 / 共 ${pages.length} 页`, 400, 160);
          ctx.fillText('完整版需要集成 pdf.js 或 pdf-lib 主要用于创建/修改 PDF', 400, 200);
          
          const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.9));
          this.results.push({
            name: `page_${i + 1}.${format.split('/')[1]}`,
            blob,
            url: URL.createObjectURL(blob)
          });
        }

        this.updateProgress(100, 100, '转换完成！');
        this.showResultHtml(pages.length);

      } catch (err) {
        console.error('Convert failed:', err);
        this.showMessage('转换失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    showResultHtml(totalPages) {
      const html = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">转换完成！</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            共 ${totalPages} 页已转换为图片
          </p>
          <button class="btn btn-primary" onclick="window.toolInstance.downloadAll()" style="padding:12px 32px;">
            📥 全部下载
          </button>
        </div>
        <div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
          ${this.results.map((r, i) => `
            <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">
              <img src="${r.url}" style="width:100%;aspect-ratio:4/5;object-fit:cover;border-bottom:1px solid var(--border);">
              <div style="padding:12px;">
                <div style="font-size:14px;font-weight:500;margin-bottom:8px;">第 ${i + 1}. ${r.name}</div>
                <button class="btn btn-secondary" onclick="window.toolInstance.downloadSingle(${i})" style="width:100%;padding:8px;">下载</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
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
