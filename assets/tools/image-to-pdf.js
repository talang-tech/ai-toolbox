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
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length !== newFiles.length) {
      alert(isEN ? 'Some non-image files were skipped' : '部分非图片文件已跳过');
    }

    state.files = [...state.files, ...imageFiles];
    renderFileList();
    updateUI();
  }

  function renderFileList() {
    if (!ui.fileList) return;
    
    ui.fileList.innerHTML = state.files.map((file, index) => {
      const size = (file.size / 1024).toFixed(1);
      return `
        <div class="file-item sortable" data-index="${index}" draggable="true" style="display:flex;align-items:center;gap:12px;">
          <span style="cursor:move;user-select:none;">⋮⋮</span>
          <span style="font-weight:600;">${index + 1}</span>
          <span class="file-name" style="flex:1;">${file.name}</span>
          <span class="file-meta">${size} KB</span>
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
    const hasFiles = state.files.length >= 1;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasFiles || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
  }

  // 图片加载辅助
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 生成 PDF 核心逻辑
  async function generatePDF() {
    if (state.files.length === 0) {
      alert(t('noFiles'));
      return;
    }

    state.isProcessing = true;
    updateUI();

    try {
      const { jsPDF } = window.jspdf;
      const pageSize = ui.pageSize ? ui.pageSize.value : 'auto';
      const orientation = ui.orientation ? ui.orientation.value : 'portrait';
      const margin = ui.margin ? parseInt(ui.margin.value) : 10;

      // 创建 PDF（A4 只是初始化，后面会调整）
      let doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        const img = await loadImage(file);

        if (pageSize === 'auto') {
          // 自动页面大小，按图片尺寸
          const imgWidthMm = img.width * 25.4 / 96; // px 转 mm
          const imgHeightMm = img.height * 25.4 / 96;
          
          if (i > 0) {
            doc.addPage([imgWidthMm + margin * 2, imgHeightMm + margin * 2]);
          } else {
            doc = new jsPDF({
              orientation: imgWidthMm > imgHeightMm ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [imgWidthMm + margin * 2, imgHeightMm + margin * 2]
            });
          }
          
          doc.addImage(img, 'JPEG', margin, margin, imgWidthMm, imgHeightMm, '', 'FAST');
        } else {
          // A4 页面，缩放图片适应页面
          const pageWidth = orientation === 'portrait' ? 210 : 297;
          const pageHeight = orientation === 'portrait' ? 297 : 210;
          const imgWidthPx = pageWidth - margin * 2;
          const imgHeightPx = pageHeight - margin * 2;
          
          const ratio = Math.min(imgWidthPx / img.width, imgHeightPx / img.height);
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;
          
          if (i > 0) {
            doc.addPage();
          }
          
          doc.addImage(img, 'JPEG', x, y, drawWidth, drawHeight, '', 'FAST');
        }

        if (ui.progress) {
          ui.progress.style.width = ((i + 1) / state.files.length * 100 + '%';
        }
      }

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      ui.result.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h4 style="margin:0 0 16px 0;">${t('complete')}</h4>
          <p style="color:var(--text-muted);margin-bottom:20px;">
            ${state.files.length} 张图片已合并为 PDF
          </p>
          <a href="${url}" download="images_to_pdf.pdf" class="btn btn-primary" style="display:inline-block;padding:12px 32px;">
            📥 ${t('download')}
          </a>
        </div>
      `;

    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(isEN ? 'PDF generation failed: ' + err.message : 'PDF 生成失败：' + err.message);
    }

    state.isProcessing = false;
    updateUI();
  }

  ui.processBtn.addEventListener('click', generatePDF);
});
