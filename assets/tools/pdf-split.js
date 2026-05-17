/**
 * PDF 分割工具
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
    mode: document.getElementById('mode'),
    pageRange: document.getElementById('page-range'),
    pagesPerFile: document.getElementById('pages-per-file'),
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
      process: '开始分割',
      processing: '分割中...',
      noFiles: '请先选择 PDF 文件',
      complete: '分割完成！',
      download: '下载',
      page: '页',
      totalPages: '总页数',
      rangeHint: '例如: 1-5, 8-10, 15',
      pagesPerFile: '每文件页数',
      splitMode: '分割模式',
      range: '按范围分割',
      everyN: '每 N 页分割',
    },
    en: {
      dropText: '📁 Click or drag PDF file here',
      selectFiles: 'Select File',
      process: 'Start Split',
      processing: 'Splitting...',
      noFiles: 'Please select a PDF file first',
      complete: 'Split Complete!',
      download: 'Download',
      page: 'page(s)',
      totalPages: 'Total Pages',
      rangeHint: 'e.g.: 1-5, 8-10, 15',
      pagesPerFile: 'Pages per File',
      splitMode: 'Split Mode',
      range: 'Split by Range',
      everyN: 'Every N Pages',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // 初始化拖拽
  // ========================================
  // 绑定拖拽和点击事件
  // ========================================
  if (ui.dropZone && ui.fileInput) {
    // 点击弹出文件选择
    ui.dropZone.addEventListener('click', (e) => {
      if (e.target === ui.fileInput) return;
      e.preventDefault();
      e.stopPropagation();
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
ui.processBtn.addEventListener('click', splitPDF);
});
