/**
 * 图片转 PDF 工具
 * 使用 ToolBase 基类实现 - 重构版 v2.0
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

  // 等待 jspdf 加载 (如果存在)
  class ImageToPDFTool extends ToolBase {
    constructor() {
      super({
        name: '图片转 PDF 工具',
        accept: 'image/*',
        multiple: true
      });
      this.resultBlob = null;
    }

    async process() {
      this.state.isProcessing = true;
      this.updateUI();

      try {
        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) throw new Error('jsPDF 加载失败，请检查网络后重试');

        const pageSize = document.getElementById('page-size')?.value || 'auto';
        const marginMm = Math.max(0, parseInt(document.getElementById('margin')?.value || '10', 10));
        const orientation = document.getElementById('orientation')?.value || 'portrait';
        const files = this.state.files;

        if (files.length === 0) {
          this.showMessage('请先选择图片', 'warning');
          return;
        }

        let pdf = null;

        for (let i = 0; i < files.length; i++) {
          this.updateProgress(i + 1, files.length, `正在处理第 ${i + 1} 张图片...`);
          const image = await this.fileToImageData(files[i]);

          let pageWidthMm;
          let pageHeightMm;
          if (pageSize === 'a4') {
            const isLandscape = orientation === 'landscape';
            pageWidthMm = isLandscape ? 297 : 210;
            pageHeightMm = isLandscape ? 210 : 297;
          } else {
            // 96 CSS px ≈ 25.4 mm; keep the PDF page close to the image size.
            pageWidthMm = image.width * 25.4 / 96;
            pageHeightMm = image.height * 25.4 / 96;
          }

          if (!pdf) {
            pdf = new jsPDF({ unit: 'mm', format: [pageWidthMm, pageHeightMm], orientation: pageWidthMm > pageHeightMm ? 'landscape' : 'portrait' });
          } else {
            pdf.addPage([pageWidthMm, pageHeightMm], pageWidthMm > pageHeightMm ? 'landscape' : 'portrait');
          }

          const usableWidth = Math.max(1, pageWidthMm - marginMm * 2);
          const usableHeight = Math.max(1, pageHeightMm - marginMm * 2);
          const scale = Math.min(usableWidth / image.width, usableHeight / image.height);
          const drawWidth = image.width * scale;
          const drawHeight = image.height * scale;
          const x = (pageWidthMm - drawWidth) / 2;
          const y = (pageHeightMm - drawHeight) / 2;

          pdf.addImage(image.dataUrl, image.format, x, y, drawWidth, drawHeight);
        }

        const blob = pdf.output('blob');
        this.resultBlob = blob;
        const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`;

        this.showResult(`
          <div style="text-align:center;padding:20px;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h4 style="margin:0 0 16px 0;">PDF 生成完成！</h4>
            <p style="color:var(--text-muted);margin-bottom:20px;">已合并 ${files.length} 张图片</p>
            <button class="btn btn-primary" id="download-pdf-btn">下载 PDF</button>
          </div>
        `);
        document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
          this.downloadBlob(blob, filename);
        });

        this.downloadBlob(blob, filename);
      } catch (err) {
        console.error('Generate failed:', err);
        this.showMessage('生成失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }

    fileToImageData(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          try {
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0);

            const isPng = file.type === 'image/png';
            resolve({
              width,
              height,
              dataUrl: canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92),
              format: isPng ? 'PNG' : 'JPEG'
            });
          } catch (err) {
            reject(err);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`图片加载失败: ${file.name}`));
        };

        img.src = objectUrl;
      });
    }
  }

  window.toolInstance = new ImageToPDFTool();
});
