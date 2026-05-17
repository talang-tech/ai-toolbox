/**
 * 图片加水印工具
 * 纯前端 Canvas 实现，支持文字水印和图片水印
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
    watermarkType: document.getElementById('watermark-type'),
    watermarkText: document.getElementById('watermark-text'),
    watermarkImage: document.getElementById('watermark-image'),
    watermarkPosition: document.getElementById('watermark-position'),
    watermarkOpacity: document.getElementById('watermark-opacity'),
    opacityValue: document.getElementById('opacity-value'),
    fontSize: document.getElementById('font-size'),
    fontColor: document.getElementById('font-color'),
    watermarkSize: document.getElementById('watermark-size'),
    sizeValue: document.getElementById('size-value'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    files: [],
    processed: [],
    isProcessing: false,
    watermarkImage: null,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF',
      selectFiles: '选择文件',
      process: '添加水印',
      processing: '处理中...',
      download: '下载全部',
      noFiles: '请先选择图片',
      complete: '水印添加完成！',
      watermarkText: '水印文字',
      watermarkImage: '水印图片',
      position: '水印位置',
      opacity: '透明度',
      fontSize: '字体大小',
      fontColor: '字体颜色',
      imageSize: '水印大小 (%)',
      selectWatermark: '选择水印图片',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF',
      selectFiles: 'Select Files',
      process: 'Add Watermark',
      processing: 'Processing...',
      download: 'Download All',
      noFiles: 'Please select images first',
      complete: 'Watermark Added!',
      watermarkText: 'Watermark Text',
      watermarkImage: 'Watermark Image',
      position: 'Position',
      opacity: 'Opacity',
      fontSize: 'Font Size',
      fontColor: 'Font Color',
      imageSize: 'Watermark Size (%)',
      selectWatermark: 'Select Watermark',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // ========================================
  // 4. 初始化 UI
  // ========================================
  if (ui.watermarkOpacity && ui.opacityValue) {
    ui.watermarkOpacity.addEventListener('input', () => {
      ui.opacityValue.textContent = ui.watermarkOpacity.value + '%';
    });
  }

  if (ui.watermarkSize && ui.sizeValue) {
    ui.watermarkSize.addEventListener('input', () => {
      ui.sizeValue.textContent = ui.watermarkSize.value + '%';
    });
  }

  // 水印类型切换
  if (ui.watermarkType) {
    ui.watermarkType.addEventListener('change', () => {
      const textSection = document.querySelector('.watermark-text-section');
      const imageSection = document.querySelector('.watermark-image-section');
      if (ui.watermarkType.value === 'text') {
        if (textSection) textSection.style.display = 'block';
        if (imageSection) imageSection.style.display = 'none';
      } else {
        if (textSection) textSection.style.display = 'none';
        if (imageSection) imageSection.style.display = 'block';
      }
    });
  }

  // 水印图片选择
  if (ui.watermarkImage) {
    ui.watermarkImage.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            state.watermarkImage = img;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
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
  // 6. 水印核心
  // ========================================
  async function processFiles() {
    if (state.files.length === 0) return;
    
    const type = ui.watermarkType ? ui.watermarkType.value : 'text';
    const text = ui.watermarkText ? ui.watermarkText.value : 'WATERMARK';
    const position = ui.watermarkPosition ? ui.watermarkPosition.value : 'bottom-right';
    const opacity = ui.watermarkOpacity ? parseInt(ui.watermarkOpacity.value) / 100 : 0.3;
    const fontSize = ui.fontSize ? parseInt(ui.fontSize.value) : 48;
    const fontColor = ui.fontColor ? ui.fontColor.value : '#ffffff';
    const watermarkSize = ui.watermarkSize ? parseInt(ui.watermarkSize.value) / 100 : 0.2;
    
    if (type === 'image' && !state.watermarkImage) {
      alert(isEN ? 'Please select a watermark image first' : '请先选择水印图片');
      return;
    }
    
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
        const result = await addWatermark(file, type, text, state.watermarkImage, 
          position, opacity, fontSize, fontColor, watermarkSize);
        state.processed.push(result);
      } catch (err) {
        console.error('Watermark failed:', err);
      }
      
      await new Promise(r => setTimeout(r, 50));
    }
    
    state.isProcessing = false;
    updateUI();
    renderResults();
  }

  function addWatermark(file, type, text, watermarkImg, position, opacity, fontSize, fontColor, watermarkSize) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          ctx.globalAlpha = opacity;
          
          // 计算水印位置
          const positions = getPosition(position, img.width, img.height);
          
          if (type === 'text') {
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = fontColor;
            ctx.textAlign = positions.align;
            ctx.textBaseline = positions.baseline;
            ctx.fillText(text, positions.x, positions.y);
          } else if (watermarkImg) {
            const targetWidth = img.width * watermarkSize;
            const ratio = watermarkImg.height / watermarkImg.width;
            const targetHeight = targetWidth * ratio;
            
            let x = positions.x;
            let y = positions.y;
            
            // 调整位置偏移
            if (position.includes('right')) x -= targetWidth;
            if (position.includes('bottom')) y -= targetHeight;
            if (position === 'center') {
              x -= targetWidth / 2;
              y -= targetHeight / 2;
            }
            
            ctx.drawImage(watermarkImg, x, y, targetWidth, targetHeight);
          }
          
          canvas.toBlob((blob) => {
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const ext = file.name.split('.').pop();
            const newName = `${baseName}_watermarked.${ext}`;
            
            resolve({
              name: newName,
              original: file,
              blob: blob,
              url: URL.createObjectURL(blob),
              originalSize: file.size,
              newSize: blob.size,
            });
          }, file.type || 'image/jpeg', 0.95);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function getPosition(position, width, height) {
    const padding = Math.min(width, height) * 0.03;
    const map = {
      'top-left': { x: padding, y: padding, align: 'left', baseline: 'top' },
      'top-center': { x: width / 2, y: padding, align: 'center', baseline: 'top' },
      'top-right': { x: width - padding, y: padding, align: 'right', baseline: 'top' },
      'center': { x: width / 2, y: height / 2, align: 'center', baseline: 'middle' },
      'bottom-left': { x: padding, y: height - padding, align: 'left', baseline: 'bottom' },
      'bottom-center': { x: width / 2, y: height - padding, align: 'center', baseline: 'bottom' },
      'bottom-right': { x: width - padding, y: height - padding, align: 'right', baseline: 'bottom' },
    };
    return map[position] || map['bottom-right'];
  }

  function renderResults() {
    if (!ui.result) return;
    
    ui.result.innerHTML = '<h4>' + t('complete') + '</h4>' + 
      state.processed.map((r, i) => {
        return `
          <div class="result-item">
            <span>${r.name}</span>
            <span class="size-info">
              ${(r.originalSize / 1024).toFixed(1)} KB → ${(r.newSize / 1024).toFixed(1)} KB
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
    ToolUtils.setupDragDrop(ui.dropZone, ui.fileInput, handleFiles);

  
  
  if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processFiles);
  }
  
  if (ui.downloadBtn) {
    ui.downloadBtn.addEventListener('click', downloadAll);
  }
});
