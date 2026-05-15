// Hash Generator
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const md5Output = document.getElementById('md5-output');
    const sha1Output = document.getElementById('sha1-output');
    const sha256Output = document.getElementById('sha256-output');
    const sha512Output = document.getElementById('sha512-output');
    
    if (!input) return;

    async function hashText(text, algo) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hash = await crypto.subtle.digest(algo, data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async function hashBuffer(buffer, algo) {
        const hash = await crypto.subtle.digest(algo, buffer);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async function computeHashes(text) {
        if (!text) {
            md5Output.value = '';
            sha1Output.value = '';
            sha256Output.value = '';
            sha512Output.value = '';
            return;
        }

        const [md5, sha1, sha256, sha512] = await Promise.all([
            hashText(text, 'MD5'),
            hashText(text, 'SHA-1'),
            hashText(text, 'SHA-256'),
            hashText(text, 'SHA-512')
        ]);

        md5Output.value = md5;
        sha1Output.value = sha1;
        sha256Output.value = sha256;
        sha512Output.value = sha512;
    }

    async function computeFileHashes(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = e.target.result;
            const [md5, sha1, sha256, sha512] = await Promise.all([
                hashBuffer(buffer, 'MD5'),
                hashBuffer(buffer, 'SHA-1'),
                hashBuffer(buffer, 'SHA-256'),
                hashBuffer(buffer, 'SHA-512')
            ]);

            md5Output.value = md5;
            sha1Output.value = sha1;
            sha256Output.value = sha256;
            sha512Output.value = sha512;
        };
        reader.readAsArrayBuffer(file);
    }

    input.addEventListener('input', () => computeHashes(input.value));
    
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            computeFileHashes(e.target.files[0]);
        }
    });

    // Copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const target = document.getElementById(targetId);
            if (target) {
                target.select();
                document.execCommand('copy');
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = original, 1500);
            }
        });
    });

    // Initial sample
    input.value = 'Hello, World!';
    computeHashes(input.value);
});
