/**
 * PDF 提取文字工具
 * 纯前端 pdf.js 实现
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEN = document.documentElement.lang === 'en';

  // 设置 pdf.js worker
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }

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
    file: null,
    pdfDoc: null,
    totalPages: 0,
    isProcessing: false,
  };

  // 文本
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽 PDF 文件到这里',
      selectFiles: '选择文件',
      process: '开始提取',
      processing: '提取中...',
      noFiles: '请先选择 PDF 文件',
      complete: '提取完成！',
      download: '下载文本',
      copy: '复制',
      copied: '已复制',
      page: '页',
      totalPages: '总页数',
    },
    en: {
      dropText: '📁 Click or drag PDF file here',
      selectFiles: 'Select File',
      process: 'Start Extract',
      processing: 'Extracting...',
      noFiles: 'Please select a PDF file first',
      complete: 'Extraction Complete!',
      download: 'Download Text',
      copy: 'Copy',
      copied: 'Copied',
      page: 'page(s)',
      totalPages: 'Total Pages',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // 初始化拖拽
    ToolUtils.setupDragDrop(ui.dropZone, ui.fileInput, handleFiles);

  ui.processBtn.addEventListener('click', extractText);
});
