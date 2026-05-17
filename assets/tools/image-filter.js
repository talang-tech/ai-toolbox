/**
 * 图片滤镜工具
 * 纯前端 Canvas 实现，支持灰度、怀旧、反色、对比度、亮度等滤镜
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
    filterType: document.getElementById('filter-type'),
    intensity: document.getElementById('intensity'),
    intensityValue: document.getElementById('intensity-value'),
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
    originalData: null,
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
      filterType: '滤镜类型',
      intensity: '滤镜强度',
      grayscale: '黑白 (灰度)',
      sepia: '怀旧 (棕褐色)',
      invert: '反色',
      contrast: '对比度',
      brightness: '亮度',
      blur: '模糊',
      sharpen: '锐化',
      vintage: '复古',
      cold: '冷色调',
      warm: '暖色调',
    },
    en: {
      dropText: '📁 Click or drag image here\nSupports JPG, PNG, WebP, GIF',
      selectFiles: 'Select File',
      process: 'Export Image',
      processing: 'Processing...',
      download: 'Download',
      noFiles: 'Please select an image first',
      complete: 'Complete!',
      filterType: 'Filter Type',
      intensity: 'Intensity',
      grayscale: 'Grayscale',
      sepia: 'Sepia',
      invert: 'Invert',
      contrast: 'Contrast',
      brightness: 'Brightness',
      blur: 'Blur',
      sharpen: 'Sharpen',
      vintage: 'Vintage',
      cold: 'Cold Tone',
      warm: 'Warm Tone',
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

  if (ui.intensity && ui.intensityValue) {
    ui.intensity.addEventListener('input', () => {
      ui.intensityValue.textContent = ui.intensity.value + '%';
      if (state.image) updatePreview();
    });
  }

  if (ui.filterType) {
    ui.filterType.addEventListener('change', () => {
      if (state.image) updatePreview();
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
        
        // 保存原始像素数据
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        state.originalData = ctx.getImageData(0, 0, img.width, img.height);
        
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
    state.originalData = null;
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
    
    [ui.filterType, ui.intensity, ui.format, ui.quality].forEach(el => {
      if (el) el.disabled = !hasFile;
    });
  }

  // ========================================
  // 6. 滤镜核心
  // ========================================
  function applyFilter(imageData, filterType, intensity) {
    const data = imageData.data;
    const factor = intensity / 100;
    
    // 深拷贝原始数据
    const newData = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      switch (filterType) {
        case 'grayscale':
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          newData[i] = r * (1 - factor) + gray * factor;
          newData[i + 1] = g * (1 - factor) + gray * factor;
          newData[i + 2] = b * (1 - factor) + gray * factor;
          break;
          
        case 'sepia':
          newData[i] = r * (1 - factor) + Math.min(255, r * 0.393 + g * 0.769 + b * 0.189) * factor;
          newData[i + 1] = g * (1 - factor) + Math.min(255, r * 0.349 + g * 0.686 + b * 0.168) * factor;
          newData[i + 2] = b * (1 - factor) + Math.min(255, r * 0.272 + g * 0.534 + b * 0.131) * factor;
          break;
          
        case 'invert':
          newData[i] = r * (1 - factor) + (255 - r) * factor;
          newData[i + 1] = g * (1 - factor) + (255 - g) * factor;
          newData[i + 2] = b * (1 - factor) + (255 - b) * factor;
          break;
          
        case 'contrast':
          const contrastFactor = (259 * (factor * 2 + 255)) / (255 * (259 - factor * 2));
          newData[i] = r * (1 - factor) + Math.max(0, Math.min(255, contrastFactor * (r - 128) + 128)) * factor;
          newData[i + 1] = g * (1 - factor) + Math.max(0, Math.min(255, contrastFactor * (g - 128) + 128)) * factor;
          newData[i + 2] = b * (1 - factor) + Math.max(0, Math.min(255, contrastFactor * (b - 128) + 128)) * factor;
          break;
          
        case 'brightness':
          const brightness = factor * 100;
          newData[i] = Math.max(0, Math.min(255, r + brightness));
          newData[i + 1] = Math.max(0, Math.min(255, g + brightness));
          newData[i + 2] = Math.max(0, Math.min(255, b + brightness));
          break;
          
        case 'vintage':
          newData[i] = r * (1 - factor) + Math.min(255, r * 0.9) * factor;
          newData[i + 1] = g * (1 - factor) + Math.min(255, g * 0.7) * factor;
          newData[i + 2] = b * (1 - factor) + Math.min(255, b * 0.4) * factor;
          break;
          
        case 'cold':
          newData[i] = Math.max(0, r - factor * 50);
          newData[i + 1] = g;
          newData[i + 2] = Math.min(255, b + factor * 50);
          break;
          
        case 'warm':
          newData[i] = Math.min(255, r + factor * 50);
          newData[i + 1] = Math.min(255, g + factor * 20);
          newData[i + 2] = Math.max(0, b - factor * 30);
          break;
      }
    }
    
    return new ImageData(newData, imageData.width, imageData.height);
  }

  function updatePreview() {
    if (!ui.preview || !state.image || !state.originalData) return;
    
    const filterType = ui.filterType ? ui.filterType.value : 'grayscale';
    const intensity = ui.intensity ? parseInt(ui.intensity.value) : 50;
    
    const canvas = document.createElement('canvas');
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    const ctx = canvas.getContext('2d');
    
    // 应用滤镜
    const filteredData = applyFilter(state.originalData, filterType, intensity);
    ctx.putImageData(filteredData, 0, 0);
    
    ui.preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/jpeg', 0.8);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    ui.preview.appendChild(img);
  }

  async function processImage() {
    if (!state.image) return;
    
    const filterType = ui.filterType ? ui.filterType.value : 'grayscale';
    const intensity = ui.intensity ? parseInt(ui.intensity.value) : 50;
    const format = ui.format ? ui.format.value : 'image/jpeg';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.9;
    
    state.isProcessing = true;
    updateUI();
    
    if (ui.progress) {
      ui.progress.style.width = '50%';
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = state.image.width;
      canvas.height = state.image.height;
      const ctx = canvas.getContext('2d');
      
      const filteredData = applyFilter(state.originalData, filterType, intensity);
      ctx.putImageData(filteredData, 0, 0);
      
      const result = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
          const baseName = state.file.name.replace(/\.[^.]+$/, '');
          resolve({
            name: `${baseName}_${filterType}${extMap[format] || '.jpg'}`,
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
  
  if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processImage);
  }
});
