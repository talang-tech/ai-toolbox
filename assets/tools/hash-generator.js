// Hash Generator
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const input = document.getElementById('input') || document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const results = document.getElementById('results');
    const md5Output = document.getElementById('md5-output');
    const sha1Output = document.getElementById('sha1-output');
    const sha256Output = document.getElementById('sha256-output');
    const sha512Output = document.getElementById('sha512-output');
    const outputMap = { MD5: md5Output, 'SHA-1': sha1Output, 'SHA-256': sha256Output, 'SHA-512': sha512Output };
    const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

    if (!input) return;

    function md5Bytes(bytes) {
        function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
        function add(a, b) { return ((a + b) & 0xffffffff) >>> 0; }
        function f(x, y, z) { return (x & y) | (~x & z); }
        function g(x, y, z) { return (x & z) | (y & ~z); }
        function h(x, y, z) { return x ^ y ^ z; }
        function i(x, y, z) { return y ^ (x | ~z); }
        function step(fn, a, b, c, d, x, s, t) {
            return add(rotl(add(add(a, fn(b, c, d)), add(x, t)), s), b);
        }

        const len = bytes.length;
        const padLen = (((len + 8) >>> 6) + 1) << 4;
        const blocks = new Uint32Array(padLen);
        for (let j = 0; j < len; j++) blocks[j >> 2] |= bytes[j] << ((j & 3) << 3);
        blocks[len >> 2] |= 0x80 << ((len & 3) << 3);
        const bitLen = len * 8;
        blocks[padLen - 2] = bitLen & 0xffffffff;
        blocks[padLen - 1] = Math.floor(bitLen / 0x100000000);

        let a = 0x67452301;
        let b = 0xefcdab89;
        let c = 0x98badcfe;
        let d = 0x10325476;
        const T = [
            0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,
            0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,
            0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
            0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,
            0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,
            0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,
            0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,
            0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391
        ];
        const S = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];

        for (let off = 0; off < padLen; off += 16) {
            const aa = a;
            const bb = b;
            const cc = c;
            const dd = d;
            for (let k = 0; k < 64; k++) {
                const round = k >> 4;
                let fn;
                let idx;
                if (round === 0) { fn = f; idx = k; }
                else if (round === 1) { fn = g; idx = (5 * k + 1) & 15; }
                else if (round === 2) { fn = h; idx = (3 * k + 5) & 15; }
                else { fn = i; idx = (7 * k) & 15; }
                const s = S[round * 4 + (k & 3)];
                const x = blocks[off + idx];
                [a, b, c, d] = [d, step(fn, a, b, c, d, x, s, T[k]), b, c];
            }
            a = add(a, aa);
            b = add(b, bb);
            c = add(c, cc);
            d = add(d, dd);
        }

        function hex(n) {
            let out = '';
            for (let j = 0; j < 4; j++) out += ((n >>> (j * 8)) & 0xff).toString(16).padStart(2, '0');
            return out;
        }
        return hex(a) + hex(b) + hex(c) + hex(d);
    }

    async function hashText(text, algo) {
        const data = new TextEncoder().encode(text);
        if (algo === 'MD5') return md5Bytes(data);
        const hash = await crypto.subtle.digest(algo, data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async function hashBuffer(buffer, algo) {
        if (algo === 'MD5') return md5Bytes(new Uint8Array(buffer));
        const hash = await crypto.subtle.digest(algo, buffer);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function renderHashes(values) {
        algorithms.forEach(algo => {
            if (outputMap[algo]) outputMap[algo].value = values[algo] || '';
        });

        if (!results) return;
        if (!Object.keys(values).length) {
            results.innerHTML = '';
            return;
        }
        results.innerHTML = algorithms.map(algo => `
            <div style="margin:10px 0">
                <label style="display:block;font-weight:600;margin-bottom:6px">${algo}</label>
                <div style="display:flex;gap:8px;align-items:center">
                    <input readonly value="${values[algo] || ''}" aria-label="${algo} hash" style="flex:1;font-family:monospace">
                    <button type="button" class="copy-hash" data-hash="${algo}">Copy</button>
                </div>
            </div>
        `).join('');
    }

    function setError(err) {
        const message = `Error: ${err.message || err}`;
        renderHashes(Object.fromEntries(algorithms.map(algo => [algo, message])));
    }

    async function computeHashes(text) {
        if (!text) {
            renderHashes({});
            return;
        }

        try {
            const entries = await Promise.all(algorithms.map(async algo => [algo, await hashText(text, algo)]));
            renderHashes(Object.fromEntries(entries));
        } catch (err) {
            setError(err);
        }
    }

    async function computeFileHashes(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target.result;
                const entries = await Promise.all(algorithms.map(async algo => [algo, await hashBuffer(buffer, algo)]));
                renderHashes(Object.fromEntries(entries));
            } catch (err) {
                setError(err);
            }
        };
        reader.onerror = () => setError(reader.error || new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    }

    input.addEventListener('input', () => computeHashes(input.value));

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            computeFileHashes(e.target.files[0]);
        }
    });

    document.addEventListener('click', async (e) => {
        const copyButton = e.target.closest('[data-copy], .copy-hash');
        if (!copyButton) return;

        let value = '';
        const targetId = copyButton.dataset.copy;
        if (targetId) value = document.getElementById(targetId)?.value || '';
        else if (copyButton.classList.contains('copy-hash')) value = copyButton.previousElementSibling?.value || '';
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
        } catch (_) {
            const temp = document.createElement('textarea');
            temp.value = value;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            temp.remove();
        }
        const original = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => { copyButton.textContent = original; }, 1500);
    });

    input.value = 'Hello, World!';
    computeHashes(input.value);
});
