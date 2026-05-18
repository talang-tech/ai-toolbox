/**
 * 图片格式转换工具
 * 纯前端 Canvas 实现，支持 JPG/PNG/WebP 互转
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
    format: document.getElementById('format'),
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
      download: '下载全部',
      noFiles: '请先选择图片',
      complete: '转换完成！',
      quality: '输出质量',
      outputFormat: '输出格式',
    },
    en: {
      dropText: '📁 Click or drag images here\nSupports JPG, PNG, WebP, GIF, BMP',
      selectFiles: 'Select Files',
      process: 'Start Convert',
      processing: 'Converting...',
      download: 'Download All',
      noFiles: 'Please select images first',
      complete: 'Complete!',
      quality: 'Output Quality',
      outputFormat: 'Output Format',
    }
  };

  function t(key) {
    return (isEN ? texts.en : texts.zh)[key] || key;
  }

  // ========================================
  // 4. 质量滑块实时更新
  // ========================================
  if (ui.quality && ui.qualityValue) {
    ui.quality.addEventListener('input', () => {
      ui.qualityValue.textContent = ui.quality.value + '%';
    });
  }

  // ========================================
  // 5. 文件处理核心逻辑
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
  // 6. 格式转换核心
  // ========================================
  async function processFiles() {
    if (state.files.length === 0) return;
    
    state.isProcessing = true;
    state.processed = [];
    updateUI();
    
    const targetFormat = ui.format ? ui.format.value : 'image/jpeg';
    const quality = ui.quality ? parseInt(ui.quality.value) / 100 : 0.85;
    
    for (let i = 0; i < state.files.length; i++) {
      const file = state.files[i];
      
      if (ui.progress) {
        ui.progress.style.width = ((i + 1) / state.files.length * 100) + '%';
        ui.progress.textContent = `${i + 1}/${state.files.length}`;
      }
      
      try {
        const result = await convertImage(file, targetFormat, quality);
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

  function convertImage(file, targetFormat, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          
          // PNG 转 JPG 时填充白色背景
          if (targetFormat === 'image/jpeg' && (file.type === 'image/png' || file.type === 'image/webp')) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Conversion failed'));
              return;
            }
            
            // 替换文件扩展名
            const extMap = {
              'image/jpeg': '.jpg',
              'image/png': '.png',
              'image/webp': '.webp'
            };
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const newName = baseName + (extMap[targetFormat] || '.jpg');
            
            resolve({
              name: newName,
              original: file,
              blob: blob,
              url: URL.createObjectURL(blob),
              originalSize: file.size,
              newSize: blob.size,
            });
          }, targetFormat, quality);
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
        const saved = ((1 - r.newSize / r.originalSize) * 100).toFixed(0);
        return `
          <div class="result-item">
            <span>${r.name}</span>
            <span class="size-info">
              ${(r.originalSize / 1024).toFixed(1)} KB → ${(r.newSize / 1024).toFixed(1)} KB
              ${saved > 0 ? `(-${saved}%)` : ''}
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
  
  // 使用 _utils.js 的通用拖放
  // ========================================
  // 绑定拖拽和点击事件
  // ========================================
  if (ui.dropZone && ui.fileInput) {
    // 点击弹出文件选择
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
// 处理按钮
  if (ui.processBtn) {
    ui.processBtn.addEventListener('click', processFiles);
  }
  
  // 下载全部
  if (ui.downloadBtn) {
    ui.downloadBtn.addEventListener('click', downloadAll);
  }
});
