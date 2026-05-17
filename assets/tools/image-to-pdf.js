/**
 * 图片转 PDF 工具
 * 纯前端 jsPDF 实现
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
    pageSize: document.getElementById('page-size'),
    orientation: document.getElementById('orientation'),
    margin: document.getElementById('margin'),
  };

  // 状态
  const state = {
    files: [],
    isProcessing: false,
  };

  // 文本
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF，可拖拽排序',
      selectFiles: '选择文件',
      process: '生成 PDF',
      processing: '生成中...',
      noFiles: '请至少选择 1 张图片',
      complete: 'PDF 生成完成！',
      download: '下载 PDF',
      pageSize: '页面大小',
      orientation: '页面方向',
      margin: '边距',
      portrait: '纵向',
      landscape: '横向',
      auto: '自动',
      a4: 'A4',
      px: 'px',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF, drag to reorder',
      selectFiles: 'Select Files',
      process: 'Generate PDF',
      processing: 'Generating...',
      noFiles: 'Please select at least 1 image',
      complete: 'PDF Generated!',
      download: 'Download PDF',
      pageSize: 'Page Size',
      orientation: 'Orientation',
      margin: 'Margin',
      portrait: 'Portrait',
      landscape: 'Landscape',
      auto: 'Auto',
      a4: 'A4',
      px: 'px',
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
ui.processBtn.addEventListener('click', generatePDF);
});
