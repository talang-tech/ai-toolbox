/**
 * 图片裁剪/缩放工具
 * 纯前端 Canvas 实现，支持自定义尺寸、保持比例
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
    mode: document.getElementById('mode'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    keepRatio: document.getElementById('keep-ratio'),
    format: document.getElementById('format'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
    preview: document.getElementById('preview-container'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    files: [],
    processed: [],
    isProcessing: false,
    originalDimensions: null,
    previewImage: null,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF',
      selectFiles: '选择文件',
      process: '开始处理',
      processing: '处理中...',
      download: '下载全部',
      noFiles: '请先选择图片',
      complete: '处理完成！',
      width: '宽度 (px)',
      height: '高度 (px)',
      keepRatio: '保持宽高比',
      originalSize: '原始尺寸',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF',
      selectFiles: 'Select Files',
      process: 'Start Processing',
      processing: 'Processing...',
      download: 'Download All',
      noFiles: 'Please select images first',
      complete: 'Complete!',
      width: 'Width (px)',
      height: 'Height (px)',
      keepRatio: 'Keep Aspect Ratio',
      originalSize: 'Original Size',
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

  // 保持宽高比逻辑
  if (ui.keepRatio && ui.width && ui.height) {
    ui.width.addEventListener('input', () => {
      if (ui.keepRatio.checked && state.originalDimensions) {
        const ratio = state.originalDimensions.height / state.originalDimensions.width;
        ui.height.value = Math.round(parseInt(ui.width.value) * ratio);
      }
    });
    
    ui.height.addEventListener('input', () => {
      if (ui.keepRatio.checked && state.originalDimensions) {
        const ratio = state.originalDimensions.width / state.originalDimensions.height;
        ui.width.value = Math.round(parseInt(ui.height.value) * ratio);
      }
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
    state.processed = [];
    renderFileList();
    updateUI();
    
    // 加载第一张图片的尺寸用于预览
    if (imageFiles.length > 0) {
      loadImageDimensions(imageFiles[0]);
    }
  }

  function loadImageDimensions(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.originalDimensions = { width: img.width, height: img.height };
        if (ui.width && !ui.width.value) ui.width.value = img.width;
        if (ui.height && !ui.height.value) ui.height.value = img.height;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderFileList() {
    if (!ui.fileList) return;
    
    ui.fileList.innerHTML = state.files.map((file, index) => {
      const size = (file.size / 1024).toFixed(1);
      return `
        <div class="file-item" data-index="${index}">
          <span class="file-name">${file.name}</span>
          <span class="file-meta">${file.type} · ${size} KB</span>
          <button class="btn-remove" onclick="removeFile(${index})" title="${isEN ? 'Remove' : '移除'}">×</button>
        </div>
      `;
    }).join('');
  }

  window.removeFile = function(index) {
    state.files.splice(index, 1);
    renderFileList();
    updateUI();
  };

  function updateUI() {
    const hasFiles = state.files.length > 0;
    
    if (ui.processBtn) {
      ui.processBtn.disabled = !hasFiles || state.isProcessing;
      ui.processBtn.textContent = state.isProcessing ? t('processing') : t('process');
    }
    
    if (ui.downloadBtn) {
      ui.downloadBtn.style.display = state.processed.length > 0 ? 'inline-block' : 'none';
    }
  }

  // ========================================
  // 6. 裁剪/缩放核心
  // ========================================
  async function processFiles() {
    if (state.files.length === 0) return;
    
    const targetWidth = parseInt(ui.width.value) || 800;
    const targetHeight = parseInt(ui.height.value) || 600;
    const mode = ui.mode ? ui.mode.value : 'resize';
    const format = ui.format ? ui.format.value : 'image/jpeg';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.85;
    
    state.isProcessing = true;
    state.processed = [];
    updateUI();
    
    for (let i = 0; i < state.files.length; i++) {
      const file = state.files[i];
      
      if (ui.progress) {
        ui.progress.style.width = ((i + 1) / state.files.length * 100) + '%';
        ui.progress.textContent = `${i + 1}/${state.files.length}`;
      }
      
      try {
        const result = await processImage(file, targetWidth, targetHeight, mode, format, quality);
        state.processed.push(result);
      } catch (err) {
        console.error('Process failed:', err);
      }
      
      await new Promise(r => setTimeout(r, 50));
    }
    
    state.isProcessing = false;
    updateUI();
    renderResults();
  }

  function processImage(file, targetWidth, targetHeight, mode, format, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let outputWidth, outputHeight, offsetX, offsetY;
          
          if (mode === 'crop') {
            // 裁剪模式：居中裁剪到目标尺寸
            const ratio = Math.max(targetWidth / img.width, targetHeight / img.height);
            const scaledWidth = img.width * ratio;
            const scaledHeight = img.height * ratio;
            
            outputWidth = targetWidth;
            outputHeight = targetHeight;
            offsetX = (targetWidth - scaledWidth) / 2;
            offsetY = (targetHeight - scaledHeight) / 2;
            
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            
            canvas.toBlob((blob) => {
              resolve(createResult(file, blob, img.width, img.height, targetWidth, targetHeight));
            }, format, quality);
            
          } else {
            // 缩放模式：缩放到目标尺寸
            outputWidth = targetWidth;
            outputHeight = targetHeight;
            
            const canvas = document.createElement('canvas');
            canvas.width = outputWidth;
            canvas.height = outputHeight;
            
            const ctx = canvas.getContext('2d');
            
            // PNG 转 JPG 时填充白色背景
            if (format === 'image/jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
            
            canvas.toBlob((blob) => {
              resolve(createResult(file, blob, img.width, img.height, outputWidth, outputHeight));
            }, format, quality);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function createResult(file, blob, origW, origH, newW, newH) {
    const extMap = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp'
    };
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const newName = `${baseName}_${newW}x${newH}${extMap[blob.type] || '.jpg'}`;
    
    return {
      name: newName,
      original: file,
      blob: blob,
      url: URL.createObjectURL(blob),
      originalSize: file.size,
      newSize: blob.size,
      originalDimensions: `${origW}×${origH}`,
      newDimensions: `${newW}×${newH}`,
    };
  }

  function renderResults() {
    if (!ui.result) return;
    
    ui.result.innerHTML = '<h4>' + t('complete') + '</h4>' + 
      state.processed.map((r, i) => {
        return `
          <div class="result-item">
            <span>${r.name}</span>
            <span class="size-info">
              ${r.originalDimensions} → ${r.newDimensions}
            </span>
            <a href="${r.url}" download="${r.name}" class="btn-download">${isEN ? 'Download' : '下载'}</a>
          </div>
        `;
      }).join('');
  }

  function downloadAll() {
    state.processed.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = r.url;
        a.download = r.name;
        a.click();
      }, i * 300);
    });
  }

  // ========================================
  // 7. 事件绑定
  // ========================================
  if (typeof window.initDragDrop === 'function') {
    window.initDragDrop(ui.dropZone, ui.fileInput, handleFiles);
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
  
  if (ui.downloadBtn) {
    ui.downloadBtn.addEventListener('click', downloadAll);
  }
});
