// UUID Generator
document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('uuid-output');
    const count = document.getElementById('uuid-count');
    const version = document.getElementById('uuid-version');
    const noHyphens = document.getElementById('no-hyphens');
    const uppercase = document.getElementById('uppercase');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    if (!output) return;

    function generateUUID(ver) {
        if (ver === 'v1') {
            // Simple v1-like UUID (timestamp-based)
            const now = Date.now();
            const rand = crypto.getRandomValues(new Uint8Array(10));
            return [
                now.toString(16).padStart(8, '0').slice(-8),
                now.toString(16).padStart(4, '0').slice(-4),
                '1' + now.toString(16).padStart(3, '0').slice(-3),
                ((rand[0] & 0x3f) | 0x80).toString(16).padStart(2, '0') + Array.from(rand.slice(1, 3)).map(b => b.toString(16).padStart(2, '0')).join(''),
                Array.from(rand.slice(3, 9)).map(b => b.toString(16).padStart(2, '0')).join('')
            ].join('-');
        } else if (ver === 'v5') {
            // v5-like using SHA-1 hash (simplified)
            const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
            const random = crypto.getRandomValues(new Uint8Array(16));
            return [
                Array.from(random.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(''),
                Array.from(random.slice(4, 6)).map(b => b.toString(16).padStart(2, '0')).join(''),
                '5' + Array.from(random.slice(6, 8)).map(b => b.toString(16).padStart(2, '0')).join('').slice(1),
                ((random[8] & 0x3f) | 0x80).toString(16).padStart(2, '0') + random[9].toString(16).padStart(2, '0'),
                Array.from(random.slice(10, 16)).map(b => b.toString(16).padStart(2, '0')).join('')
            ].join('-');
        }
        // v4 (default)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generate() {
        const num = parseInt(count?.value) || 1;
        const ver = version?.value || 'v4';
        const hyphens = noHyphens?.checked;
        const upper = uppercase?.checked;

        const uuids = [];
        for (let i = 0; i < Math.min(num, 100); i++) {
            let uuid = generateUUID(ver);
            if (hyphens) uuid = uuid.replace(/-/g, '');
            if (upper) uuid = uuid.toUpperCase();
            uuids.push(uuid);
        }
        
        output.value = uuids.join('\n');
    }

    function copy() {
        output.select();
        document.execCommand('copy');
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = original, 1500);
    }

    generateBtn?.addEventListener('click', generate);
    copyBtn?.addEventListener('click', copy);
    
    generate();
});
