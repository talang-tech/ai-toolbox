/**
 * PDF 合并工具
 * 使用 ToolBase 基类实现 - 重构版 v2.0
 * 纯前端 pdf-lib.js 实现
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 等待 PDFLib 加载
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

  class PDFMergeTool extends ToolBase {
    constructor() {
      super({
        name: 'PDF 合并工具',
        accept: '.pdf',
        multiple: true
      });
    }

    /**
     * 执行合并
     */
    async process() {
      this.state.isProcessing = true;
      this.updateUI();

      try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (let i = 0; i < this.state.files.length; i++) {
          const file = this.state.files[i];
          this.updateProgress(i + 1, this.state.files.length, `正在处理: ${file.name}`);

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          
          pages.forEach(page => mergedPdf.addPage(page));
          
          // 给 UI 一点时间更新
          await new Promise(r => setTimeout(r, 50));
        }

        this.updateProgress(90, 100, '正在生成文件...');
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        this.showResult(`
          <div style="text-align:center;padding:20px;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h4 style="margin:0 0 16px 0;">合并完成！</h4>
            <p style="color:var(--text-muted);margin-bottom:20px;">
              ${this.state.files.length} 个文件已合并
            </p>
            <button class="btn btn-primary" onclick="window.toolInstance.downloadResult()" style="padding:12px 32px;">
              📥 下载合并后的 PDF
            </button>
          </div>
        `);

        // 保存结果供下载
        this.resultBlob = blob;

      } catch (err) {
        console.error('Merge failed:', err);
        this.showMessage('合并失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    /**
     * 下载合并结果
     */
    downloadResult() {
      if (this.resultBlob) {
        this.downloadBlob(this.resultBlob, 'merged.pdf');
      }
    }
  }

  // 初始化工具实例并暴露到全局
  window.toolInstance = new PDFMergeTool();
});
