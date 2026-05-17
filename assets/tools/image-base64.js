/**
 * 图片转 Base64 工具
 * 纯前端实现，支持多种输出格式、尺寸调整、一键复制
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
    progress: document.getElementById('progress'),
    result: document.getElementById('result'),
    format: document.getElementById('format'),
    maxWidth: document.getElementById('max-width'),
    maxHeight: document.getElementById('max-height'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('quality-value'),
  };

  // ========================================
  // 2. 状态管理
  // ========================================
  const state = {
    files: [],
    processed: [],
    isProcessing: false,
  };

  // ========================================
  // 3. 初始化多语言文本
  // ========================================
  const texts = {
    zh: {
      dropText: '📁 点击或拖拽图片到这里\n支持 JPG, PNG, WebP, GIF, BMP',
      selectFiles: '选择文件',
      process: '开始转换',
      processing: '转换中...',
      noFiles: '请先选择图片',
      complete: '转换完成！',
      copy: '复制',
      copied: '已复制',
      preview: '预览',
      maxWidth: '最大宽度',
      maxHeight: '最大高度',
      quality: '输出质量',
      outputFormat: '输出格式',
      dataSize: '数据大小',
      originalSize: '原始尺寸',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF, BMP',
      selectFiles: 'Select Files',
      process: 'Start Convert',
      processing: 'Converting...',
      noFiles: 'Please select images first',
      complete: 'Complete!',
      copy: 'Copy',
      copied: 'Copied',
      preview: 'Preview',
      maxWidth: 'Max Width',
      maxHeight: 'Max Height',
      quality: 'Quality',
      outputFormat: 'Output Format',
      dataSize: 'Data Size',
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
  }

  // ========================================
  // 6. Base64 转换核心
  // ========================================
  async function processFiles() {
    if (state.files.length === 0) return;
    
    const targetFormat = ui.format ? ui.format.value : 'original';
    const maxWidth = ui.maxWidth ? parseInt(ui.maxWidth.value) || 0 : 0;
    const maxHeight = ui.maxHeight ? parseInt(ui.maxHeight.value) || 0 : 0;
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
        const result = await convertToBase64(file, targetFormat, maxWidth, maxHeight, quality);
        state.processed.push(result);
      } catch (err) {
        console.error('Convert failed:', err);
      }
      
      await new Promise(r => setTimeout(r, 50));
    }
    
    state.isProcessing = false;
    updateUI();
    renderResults();
  }

  function convertToBase64(file, targetFormat, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 确定输出格式
          let outputFormat = file.type;
          if (targetFormat === 'image/jpeg') outputFormat = 'image/jpeg';
          else if (targetFormat === 'image/png') outputFormat = 'image/png';
          else if (targetFormat === 'image/webp') outputFormat = 'image/webp';
          
          // 计算尺寸（如果有限制）
          let outputWidth = img.width;
          let outputHeight = img.height;
          
          if (maxWidth > 0 && img.width > maxWidth) {
            const ratio = maxWidth / img.width;
            outputWidth = maxWidth;
            outputHeight = img.height * ratio;
          }
          if (maxHeight > 0 && outputHeight > maxHeight) {
            const ratio = maxHeight / outputHeight;
            outputHeight = maxHeight;
            outputWidth = outputWidth * ratio;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          
          const ctx = canvas.getContext('2d');
          
          // JPG 填充白色背景
          if (outputFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          
          // 转 Base64
          const base64 = canvas.toDataURL(outputFormat, quality);
          
          resolve({
            name: file.name,
            base64: base64,
            originalSize: file.size,
            outputSize: Math.round(base64.length * 0.75),
            originalDimensions: `${img.width}×${img.height}`,
            outputDimensions: `${Math.round(outputWidth)}×${Math.round(outputHeight)}`,
            format: outputFormat,
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderResults() {
    if (!ui.result) return;
    
    ui.result.innerHTML = '<h4>' + t('complete') + '</h4>' + 
      state.processed.map((r, i) => {
        const kbSize = (r.outputSize / 1024).toFixed(1);
        return `
          <div class="result-item">
            <div class="result-header">
              <span><strong>${r.name}</strong> · ${r.outputDimensions} · ${kbSize} KB</span>
              <button class="btn-copy" onclick="copyBase64(${i})" data-index="${i}">${t('copy')}</button>
            </div>
            <div class="result-preview">
              <img src="${r.base64}" alt="Preview" style="max-width: 200px; max-height: 150px;">
            </div>
            <textarea class="base64-output" readonly rows="3" 
              onclick="this.select();">${r.base64.substring(0, 200)}... (total ${r.base64.length} chars)</textarea>
          </div>
        `;
      }).join('');
  }

  window.copyBase64 = function(index) {
    const result = state.processed[index];
    navigator.clipboard.writeText(result.base64).then(() => {
      const btn = document.querySelector(`button[data-index="${index}"]`);
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = t('copied');
        setTimeout(() => btn.textContent = originalText, 2000);
      }
    });
  };

  // ========================================
  // 7. 事件绑定
  // ========================================
  // ========================================
  // 绑定拖拽和点击事件
  // ========================================
  if (ui.dropZone && ui.fileInput) {
    // 点击弹出文件选择
    ui.dropZone.addEventListener('click', (e) => {
      if (e.target === ui.fileInput) return;
      e.preventDefault();
      e.stopPropagation();
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
if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processFiles);
  }
});
