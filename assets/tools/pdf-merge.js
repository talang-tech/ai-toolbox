/**
 * PDF 合并工具
 * 纯前端 pdf-lib.js 实现
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEN = document.documentElement.lang === 'en';

  // DOM 元素
  const ui = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileList: document.getElementById('file-list'),
    processBtn: document.getElementById('process-btn'),
    progress: document.getElementById('progress'),
    result: document.getElementById('result'),
  };

  // 状态
  const state = {
    files: [],
    isProcessing: false,
  };

  // 文本
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽 PDF 文件到这里\n支持批量选择和拖拽排序',
      selectFiles: '选择文件',
      process: '开始合并',
      processing: '合并中...',
      noFiles: '请至少选择 2 个 PDF 文件',
      complete: '合并完成！',
      download: '下载合并后的 PDF',
      page: '页',
    },
    en: {
      dropText: '📁 Click or drag PDF files here\nBatch select and drag to reorder',
      selectFiles: 'Select Files',
      process: 'Start Merge',
      processing: 'Merging...',
      noFiles: 'Please select at least 2 PDF files',
      complete: 'Merge Complete!',
      download: 'Download Merged PDF',
      page: 'page(s)',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // 初始化拖拽
    ToolUtils.setupDragDrop(ui.dropZone, ui.fileInput, handleFiles);

  ui.processBtn.addEventListener('click', mergePDFs);
});
