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
  // 拖拽区域点击弹出文件选择框 + 拖拽支持
  if (ui.dropZone && ui.fileInput) {
    ui.dropZone.addEventListener('click', (e) => {
      // 防止 file-input 自身的点击冒泡导致无限循环
      if (e.target === ui.fileInput) return;
      
      e.preventDefault();
      e.stopPropagation();
      try {
        ui.fileInput.click();
      } catch (err) {
        console.error('File input click failed:', err);
      }
    });
    ui.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      ui.dropZone.classList.add('dragover');
    });
    ui.dropZone.addEventListener('dragleave', () => {
      ui.dropZone.classList.remove('dragover');
    });
    ui.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      ui.dropZone.classList.remove('dragover');
      const files = [...e.dataTransfer.files];
      handleFiles(files);
    });
  }

  ui.fileInput.addEventListener('change', (e) => {
    handleFiles([...e.target.files]);
    e.target.value = '';
  });

  // 模式切换
  if (ui.mode) {
    ui.mode.addEventListener('change', () => {
      const isRange = ui.mode.value === 'range';
      if (ui.pageRange) ui.pageRange.parentElement.style.display = isRange ? 'block' : 'none';
      if (ui.pagesPerFile) ui.pagesPerFile.parentElement.style.display = isRange ? 'none' : 'block';
    });
  }

  async function handleFiles(newFiles) {
    const pdfFiles = newFiles.filter(f => 
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      alert(isEN ? 'Please select a PDF file' : '请选择 PDF 文件');
      return;
    }

    state.file = pdfFiles[0];
    state.processed = [];
    
    // 加载 PDF 获取页数
    await loadPDFInfo();
    
    renderFileList();
    updateUI();
  }

  async function loadPDFInfo() {
    try {
      const { PDFDocument } = PDFLib;
      const arrayBuffer = await state.file.arrayBuffer();
      state.pdfDoc = await PDFDocument.load(arrayBuffer);
      state.totalPages = state.pdfDoc.getPageCount();
      
      //  renderFileList();
    } catch (err) {
      console.error('Load PDF failed:', err);
      alert(isEN ? 'Failed to load PDF: ' + err.message : '加载 PDF 失败：' + err.message);
    }
  }

  function renderFileList() {
    if (!ui.fileList || !state.file) return;
    
    const size = (state.file.size / 1024 / 1024).toFixed(2);
    ui.fileList.innerHTML = `
      <div class="file-item" style="display:flex;align-items:center;gap:12px;">
        <span class="file-name" style="flex:1;">${state.file.name}</span>
        <span class="file-meta">${size} MB · ${state.totalPages || '?'} ${t('page')}</span>
        <button class="btn-remove" onclick="removeFile()" title="${isEN ? 'Remove' : '移除'}">×</button>
      </div>
    `;
  }

  window.removeFile = function() {
    state.file = null;
    state.pdfDoc = null;
    state.totalPages = 0;
    ui.fileList.innerHTML = '';
    updateUI();
  };

  function updateUI() {
    const hasFile = state.file !== null;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasFile || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
  }

  // 解析页面范围解析
  function parsePageRange(rangeStr, totalPages) {
    const ranges = [];
    const parts = rangeStr.split(',').map(p => p.trim()).filter(p => p);
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          ranges.push({ start: Math.max(1, start), end: Math.min(totalPages, end) });
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page)) {
          ranges.push({ start: Math.max(1, page), end: Math.min(totalPages, page) });
        }
      }
    }
    
    return ranges;
  }

  // 分割核心逻辑
  async function splitPDF() {
    if (!state.file || !state.pdfDoc) {
      alert(t('noFiles'));
      return;
    }

    state.isProcessing = true;
    updateUI();

    try {
      const { PDFDocument } = PDFLib;
      const mode = ui.mode ? ui.mode.value : 'range';
      const results = [];

      if (mode === 'range') {
        // 按范围分割
        const rangeStr = ui.pageRange ? ui.pageRange.value : '';
        const ranges = parsePageRange(rangeStr, state.totalPages);
        
        if (ranges.length === 0) {
          alert(isEN ? 'Invalid page range' : '无效的页面范围');
          state.isProcessing = false;
          updateUI();
          return;
        }

        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(state.pdfDoc, 
            Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start - 1 + idx));
          
          pages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          results.push({
            name: `pages_${range.start}-${range.end}.pdf`,
            blob: blob,
            url: URL.createObjectURL(blob)
          });

          if (ui.progress) {
            ui.progress.style.width = ((i + 1) / ranges.length * 100) + '%';
          }
          await new Promise(r => setTimeout(r, 50));
        }
      } else {
        // 每 N 页分割
        const n = ui.pagesPerFile ? parseInt(ui.pagesPerFile.value) : 1;
        if (isNaN(n) || n < 1) {
          alert(isEN ? 'Invalid pages per file' : '无效的每页数量');
          state.isProcessing = false;
          updateUI();
          return;
        }

        const totalFiles = Math.ceil(state.totalPages / n);
        for (let i = 0; i < totalFiles; i++) {
          const start = i * n + 1;
          const end = Math.min((i + 1) * n, state.totalPages);
          
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(state.pdfDoc, 
            Array.from({ length: end - start + 1 }, (_, idx) => start - 1 + idx));
          
          pages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          results.push({
            name: `part_${i + 1}_pages_${start}-${end}.pdf`,
            blob: blob,
            url: URL.createObjectURL(blob)
          });

          if (ui.progress) {
            ui.progress.style.width = ((i + 1) / totalFiles * 100) + '%';
          }
          await new Promise(r => setTimeout(r, 50));
        }
      }

      // 显示结果
      ui.result.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">${t('complete')}</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            ${results.length} 个文件已生成
          </p>
          <div style="text-align:left;max-width:500px;margin:0 auto;">
            ${results.map((r, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-light);border-radius:6px;margin-bottom:8px;">
                <span>${r.name}</span>
                <a href="${r.url}" download="${r.name}" class="btn btn-secondary" style="padding:6px 12px;font-size:14px;">
                  📥 ${t('download')}
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      console.error('Split failed:', err);
      alert(isEN ? 'Split failed: ' + err.message : '分割失败：' + err.message);
    }

    state.isProcessing = false;
    updateUI();
  }

  ui.processBtn.addEventListener('click', splitPDF);
});
