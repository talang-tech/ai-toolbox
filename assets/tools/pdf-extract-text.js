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
  // 拖拽区域点击弹出文件选择框 + 拖拽支持
  if (ui.dropZone && ui.fileInput) {
    ui.dropZone.addEventListener('click', (e) => {
      e.preventDefault();
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
    ui.result.innerHTML = '';
    updateUI();
  };

  function updateUI() {
    const hasFile = state.file !== null;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasFile || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
  }

  // 提取核心逻辑
  async function extractText() {
    if (!state.file || !state.pdfDoc) {
      alert(t('noFiles'));
      return;
    }

    state.isProcessing = true;
    updateUI();

    const allText = [];

    try {
      for (let pageNum = 1; pageNum <= state.totalPages; pageNum++) {
        const page = await state.pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items.map(item => item.str).join(' ');
        allText.push(`--- Page ${pageNum} ---\n${pageText}\n`);

        if (ui.progress) {
          ui.progress.style.width = (pageNum / state.totalPages * 100) + '%';
        }
      }

      const fullText = allText.join('\n');
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const baseName = state.file.name.replace('.pdf', '').replace('.PDF', '');

      // 显示结果
      ui.result.innerHTML = `
        <div style="padding:20px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h4 style="margin:0 0 8px 0;">${t('complete')}</h4>
            <p style="color:var(--text-muted);margin-bottom:16px;">
              从 ${state.totalPages} 页中提取了约 ${Math.round(fullText.length / 100) / 10} 千字
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <button onclick="copyText()" class="btn btn-secondary">
                📋 ${t('copy')}
              </button>
              <a href="${url}" download="${baseName}_text.txt" class="btn btn-primary">
                📥 ${t('download')}
              </a>
            </div>
          </div>
          <textarea id="extracted-text" readonly style="width:100%;min-height:300px;padding:16px;font-family:monospace;font-size:14px;border:1px solid var(--border);border-radius:8px;resize:vertical;">${fullText}</textarea>
        </div>
      `;

    } catch (err) {
      console.error('Extraction failed:', err);
      alert(isEN ? 'Extraction failed: ' + err.message : '提取失败：' + err.message);
    }

    state.isProcessing = false;
    updateUI();
  }

  window.copyText = function() {
    const textarea = document.getElementById('extracted-text');
    if (textarea) {
      textarea.select();
      document.execCommand('copy');
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '✅ ' + t('copied');
      setTimeout(() => btn.textContent = originalText, 2000);
    }
  };

  ui.processBtn.addEventListener('click', extractText);
});
