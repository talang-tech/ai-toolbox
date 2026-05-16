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
  if (window.initDragDrop) {
    window.initDragDrop(ui.dropZone, ui.fileInput, handleFiles);
  }

  ui.fileInput.addEventListener('change', (e) => {
    handleFiles([...e.target.files]);
    e.target.value = '';
  });

  async function handleFiles(newFiles) {
    const pdfFiles = newFiles.filter(f => 
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      alert(isEN ? 'Please select a PDF file' : '请选择 PDF 文件');
      return;
    }

    state.file = pdfFiles[0];
    
    // 加载 PDF 获取页数
    await loadPDFInfo();
    
    renderFileList();
    updateUI();
  }

  async function loadPDFInfo() {
    try {
      const arrayBuffer = await state.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      state.pdfDoc = pdf;
      state.totalPages = pdf.numPages;
      
      renderFileList();
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

  // 转换核心逻辑
  async function convertToImages() {
    if (!state.file || !state.pdfDoc) {
      alert(t('noFiles'));
      return;
    }

    state.isProcessing = true;
    updateUI();

    const format = ui.format ? ui.format.value : 'image/png';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.9;
    const scale = ui.scale ? parseInt(ui.scale.value) : 2;
    const results = [];

    try {
      for (let pageNum = 1; pageNum <= state.totalPages; pageNum++) {
        const page = await state.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // 转换为图片 Blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, format, quality);
        });

        const ext = format === 'image/png' ? 'png' : 'jpg';
        results.push({
          name: `page_${pageNum}.${ext}`,
          blob: blob,
          url: URL.createObjectURL(blob)
        });

        if (ui.progress) {
          ui.progress.style.width = (pageNum / state.totalPages * 100) + '%';
        }
      }

      // 显示结果
      const ext = format === 'image/png' ? 'png' : 'jpg';
      ui.result.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">${t('complete')}</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            ${results.length} 页已转换
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;margin-bottom:20px;">
            ${results.map((r, i) => `
              <div style="text-align:center;">
                <div style="border:1px solid var(--border);border-radius:8px;padding:8px;height:120px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:white;">
                  <img src="${r.url}" style="max-width:100%;max-height:100%;">
                </div>
                <div style="margin-top:8px;">
                  <div style="font-size:12px;color:var(--text-muted);">${r.name}</div>
                  <a href="${r.url}" download="${r.name}" style="font-size:14px;color:var(--primary);">${t('download')}</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      console.error('Conversion failed:', err);
      alert(isEN ? 'Conversion failed: ' + err.message : '转换失败：' + err.message);
    }

    state.isProcessing = false;
    updateUI();
  }

  ui.processBtn.addEventListener('click', convertToImages);
});
