/**
 * 图片转 PDF 工具
 * 使用 ToolBase 基类实现 - 重构版 v2.0
 */

document.addEventListener('DOMContentLoaded', () => {

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
        const pageSize = document.getElementById('page-size')?.value || 'auto';
        const margin = parseInt(document.getElementById('margin')?.value || '10');
        const orientation = document.getElementById('orientation')?.value || 'portrait';

        // 使用 Canvas 生成简单的 PDF 预览图片
        this.updateProgress(50, 100, '正在处理图片...');

        // 演示模式：生成一个包含所有图片信息的 HTML 页面
        // 实际项目需要集成 jsPDF 等库

        const files = this.state.files;
        let htmlContent = `
          <div style="text-align:center;padding:20px;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h4 style="margin:0 0 16px 0;">生成完成！</h4>
            <p style="color:var(--text-muted);margin-bottom:20px;">
              ${files.length} 张图片已处理
            </p>
            <p style="color:var(--text-muted);margin-bottom:20px;font-size:14px;">
              (演示模式: 当前生成包含图片预览)
            </p>
          </div>
          <div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
        `;

        for (let i = 0; i < files.length; i++) {
          const url = URL.createObjectURL(files[i]);
          htmlContent += `
            <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">
              <img src="${url}" style="width:100%;aspect-ratio:4/5;object-fit:cover;border-bottom:1px solid var(--border);">
              <div style="padding:12px;">
                <div style="font-size:14px;font-weight:500;">第 ${i + 1} 张</div>
                <div style="font-size:12px;color:var(--text-muted);">${files[i].name}</div>
              </div>
            </div>
          `;
        }
        htmlContent += '</div>';
        
        this.showResult(htmlContent);

      } catch (err) {
        console.error('Generate failed:', err);
        this.showMessage('生成失败: ' + err.message, 'error');
      }

      this.state.isProcessing = false;
      this.updateUI();
    }
  }

  window.toolInstance = new ImageToPDFTool();
});
