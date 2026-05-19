/**
 * PDF 分割工具
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

  class PDFSplitTool extends ToolBase {
    constructor() {
      super({
        name: 'PDF 分割工具',
        accept: '.pdf',
        multiple: false
      });
      this.results = [];
      this.setupOptions();
    }

    setupOptions() {
      const mode = document.getElementById('mode');
      const rangeOption = document.getElementById('range-option');
      const everyOption = document.getElementById('every-option');

      if (mode) {
        mode.addEventListener('change', () => {
          if (mode.value === 'range') {
            rangeOption.style.display = 'block';
            everyOption.style.display = 'none';
          } else {
            rangeOption.style.display = 'none';
            everyOption.style.display = 'block';
          }
        });
      }
    }

    async process() {
      this.state.isProcessing = true;
      this.updateUI();
      this.results = [];

      try {
        const file = this.state.files[0];
        const mode = document.getElementById('mode')?.value || 'range';
        const pageRange = document.getElementById('page-range')?.value || '';
        const pagesPerFile = parseInt(document.getElementById('pages-per-file')?.value || '1');

        this.updateProgress(20, 100, '正在读取 PDF...');
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const pdf = await PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();

        if (mode === 'range') {
          // 按范围分割
          const ranges = this.parseRange(pageRange, totalPages);
          for (let i = 0; i < ranges.length; i++) {
            this.updateProgress(30 + (i / ranges.length) * 60, 100, `正在分割第 ${i + 1} 部分...`);
            const [start, end] = ranges[i];
            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdf, Array.from({ length: end - start + 1 }, (_, j) => start + j));
            pages.forEach(p => newPdf.addPage(p));
            const bytes = await newPdf.save();
            this.results.push({
              name: `split_part_${i + 1}.pdf`,
              blob: new Blob([bytes], { type: 'application/pdf' })
            });
          }
        } else {
          // 每页分割
          const totalFiles = Math.ceil(totalPages / pagesPerFile);
          for (let i = 0; i < totalFiles; i++) {
            this.updateProgress(30 + (i / totalFiles) * 60, 100, `正在分割第 ${i + 1} / ${totalFiles} 个文件...`);
            const start = i * pagesPerFile;
            const end = Math.min((i + 1) * pagesPerFile, totalPages) - 1;
            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdf, Array.from({ length: end - start + 1 }, (_, j) => start + j));
            pages.forEach(p => newPdf.addPage(p));
            const bytes = await newPdf.save();
            this.results.push({
              name: `split_part_${i + 1}.pdf`,
              blob: new Blob([bytes], { type: 'application/pdf' })
            });
          }
        }

        this.updateProgress(100, 100, '分割完成！');
        this.showResultHtml(totalPages);

      } catch (err) {
        console.error('Split failed:', err);
        this.showMessage('分割失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    parseRange(rangeStr, totalPages) {
      const ranges = [];
      const parts = rangeStr.split(/[,，]/);
      
      for (const part of parts) {
        const match = part.trim().match(/^(\d+)(?:[-~至](\d+))?$/);
        if (match) {
          let start = parseInt(match[1]) - 1;
          let end = match[2] ? parseInt(match[2]) - 1 : start;
          start = Math.max(0, start);
          end = Math.min(totalPages - 1, end);
          if (start <= end) {
            ranges.push([start, end]);
          }
        }
      }
      
      if (ranges.length === 0) {
        for (let i = 0; i < totalPages; i++) {
          ranges.push([i, i]);
        }
      }
      
      return ranges;
    }

    showResultHtml(totalPages) {
      this.showResult(`
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">分割完成！</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            原始文档 ${totalPages} 页，已分割为 ${this.results.length} 个文件
          </p>
          <button class="btn btn-primary" onclick="window.toolInstance.downloadAll()" style="padding:12px 32px;">
            📥 全部下载
          </button>
        </div>
        <div style="margin-top:20px;">
          ${this.results.map((r, i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-light);border-radius:8px;margin-bottom:8px;">
              <div>
                <div style="font-weight:500;">${r.name}</div>
                <div style="font-size:12px;color:var(--text-muted);">${this.formatSize(r.blob.size)}</div>
              </div>
              <button class="btn btn-secondary" onclick="window.toolInstance.downloadSingle(${i})" style="padding:8px 16px;">
                下载
              </button>
            </div>
          `).join('')}
        </div>
      `);
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

  window.toolInstance = new PDFSplitTool();
});
