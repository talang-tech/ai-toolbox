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

  // 初始化拖拽和点击事件
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

  function handleFiles(newFiles) {
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length !== newFiles.length) {
      alert(isEN ? 'Some non-PDF files were skipped' : '部分非 PDF 文件已跳过');
    }

    state.files = [...state.files, ...pdfFiles];
    renderFileList();
    updateUI();
  }

  function renderFileList() {
    if (!ui.fileList) return;
    
    ui.fileList.innerHTML = state.files.map((file, index) => {
      const size = (file.size / 1024 / 1024).toFixed(2);
      return `
        <div class="file-item sortable" data-index="${index}" draggable="true" style="display:flex;align-items:center;gap:12px;">
          <span style="cursor:move;user-select:none;">⋮⋮</span>
          <span style="font-weight:600;">${index + 1}</span>
          <span class="file-name" style="flex:1;">${file.name}</span>
          <span class="file-meta">${size} MB</span>
          <button class="btn-remove" onclick="removeFile(${index})" title="${isEN ? 'Remove' : '移除'}">×</button>
        </div>
      `;
    }).join('');

    enableDragSort();
  }

  function enableDragSort() {
    const items = document.querySelectorAll('.sortable');
    let draggedItem = null;
    let draggedIndex = -1;
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        draggedIndex = parseInt(item.dataset.index);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
        draggedIndex = -1;
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('drag-over');
      });
      
      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        
        if (draggedItem && draggedItem !== item) {
          const toIndex = parseInt(item.dataset.index);
          // 交换位置
          const temp = state.files[draggedIndex];
          state.files[draggedIndex] = state.files[toIndex];
          state.files[toIndex] = temp;
          renderFileList();
        }
      });
    });
  }

  window.removeFile = function(index) {
    state.files.splice(index, 1);
    renderFileList();
    updateUI();
  };

  function updateUI() {
    const hasEnoughFiles = state.files.length >= 2;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasEnoughFiles || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
  }

  // 合并核心逻辑
  async function mergePDFs() {
    if (state.files.length < 2) {
      alert(t('noFiles'));
      return;
    }

    state.isProcessing = true;
    updateUI();

    try {
      const { PDFDocument } = PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        
        if (ui.progress) {
          ui.progress.style.width = ((i + 0.5) / state.files.length * 100) + '%';
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach(page => mergedPdf.addPage(page));

        // 给 UI 一点时间更新
        await new Promise(r => setTimeout(r, 50));
      }

      if (ui.progress) {
        ui.progress.style.width = '90%';
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (ui.progress) {
        ui.progress.style.width = '100%';
      }

      ui.result.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">${t('complete')}</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            ${state.files.length} 个文件已合并
          </p>
          <a href="${url}" download="merged.pdf" class="btn btn-primary" style="display:inline-block;padding:12px 32px;">
            📥 ${t('download')}
          </a>
        </div>
      `;

    } catch (err) {
      console.error('Merge failed:', err);
      alert(isEN ? 'Merge failed: ' + err.message : '合并失败：' + err.message);
    }

    state.isProcessing = false;
    updateUI();
  }

  ui.processBtn.addEventListener('click', mergePDFs);
});
