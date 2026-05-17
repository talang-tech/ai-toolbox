/**
 * 图片拼接工具
 * 纯前端 Canvas 实现，支持横向/纵向拼接
 */

document.addEventListener('DOMContentLoaded', () => {
  const isEN = document.documentElement.lang === 'en';

  // ========================================
  // 1. DOM 元素引用
  // ========================================
  const ui = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileList: document.getElementById('file-list'),
    processBtn: document.getElementById('process-btn'),
    downloadBtn: document.getElementById('download-btn'),
    progress: document.getElementById('progress'),
    result: document.getElementById('result'),
    direction: document.getElementById('direction'),
    spacing: document.getElementById('spacing'),
    spacingValue: document.getElementById('spacing-value'),
    bgColor: document.getElementById('bg-color'),
    format: document.getElementById('format'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    files: [],
    processed: null,
    isProcessing: false,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽多张图片到这里\n按选择顺序拼接，支持排序',
      selectFiles: '选择文件',
      process: '开始拼接',
      processing: '拼接中...',
      download: '下载',
      noFiles: '请至少选择 2 张图片',
      complete: '拼接完成！',
      direction: '拼接方向',
      horizontal: '横向',
      vertical: '纵向',
      spacing: '图片间距 (px)',
      bgColor: '背景颜色',
      dragToSort: '拖拽调整顺序',
    },
    en: {
      dropText: '📁 Click or drag images here\nDrag to reorder, merged in sequence',
      selectFiles: 'Select Files',
      process: 'Start Merge',
      processing: 'Merging...',
      download: 'Download',
      noFiles: 'Please select at least 2 images',
      complete: 'Complete!',
      direction: 'Direction',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
      spacing: 'Spacing (px)',
      bgColor: 'Background Color',
      dragToSort: 'Drag to Sort',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // ========================================
  // 4. 初始化 UI
  // ========================================
  if (ui.quality && ui.qualityValue) {
    ui.quality.addEventListener('input', () => {
      ui.qualityValue.textContent = ui.quality.value + '%';
    });
  }

  if (ui.spacing && ui.spacingValue) {
    ui.spacing.addEventListener('input', () => {
      ui.spacingValue.textContent = ui.spacing.value + 'px';
    });
  }

  // ========================================
  // 5. 文件处理
  // ========================================
  function handleFiles(newFiles) {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length !== newFiles.length) {
      alert(isEN ? 'Some files are not images and were skipped' : '部分非图片文件已跳过');
    }

    state.files = [...state.files, ...imageFiles];
    state.processed = null;
    renderFileList();
    updateUI();
  }

  function renderFileList() {
    if (!ui.fileList) return;
    
    ui.fileList.innerHTML = state.files.map((file, index) => {
      const size = (file.size / 1024).toFixed(1);
      return `
        <div class="file-item sortable" data-index="${index}" draggable="true">
          <span class="file-order">${index + 1}</span>
          <span class="file-name">${file.name}</span>
          <span class="file-meta">${size} KB</span>
          <button class="btn-remove" onclick="removeFile(${index})" title="${isEN ? 'Remove' : '移除'}">×</button>
        </div>
      `;
    }).join('');
    
    // 启用拖拽排序
    enableDragSort();
  }

  function enableDragSort() {
    const items = document.querySelectorAll('.sortable');
    let draggedItem = null;
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
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
          const fromIndex = parseInt(draggedItem.dataset.index);
          const toIndex = parseInt(item.dataset.index);
          
          // 交换位置
          const temp = state.files[fromIndex];
          state.files[fromIndex] = state.files[toIndex];
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
    
    if (ui.downloadBtn) {
      ui.downloadBtn.style.display = state.processed ? 'inline-block' : 'none';
    }
  }

  // ========================================
  // 6. 图片拼接核心
  // ========================================
  async function processFiles() {
    if (state.files.length < 2) {
      alert(t('noFiles'));
      return;
    }
    
    const direction = ui.direction ? ui.direction.value : 'horizontal';
    const spacing = ui.spacing ? parseInt(ui.spacing.value) : 0;
    const bgColor = ui.bgColor ? ui.bgColor.value : '#ffffff';
    const format = ui.format ? ui.format.value : 'image/jpeg';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.9;
    
    state.isProcessing = true;
    updateUI();
    
    if (ui.progress) {
      ui.progress.style.width = '50%';
    }
    
    try {
      const result = await mergeImages(state.files, direction, spacing, bgColor, format, quality);
      state.processed = result;
      
      if (ui.progress) {
        ui.progress.style.width = '100%';
      }
    } catch (err) {
      console.error('Merge failed:', err);
      alert(isEN ? 'Merge failed, please try again' : '拼接失败，请重试');
    }
    
    state.isProcessing = false;
    updateUI();
    renderResults();
  }

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

  async function mergeImages(files, direction, spacing, bgColor, format, quality) {
    // 加载所有图片
    const images = await Promise.all(files.map(f => loadImage(f)));
    
    // 计算画布尺寸
    let canvasWidth, canvasHeight;
    
    if (direction === 'horizontal') {
      const maxHeight = Math.max(...images.map(img => img.height));
      canvasWidth = images.reduce((sum, img) => {
        const ratio = maxHeight / img.height;
        return sum + Math.round(img.width * ratio);
      }, 0) + spacing * (images.length - 1);
      canvasHeight = maxHeight;
    } else {
      const maxWidth = Math.max(...images.map(img => img.width));
      canvasWidth = maxWidth;
      canvasHeight = images.reduce((sum, img) => {
        const ratio = maxWidth / img.width;
        return sum + Math.round(img.height * ratio);
      }, 0) + spacing * (images.length - 1);
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制所有图片
    let offset = 0;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      let drawWidth, drawHeight, x, y;
      
      if (direction === 'horizontal') {
        const maxHeight = Math.max(...images.map(im => im.height));
        const ratio = maxHeight / img.height;
        drawWidth = Math.round(img.width * ratio);
        drawHeight = maxHeight;
        x = offset;
        y = 0;
        offset += drawWidth + spacing;
      } else {
        const maxWidth = Math.max(...images.map(im => im.width));
        const ratio = maxWidth / img.width;
        drawWidth = maxWidth;
        drawHeight = Math.round(img.height * ratio);
        x = 0;
        y = offset;
        offset += drawHeight + spacing;
      }
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
        resolve({
          name: `merged_${direction}_${Date.now()}${extMap[format] || '.jpg'}`,
          blob: blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          dimensions: `${canvasWidth}×${canvasHeight}`,
        });
      }, format, quality);
    });
  }

  function renderResults() {
    if (!ui.result || !state.processed) return;
    
    const r = state.processed;
    ui.result.innerHTML = `
      <h4>${t('complete')}</h4>
      <div class="result-item">
        <div class="result-preview" style="text-align: center;">
          <img src="${r.url}" alt="Merged" style="max-width: 100%; max-height: 400px;">
        </div>
        <p>${r.dimensions} · ${(r.size / 1024).toFixed(1)} KB</p>
        <a href="${r.url}" download="${r.name}" class="btn btn-primary">${t('download')}</a>
      </div>
    `;
  }

  // ========================================
  // 7. 事件绑定
  // ========================================
  // 拖拽区域点击弹出文件选择框 + 拖拽支持
  if (ui.dropZone && ui.fileInput) {
    ui.dropZone.addEventListener('click', () => ui.fileInput.click());
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
  
  if (ui.fileInput) {
    ui.fileInput.addEventListener('change', (e) => {
      handleFiles([...e.target.files]);
      e.target.value = '';
    });
  }
  
  if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processFiles);
  }
});
