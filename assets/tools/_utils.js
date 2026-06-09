/**
 * 文件处理工具通用函数库
 * 所有 PDF/图片工具都复用这些函数
 * @version 2.0.0
 */

(function(global) {
  'use strict';

  // ========================================
  // 工具基类 - 所有文件处理工具继承此类
  // ========================================
  class ToolBase {
    /**
     * 构造函数
     * @param {Object} config - 配置
     * @param {string} config.name - 工具名称
     * @param {string} config.accept - 接受的文件类型
     * @param {boolean} config.multiple - 是否支持多文件
     * @param {Function} config.onProcess - 处理函数
     */
    constructor(config) {
      this.config = config;
      this.state = {
        files: [],
        isProcessing: false,
        results: []
      };
      
      // DOM 元素
      this.ui = {
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        fileList: document.getElementById('file-list'),
        processBtn: document.getElementById('process-btn'),
        progress: document.getElementById('progress'),
        result: document.getElementById('result')
      };

      this.init();
    }

    /**
     * 初始化工具
     */
    init() {
      this.setupDragDrop();
      this.setupProcessButton();
      this.renderFileList();
      console.log(`✅ ${this.config.name} 初始化完成`);
    }

    /**
     * 设置拖拽上传
     */
    setupDragDrop() {
      const { dropZone, fileInput } = this.ui;
      if (!dropZone || !fileInput) return;

      // 点击弹出文件选择
      dropZone.addEventListener('click', (e) => {
        // fileInput lives inside dropZone on several pages. A programmatic
        // fileInput.click() can bubble back to dropZone and recursively open
        // the picker unless clicks that originate from the input are ignored.
        if (e.target === fileInput) return;
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      });

      // 拖拽进入
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      // 拖拽离开
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      // 拖拽放下
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        this.handleFiles([...e.dataTransfer.files]);
      });

      // 文件选择变化
      fileInput.addEventListener('change', (e) => {
        this.handleFiles([...e.target.files]);
        e.target.value = '';
      });
    }

    /**
     * 设置处理按钮
     */
    setupProcessButton() {
      const { processBtn } = this.ui;
      if (!processBtn) return;

      processBtn.addEventListener('click', () => {
        if (this.state.isProcessing) return;
        if (this.state.files.length === 0) {
          this.showMessage('请先选择文件', 'warning');
          return;
        }
        this.process();
      });
    }

    /**
     * 处理文件 - 可被子类覆盖
     * @param {File[]} files - 文件列表
     */
    handleFiles(files) {
      const { accept, multiple } = this.config;
      
      // 过滤文件类型
      const filtered = files.filter(f => {
        if (accept === 'image/*') return f.type.startsWith('image/');
        if (accept === '.pdf') return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        return true;
      });

      if (filtered.length !== files.length) {
        const skipped = files.length - filtered.length;
        this.showMessage(`跳过了 ${skipped} 个不支持的文件`, 'warning');
      }

      if (multiple) {
        this.state.files = [...this.state.files, ...filtered];
      } else {
        this.state.files = filtered;
      }

      this.renderFileList();
      this.updateUI();
    }

    /**
     * 删除文件
     * @param {number} index - 文件索引
     */
    removeFile(index) {
      this.state.files.splice(index, 1);
      this.renderFileList();
      this.updateUI();
    }

    /**
     * 渲染文件列表
     */
    renderFileList() {
      const { fileList } = this.ui;
      if (!fileList) return;

      if (this.state.files.length === 0) {
        fileList.innerHTML = '<div class="text-center text-muted" style="padding:20px;color:var(--text-muted);">暂无文件</div>';
        return;
      }

      fileList.innerHTML = this.state.files.map((file, i) => `
        <div class="file-item" data-index="${i}" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-light);border-radius:8px;margin-bottom:8px;">
          <span style="font-size:20px;">📄</span>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${this.formatSize(file.size)}</div>
          </div>
          <button class="btn-remove" onclick="window.toolInstance.removeFile(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px 8px;border-radius:4px;">✕</button>
        </div>
      `).join('');
    }

    /**
     * 更新 UI 状态
     */
    updateUI() {
      const { processBtn } = this.ui;
      if (processBtn) {
        processBtn.disabled = this.state.files.length === 0 || this.state.isProcessing;
      }
    }

    /**
     * 处理入口 - 子类必须覆盖
     */
    async process() {
      throw new Error('子类必须实现 process() 方法');
    }

    /**
     * 显示消息
     * @param {string} message - 消息内容
     * @param {string} type - 类型: success/warning/error
     */
    showMessage(message, type = 'success') {
      const colors = {
        success: 'var(--success)',
        warning: '#f59e0b',
        error: 'var(--danger)'
      };
      alert(message);
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

    /**
     * 更新进度条
     * @param {number} current - 当前进度
     * @param {number} total - 总进度
     * @param {string} message - 消息
     */
    updateProgress(current, total, message = '') {
      const { progress } = this.ui;
      if (!progress) return;
      
      const percent = Math.round((current / total) * 100);
      progress.innerHTML = `
        <div style="margin:20px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
            <span>${message || '处理中...'}</span>
            <span>${current} / ${total}</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${percent}%;background:var(--primary);transition:width 0.3s;"></div>
          </div>
          <div style="text-align:center;margin-top:8px;font-weight:500;">${percent}%</div>
        </div>
      `;
    }

    /**
     * 显示结果
     * @param {string} html - 结果 HTML
     */
    showResult(html) {
      const { result } = this.ui;
      if (result) {
        result.innerHTML = html;
      }
    }

    /**
     * 下载 Blob 文件
     * @param {Blob} blob - 文件 Blob
     * @param {string} filename - 文件名
     */
    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // ========================================
  // 旧版兼容函数 - 保持向后兼容
  // ========================================
  
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function setupDragDrop(dropZone, fileInput, callback) {
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', (e) => {
      if (e.target === fileInput) return;
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = [...e.dataTransfer.files];
      if (callback) callback(files);
    });

    fileInput.addEventListener('change', () => {
      const files = [...fileInput.files];
      if (callback) callback(files);
    });
  }

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

  function renderFileList(container, files, onRemove) {
    if (!container) return;

    if (files.length === 0) {
      container.innerHTML = '<div class="text-center text-muted" style="padding:20px;color:var(--text-muted);">暂无文件</div>';
      return;
    }

    container.innerHTML = files.map((file, i) => `
      <div class="file-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-light);border-radius:8px;margin-bottom:8px;">
        <span style="font-size:20px;">📄</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</div>
          <div style="font-size:12px;color:var(--text-muted);">${formatSize(file.size)}</div>
        </div>
        <button class="btn-remove" data-index="${i}" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px 8px;border-radius:4px;">✕</button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        if (typeof onRemove === 'function') onRemove(index);
      });
    });
  }

  // ========================================
  // 导出到全局
  // ========================================
  global.ToolUtils = {
    // 新版 - 基类
    ToolBase,
    
    // 旧版 - 兼容函数
    formatSize,
    setupDragDrop,
    downloadBlob,
    renderFileList
  };

  // 快捷方式
  global.ToolBase = ToolBase;

})(window);
