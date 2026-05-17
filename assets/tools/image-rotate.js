/**
 * 图片旋转工具
 * 纯前端 Canvas 实现，支持 90°/180°/270° 旋转、镜像翻转
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
    rotateLeft: document.getElementById('rotate-left'),
    rotateRight: document.getElementById('rotate-right'),
    rotate180: document.getElementById('rotate-180'),
    flipH: document.getElementById('flip-h'),
    flipV: document.getElementById('flip-v'),
    reset: document.getElementById('reset'),
    preview: document.getElementById('preview-image'),
    format: document.getElementById('format'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    file: null,
    image: null,
    rotation: 0,
    flipH: false,
    flipV: false,
    processed: null,
    isProcessing: false,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF',
      selectFiles: '选择文件',
      process: '导出图片',
      processing: '处理中...',
      download: '下载',
      noFiles: '请先选择图片',
      complete: '处理完成！',
      rotateLeft: '↺ 左旋 90°',
      rotateRight: '↻ 右旋 90°',
      rotate180: '⟳ 旋转 180°',
      flipH: '↔ 水平翻转',
      flipV: '↕ 垂直翻转',
      reset: '重置',
      preview: '预览',
      currentAngle: '当前角度',
    },
    en: {
      dropText: '📁 Click or drag image here\nSupports JPG, PNG, WebP, GIF',
      selectFiles: 'Select File',
      process: 'Export Image',
      processing: 'Processing...',
      download: 'Download',
      noFiles: 'Please select an image first',
      complete: 'Complete!',
      rotateLeft: '↺ Rotate Left 90°',
      rotateRight: '↻ Rotate Right 90°',
      rotate180: '⟳ Rotate 180°',
      flipH: '↔ Flip Horizontal',
      flipV: '↕ Flip Vertical',
      reset: 'Reset',
      preview: 'Preview',
      currentAngle: 'Current Angle',
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

  // ========================================
  // 5. 文件处理
  // ========================================
  function handleFiles(newFiles) {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert(isEN ? 'Please select an image file' : '请选择图片文件');
      return;
    }

    state.file = imageFiles[0];
    state.rotation = 0;
    state.flipH = false;
    state.flipV = false;
    state.processed = null;
    
    loadImageForPreview(state.file);
    renderFileList();
    updateUI();
  }

  function loadImageForPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        updatePreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderFileList() {
    if (!ui.fileList || !state.file) return;
    
    const file = state.file;
    const size = (file.size / 1024).toFixed(1);
    ui.fileList.innerHTML = `
      <div class="file-item">
        <span class="file-name">${file.name}</span>
        <span class="file-meta">${file.type} · ${size} KB</span>
        <button class="btn-remove" onclick="removeFile()" title="${isEN ? 'Remove' : '移除'}">×</button>
      </div>
    `;
  }

  window.removeFile = function() {
    state.file = null;
    state.image = null;
    state.rotation = 0;
    state.flipH = false;
    state.flipV = false;
    if (ui.preview) ui.preview.innerHTML = '';
    renderFileList();
    updateUI();
  };

  function updateUI() {
    const hasFile = state.file !== null;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasFile || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
    
    if (ui.downloadBtn) {
      ui.downloadBtn.style.display = state.processed ? 'inline-block' : 'none';
    }
    
    // 旋转按钮状态
    [ui.rotateLeft, ui.rotateRight, ui.rotate180, ui.flipH, ui.flipV, ui.reset].forEach(btn => {
      if (btn) btn.disabled = !hasFile;
    });
  }

  function updatePreview() {
    if (!ui.preview || !state.image) return;
    
    const canvas = document.createElement('canvas');
    drawRotatedImage(canvas, state.image, state.rotation, state.flipH, state.flipV);
    
    ui.preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/jpeg', 0.8);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    ui.preview.appendChild(img);
  }

  // ========================================
  // 6. 旋转核心
  // ========================================
  function drawRotatedImage(canvas, img, rotation, flipH, flipV) {
    // 根据旋转角度决定画布尺寸
    const isVertical = rotation === 90 || rotation === 270;
    canvas.width = isVertical ? img.height : img.width;
    canvas.height = isVertical ? img.width : img.height;
    
    const ctx = canvas.getContext('2d');
    
    // 移动坐标系到中心
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // 旋转
    ctx.rotate(rotation * Math.PI / 180);
    
    // 翻转
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);
    
    // 绘制图片（居中）
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
  }

  async function processImage() {
    if (!state.image) return;
    
    const format = ui.format ? ui.format.value : 'image/jpeg';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.9;
    
    state.isProcessing = true;
    updateUI();
    
    if (ui.progress) {
      ui.progress.style.width = '50%';
    }
    
    try {
      const canvas = document.createElement('canvas');
      drawRotatedImage(canvas, state.image, state.rotation, state.flipH, state.flipV);
      
      const result = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
          const baseName = state.file.name.replace(/\.[^.]+$/, '');
          resolve({
            name: `${baseName}_rotated${extMap[format] || '.jpg'}`,
            blob: blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            dimensions: `${canvas.width}×${canvas.height}`,
          });
        }, format, quality);
      });
      
      state.processed = result;
      
      if (ui.progress) {
        ui.progress.style.width = '100%';
      }
    } catch (err) {
      console.error('Process failed:', err);
    }
    
    state.isProcessing = false;
    updateUI();
    renderResults();
  }

  function renderResults() {
    if (!ui.result || !state.processed) return;
    
    const r = state.processed;
    ui.result.innerHTML = `
      <h4>${t('complete')}</h4>
      <div class="result-item">
        <span>${r.name}</span>
        <span class="size-info">${r.dimensions} · ${(r.size / 1024).toFixed(1)} KB</span>
        <a href="${r.url}" download="${r.name}" class="btn-download">${t('download')}</a>
      </div>
    `;
  }

  // ========================================
  // 7. 事件绑定
  // ========================================
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
  
  if (ui.fileInput) {
    ui.fileInput.addEventListener('change', (e) => {
      handleFiles([...e.target.files]);
      e.target.value = '';
    });
  }
  
  // 旋转按钮
  if (ui.rotateLeft) {
    ui.rotateLeft.addEventListener('click', () => {
      state.rotation = (state.rotation - 90 + 360) % 360;
      updatePreview();
    });
  }
  
  if (ui.rotateRight) {
    ui.rotateRight.addEventListener('click', () => {
      state.rotation = (state.rotation + 90) % 360;
      updatePreview();
    });
  }
  
  if (ui.rotate180) {
    ui.rotate180.addEventListener('click', () => {
      state.rotation = (state.rotation + 180) % 360;
      updatePreview();
    });
  }
  
  if (ui.flipH) {
    ui.flipH.addEventListener('click', () => {
      state.flipH = !state.flipH;
      updatePreview();
    });
  }
  
  if (ui.flipV) {
    ui.flipV.addEventListener('click', () => {
      state.flipV = !state.flipV;
      updatePreview();
    });
  }
  
  if (ui.reset) {
    ui.reset.addEventListener('click', () => {
      state.rotation = 0;
      state.flipH = false;
      state.flipV = false;
      updatePreview();
    });
  }
  
  if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processImage);
  }
});
