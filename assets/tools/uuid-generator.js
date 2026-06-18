// UUID / ULID / ID Generator - supports multiple ID formats
document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('uuid-output');
    const count = document.getElementById('uuid-count');
    const type = document.getElementById('uuid-type') || document.getElementById('version');
    const noHyphens = document.getElementById('no-hyphens');
    const uppercase = document.getElementById('uppercase');
    const generateBtn = document.getElementById('generate-btn') || document.getElementById('genBtn');
    const copyBtn = document.getElementById('copy-btn') || document.getElementById('copyBtn');

    if (!output) return;

    // --- ULID ---
    // Crockford's Base32 + timestamp-based sortable, 26 chars
    const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';  // no I,L,O,U
    function encodeBase32(num) {
        let s = '';
        // pad to 10 chars for ULID timestamp part
        for (let i = 0; i < 10; i++) {
            s = CROCKFORD[num & 0x1f] + s;
            num >>>= 5;
        }
        return s;
    }

    function generateULID() {
        const now = Date.now();
        const ts = encodeBase32(Math.floor(now));
        // 16 random chars = 80 bits randomness
        let random = '';
        for (let i = 0; i < 16; i++) {
            random += CROCKFORD[Math.floor(Math.random() * 32)];
        }
        return ts + random;  // 26 chars total
    }

    // --- NanoID ---
    const NANOID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';
    function generateNanoID(size) {
        size = size || 21;
        let id = '';
        for (let i = 0; i < size; i++) {
            id += NANOID_ALPHABET[Math.floor(Math.random() * NANOID_ALPHABET.length)];
        }
        return id;
    }

    // --- CUID-like ---
    function generateCUID() {
        const now = Date.now().toString(36);
        const rand = Math.random().toString(36).substring(2, 10);
        const counter = (Math.floor(Math.random() * 1000)).toString(36);
        return 'c' + now + rand + counter;
    }

    // --- Simple Snowflake-like ---
    let lastSnowflake = 0n;
    function generateSnowflake(workerId) {
        workerId = workerId || 1;
        // Twitter Snowflake: 41 bits timestamp + 10 bits worker + 12 bits seq
        const now = BigInt(Date.now());
        const epoch = 1704067200000n; // 2024-01-01
        let ts = now - epoch;
        if (ts <= lastSnowflake >> 12n) {
            // within same ms, increment seq
            const seq = (lastSnowflake & 0xfffn) + 1n;
            lastSnowflake = (ts << 22n) | (BigInt(workerId) << 12n) | seq;
        } else {
            lastSnowflake = (ts << 22n) | (BigInt(workerId) << 12n) | 0n;
        }
        return lastSnowflake.toString();
    }

    // --- UUID generators ---
    function generateUUID(ver) {
        if (ver === 'v1') {
            const now = Date.now();
            const rand = crypto.getRandomValues(new Uint8Array(10));
            return [
                now.toString(16).padStart(8, '0').slice(-8),
                now.toString(16).padStart(4, '0').slice(-4),
                '1' + now.toString(16).padStart(3, '0').slice(-3),
                ((rand[0] & 0x3f) | 0x80).toString(16).padStart(2, '0') + Array.from(rand.slice(1, 3)).map(b => b.toString(16).padStart(2, '0')).join(''),
                Array.from(rand.slice(3, 9)).map(b => b.toString(16).padStart(2, '0')).join('')
            ].join('-');
        } else if (ver === 'v7') {
            const now = Date.now();
            const tsMs = now.toString(16).padStart(12, '0');
            const rand = crypto.getRandomValues(new Uint8Array(10));
            const randA = ((rand[0] & 0x0f) | 0x70).toString(16);  // version 7
            const randB = ((rand[1] & 0x3f) | 0x80).toString(16);  // variant 1
            return tsMs.slice(0, 8) + '-' + tsMs.slice(8, 12) + '-' + '7' + tsMs.slice(12, 15) + randA + '-' + randB + Array.from(rand.slice(2, 4)).map(b => b.toString(16).padStart(2, '0')).join('') + '-' + Array.from(rand.slice(4, 10)).map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (ver === 'v5') {
            const random = crypto.getRandomValues(new Uint8Array(16));
            return [
                Array.from(random.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(''),
                Array.from(random.slice(4, 6)).map(b => b.toString(16).padStart(2, '0')).join(''),
                '5' + Array.from(random.slice(6, 8)).map(b => b.toString(16).padStart(2, '0')).join('').slice(1),
                ((random[8] & 0x3f) | 0x80).toString(16).padStart(2, '0') + random[9].toString(16).padStart(2, '0'),
                Array.from(random.slice(10, 16)).map(b => b.toString(16).padStart(2, '0')).join('')
            ].join('-');
        }
        return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generate() {
        const num = parseInt(count?.value) || 1;
        const selectedType = type?.value || 'uuid-v4';
        const hyphens = noHyphens?.checked;
        const upper = uppercase?.checked;

        let ids = [];
        const maxNum = Math.min(num, 100);

        for (let i = 0; i < maxNum; i++) {
            let id;
            switch (selectedType) {
                case 'ulid':
                    id = generateULID();
                    break;
                case 'nanoid':
                    id = generateNanoID();
                    break;
                case 'cuid':
                    id = generateCUID();
                    break;
                case 'snowflake':
                    id = generateSnowflake();
                    break;
                case 'uuid-v1':
                    id = generateUUID('v1');
                    break;
                case 'uuid-v5':
                    id = generateUUID('v5');
                    break;
                case 'uuid-v7':
                    id = generateUUID('v7');
                    break;
                default: // uuid-v4
                    id = generateUUID('v4');
            }

            if (selectedType.startsWith('uuid-') && hyphens) {
                id = id.replace(/-/g, '');
            }
            if ((selectedType.startsWith('uuid-') || selectedType === 'nanoid') && upper) {
                id = id.toUpperCase();
            }
            ids.push(id);
        }

        output.value = ids.join('\n');
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

    // Auto-generate on load
    generate();

    // Add type info display
    const typeSelect = type;
    if (typeSelect) {
        const infoMap = {
            'uuid-v4': '128-bit fully random | 36 chars',
            'uuid-v7': '128-bit time-ordered | 36 chars',
            'uuid-v1': '128-bit timestamp+MAC | 36 chars',
            'uuid-v5': '128-bit SHA-1 hash based | 36 chars',
            'ulid': '128-bit sortable | 26 chars (Base32 Crockford)',
            'nanoid': 'URL-friendly | 21 chars (A-Za-z0-9_-)',
            'cuid': 'Horizon-style unique | ~25 chars',
            'snowflake': 'Twitter-style 64-bit | up to 19 digits'
        };

        const infoEl = document.getElementById('type-info');
        if (infoEl) {
            const updateInfo = () => {
                infoEl.textContent = infoMap[typeSelect.value] || '';
            };
            typeSelect.addEventListener('change', updateInfo);
            updateInfo();
        }
    }
});