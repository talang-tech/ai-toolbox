/**
 * 文件处理工具通用函数
 * 所有 PDF/图片工具都复用这些函数
 */

(function(global) {
  'use strict';

  // ========================================
  // 文件大小格式化
  // ========================================
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  // ========================================
  // 拖放上传初始化
  // ========================================
  function setupDragDrop(dropZone, fileInput, callback) {
    if (!dropZone || !fileInput) return;

    // 点击触发文件选择
    dropZone.addEventListener('click', (e) => {
      // 防止 file-input 自身的点击冒泡导致无限循环
      if (e.target === fileInput) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        fileInput.click();
      } catch (err) {
        console.error('File input click failed:', err);
      }
    });

    // 拖放进入
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    // 拖放离开
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    // 拖放放下
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = [...e.dataTransfer.files];
      if (callback) callback(files);
    });

    // 文件选择
    fileInput.addEventListener('change', () => {
      const files = [...fileInput.files];
      if (callback) callback(files);
    });
  }

  // ========================================
  // Blob 文件下载
  // ========================================
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ========================================
  // 批量下载 (打包成 zip，简单版直接逐个下载)
  // ========================================
  function downloadAll(blobs, prefix = 'processed') {
    blobs.forEach((blob, i) => {
      setTimeout(() => {
        downloadBlob(blob, `${prefix}_${i + 1}.${blob.type.split('/')[1] || 'bin'}`);
      }, i * 300);
    });
  }

  // ========================================
  // 渲染文件列表
  // ========================================
  function renderFileList(container, files, onRemove) {
    if (!container) return;

    if (files.length === 0) {
      container.innerHTML = '<div class="text-center text-muted" style="padding:20px">暂无文件</div>';
      return;
    }

    container.innerHTML = files.map((file, i) => `
      <div class="file-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-light);border-radius:8px;margin-bottom:8px;">
        <span style="font-size:20px">📄</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${formatSize(file.size)}</div>
        </div>
        <button class="btn-remove" data-index="${i}" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px 8px;border-radius:4px;">✕</button>
      </div>
    `).join('');

    // 绑定删除事件
    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        if (typeof onRemove === 'function') onRemove(index);
      });
    });
  }

  // ========================================
  // 更新进度条
  // ========================================
  function updateProgress(container, current, total) {
    if (!container) return;
    const percent = Math.round((current / total) * 100);
    container.innerHTML = `
      <div style="margin:20px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
          <span>处理中...</span>
          <span>${current} / ${total}</span>
        </div>
        <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${percent}%;background:var(--primary);transition:width 0.3s;"></div>
        </div>
        <div style="text-align:center;margin-top:8px;font-weight:500;">${percent}%</div>
      </div>
    `;
  }

  // ========================================
  // 渲染结果表格
  // ========================================
  function renderResults(container, results) {
    if (!container || results.length === 0) return;

    const isEN = document.documentElement.lang === 'en';
    const headers = isEN 
      ? ['Filename', 'Original', 'Processed', 'Saving']
      : ['文件名', '原大小', '处理后', '节省'];

    container.innerHTML = `
      <div style="margin-top:20px;">
        <h4 style="margin-bottom:12px">${isEN ? 'Processing Results' : '处理结果'}</h4>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-light);">
                ${headers.map(h => `<th style="padding:12px;text-align:left;border-bottom:2px solid var(--border);">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${results.map(r => `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:10px;">${r.name}</td>
                  <td style="padding:10px;">${r.originalSize}</td>
                  <td style="padding:10px;">${r.processedSize}</td>
                  <td style="padding:10px;color:${r.saving > 0 ? 'var(--success)' : 'var(--text-muted)'}">${r.saving > 0 ? '-' + r.saving + '%' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ========================================
  // Canvas 图片压缩核心函数
  // ========================================
  async function compressImage(file, quality = 0.8, format = 'image/jpeg', maxWidth = 0, maxHeight = 0) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 缩放
        if (maxWidth > 0 && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (maxHeight > 0 && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Canvas 绘制
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 输出
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              blob,
              width,
              height,
              originalSize: file.size,
              processedSize: blob.size,
              saving: Math.round((1 - blob.size / file.size) * 100),
              name: file.name
            });
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, format, quality);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ========================================
  // 导出到全局
  // ========================================
  global.ToolUtils = {
    formatSize,
    setupDragDrop,
    downloadBlob,
    downloadAll,
    renderFileList,
    updateProgress,
    renderResults,
    compressImage
  };

})(window);
