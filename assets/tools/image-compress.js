/**
 * 图片压缩工具
 * 纯前端 Canvas 实现，无需上传服务器
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const isEN = document.documentElement.lang === 'en';

  // ========================================
  // 1. DOM 元素引用
  // ========================================
  const ui = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileList: document.getElementById('file-list'),
    processBtn: document.getElementById('process-btn'),
    downloadBtn: document.getElementById('download-btn'),
    progress: document.getElementById('progress'),
    result: document.getElementById('result'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
    format: document.getElementById('format'),
    maxWidth: document.getElementById('max-width'),
    maxHeight: document.getElementById('max-height'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    files: [],
    processed: [],
    isProcessing: false,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF',
      selectFiles: '选择文件',
      process: '开始压缩',
      processing: '压缩中...',
      download: '下载全部',
      noFiles: '请先选择图片',
      complete: '压缩完成！',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF',
      selectFiles: 'Select Files',
      process: 'Start Compress',
      processing: 'Processing...',
      download: 'Download All',
      noFiles: 'Please select images first',
      complete: 'Complete!',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // ========================================
  // 4. 质量滑块实时更新
  // ========================================
  if (ui.quality && ui.qualityValue) {
    ui.quality.addEventListener('input', () => {
      ui.qualityValue.textContent = ui.quality.value + '%';
    });
  }

  // ========================================
  // 5. 文件处理
  // ========================================
  function handleFiles(newFiles) {
    // 只接受图片
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length !== newFiles.length) {
      alert(isEN ? 'Some files are not images and were skipped' : '部分文件不是图片，已跳过');
    }

    state.files = [...state.files, ...imageFiles];
    ToolUtils.renderFileList(ui.fileList, state.files, handleRemoveFile);
    ui.downloadBtn.style.display = 'none';
    ui.result.innerHTML = '';
  }

  function handleRemoveFile(index) {
    state.files.splice(index, 1);
    ToolUtils.renderFileList(ui.fileList, state.files, handleRemoveFile);
  }

  // ========================================
  // 6. 开始压缩
  // ========================================
  async function handleProcess() {
    if (state.files.length === 0) {
      alert(t('noFiles'));
      return;
    }

    if (state.isProcessing) return;
    state.isProcessing = true;

    ui.processBtn.disabled = true;
    ui.processBtn.textContent = t('processing');
    state.processed = [];

    try {
      const quality = parseInt(ui.quality.value) / 100;
      const format = ui.format.value === 'auto' ? null : 'image/' + ui.format.value;
      const maxW = parseInt(ui.maxWidth.value) || 0;
      const maxH = parseInt(ui.maxHeight.value) || 0;

      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        const outputFormat = format || file.type;
        
        ToolUtils.updateProgress(ui.progress, i + 1, state.files.length);
        
        const result = await ToolUtils.compressImage(file, quality, outputFormat, maxW, maxH);
        state.processed.push(result);
        
        // 实时更新结果
        ToolUtils.renderResults(ui.result, state.processed);
      }

      ui.progress.innerHTML = `<div style="color:var(--success);text-align:center;padding:20px;font-size:18px;font-weight:500;">✅ ${t('complete')}</div>`;
      ui.downloadBtn.style.display = 'inline-block';

    } catch (e) {
      console.error('Compression error:', e);
      ui.progress.innerHTML = `<div style="color:var(--danger);text-align:center;padding:20px;">❌ Error: ${e.message}</div>`;
    } finally {
      state.isProcessing = false;
      ui.processBtn.disabled = false;
      ui.processBtn.textContent = t('process');
    }
  }

  // ========================================
  // 7. 下载全部
  // ========================================
  function handleDownload() {
    state.processed.forEach((r, i) => {
      setTimeout(() => {
        const ext = r.blob.type.split('/')[1];
        const baseName = r.name.replace(/\.[^/.]+$/, '');
        ToolUtils.downloadBlob(r.blob, `${baseName}_compressed.${ext}`);
      }, i * 400);
    });
  }

  // ========================================
  // 8. 初始化拖放
  // ========================================
  // ========================================
  // 绑定拖拽和点击事件
  // ========================================
  if (ui.dropZone && ui.fileInput) {
    // 点击弹出文件选择
    ui.dropZone.addEventListener('click', () => {
      ui.fileInput.click();
    });

    // 拖拽进入
    ui.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      ui.dropZone.classList.add('dragover');
    });

    // 拖拽离开
    ui.dropZone.addEventListener('dragleave', () => {
      ui.dropZone.classList.remove('dragover');
    });

    // 拖拽放下
    ui.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      ui.dropZone.classList.remove('dragover');
      const files = [...e.dataTransfer.files];
      handleFiles(files);
    });

    // 文件选择变化
    ui.fileInput.addEventListener('change', (e) => {
      handleFiles([...e.target.files]);
      e.target.value = '';
    });
  }
// ========================================
  // 9. 绑定事件
  // ========================================
  ui.processBtn.addEventListener('click', handleProcess);
  ui.downloadBtn.addEventListener('click', handleDownload);
  ui.downloadBtn.style.display = 'none';

  // 初始化文件列表
  ToolUtils.renderFileList(ui.fileList, [], () => {});
});
