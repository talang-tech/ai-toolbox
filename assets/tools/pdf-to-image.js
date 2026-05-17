/**
 * PDF 转图片工具
 * 纯前端 pdf.js + canvas 实现
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
    format: document.getElementById('format'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
    scale: document.getElementById('scale'),
    scaleValue: document.getElementById('scale-value'),
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
      process: '开始转换',
      processing: '转换中...',
      noFiles: '请先选择 PDF 文件',
      complete: '转换完成！',
      download: '下载',
      downloadAll: '打包下载全部',
      page: '页',
      totalPages: '总页数',
      format: '输出格式',
      quality: '图片质量',
      scale: '缩放比例',
    },
    en: {
      dropText: '📁 Click or drag PDF file here',
      selectFiles: 'Select File',
      process: 'Start Convert',
      processing: 'Converting...',
      noFiles: 'Please select a PDF file first',
      complete: 'Conversion Complete!',
      download: 'Download',
      downloadAll: 'Download All as ZIP',
      page: 'page(s)',
      totalPages: 'Total Pages',
      format: 'Output Format',
      quality: 'Quality',
      scale: 'Scale',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // 滑块更新
  if (ui.quality && ui.qualityValue) {
    ui.quality.addEventListener('input', () => {
      ui.qualityValue.textContent = ui.quality.value + '%';
    });
  }
  if (ui.scale && ui.scaleValue) {
    ui.scale.addEventListener('input', () => {
      ui.scaleValue.textContent = ui.scale.value + 'x';
    });
  }

  // 初始化拖拽
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
ui.processBtn.addEventListener('click', convertToImages);
});
