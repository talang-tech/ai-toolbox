// Base64 Image Encoder
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const preview = document.getElementById('image-preview');
    const output = document.getElementById('base64-output');
    const formatSelect = document.getElementById('output-format');
    const fileInfo = document.getElementById('file-info');
    
    if (!fileInput || !output) return;

    function processFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // Show preview
            if (preview) {
                preview.src = dataUrl;
                preview.style.display = 'block';
            }

            // Show file info
            if (fileInfo) {
                const sizeKB = (dataUrl.length * 0.75 / 1024).toFixed(2);
                fileInfo.textContent = `${file.name} | Original: ${(file.size / 1024).toFixed(2)} KB | Base64: ${sizeKB} KB (+33% overhead)`;
            }

            updateOutput(dataUrl);
        };
        reader.readAsDataURL(file);
    }

    function updateOutput(dataUrl) {
        const format = formatSelect?.value || 'dataurl';
        
        if (format === 'dataurl') {
            output.value = dataUrl;
        } else if (format === 'css') {
            output.value = `.image {\n  background-image: url("${dataUrl}");\n}`;
        } else if (format === 'html') {
            output.value = `<img src="${dataUrl}" alt="Embedded image">`;
        } else if (format === 'pure') {
            output.value = dataUrl.split(',')[1] || dataUrl;
        }
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    formatSelect?.addEventListener('change', () => {
        if (output.value && output.value.startsWith('data:')) {
            const dataUrl = output.value.match(/data:image[^"']+/)?.[0] || output.value;
            updateOutput(dataUrl);
        }
    });

    // Drag and drop
    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    // Copy button
    document.getElementById('copy-btn')?.addEventListener('click', () => {
        output.select();
        document.execCommand('copy');
    });
});
