// JSON to .env Variables Converter
document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const envOutput = document.getElementById('env-output');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const nestMode = document.getElementById('nest-mode');
    const caseMode = document.getElementById('case-mode');
    const quoteStrings = document.getElementById('quote-strings');
    const status = document.getElementById('status');

    if (!jsonInput || !envOutput) return;

    function applyCase(key, mode) {
        if (mode === 'uppercase') return key.toUpperCase();
        if (mode === 'snake') {
            return key
                .replace(/([A-Z])/g, '_$1')
                .replace(/^_/, '')
                .toUpperCase();
        }
        return key;
    }

    function formatValue(val, quoteStr) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') return JSON.stringify(val);
        if (typeof val === 'string') {
            if (quoteStr) {
                const escaped = val.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                return `"${escaped}"`;
            }
            return val;
        }
        return String(val);
    }

    function flattenObject(obj, prefix = '', result = {}, caseMode = 'original') {
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                flattenObject(value, newKey, result, caseMode);
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }

    function convert() {
        try {
            const raw = jsonInput.value.trim();
            if (!raw) {
                envOutput.value = '';
                status.textContent = '请粘贴 JSON 数据';
                return;
            }

            const obj = JSON.parse(raw);
            const mode = nestMode?.value || 'flat';
            const caseM = caseMode?.value || 'original';
            const quoteStr = quoteStrings?.checked !== false;

            let lines = [];

            if (mode === 'flat') {
                const flat = flattenObject(obj, '', {}, caseM);
                for (const [key, value] of Object.entries(flat)) {
                    const envKey = applyCase(key, caseM);
                    const envVal = formatValue(value, quoteStr);
                    lines.push(`${envKey}=${envVal}`);
                }
            } else {
                // Nested: each top-level key becomes a separate env var
                for (const [key, value] of Object.entries(obj)) {
                    const envKey = applyCase(key, caseM);
                    const envVal = formatValue(value, quoteStr);
                    lines.push(`${envKey}=${envVal}`);
                }
            }

            envOutput.value = lines.join('\n');
            status.textContent = `✅ 已生成 ${lines.length} 个环境变量`;

        } catch (e) {
            envOutput.value = '';
            status.textContent = `❌ 解析错误: ${e.message}`;
        }
    }

    function copyToClipboard() {
        if (!envOutput.value) {
            status.textContent = '没有内容可复制';
            return;
        }
        navigator.clipboard.writeText(envOutput.value).then(() => {
            status.textContent = '✅ 已复制到剪贴板';
        }).catch(() => {
            // Fallback
            envOutput.select();
            document.execCommand('copy');
            status.textContent = '✅ 已复制到剪贴板';
        });
    }

    function clearAll() {
        jsonInput.value = '';
        envOutput.value = '';
        status.textContent = '';
    }

    function loadSample() {
        jsonInput.value = JSON.stringify({
            app: {
                name: "MyApp",
                port: 3000,
                debug: false
            },
            database: {
                host: "localhost",
                port: 5432,
                name: "myapp_db",
                user: "admin",
                password: "securepass123"
            },
            redis: {
                url: "redis://localhost:6379",
                ttl: 3600
            },
            features: {
                enableLogging: true,
                maxUploadSize: 10485760
            }
        }, null, 2);
        convert();
    }

    convertBtn?.addEventListener('click', convert);
    copyBtn?.addEventListener('click', copyToClipboard);
    clearBtn?.addEventListener('click', clearAll);
    sampleBtn?.addEventListener('click', loadSample);
    nestMode?.addEventListener('change', convert);
    caseMode?.addEventListener('change', convert);
    quoteStrings?.addEventListener('change', convert);

    // Auto-convert on input with debounce
    let debounceTimer;
    jsonInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 500);
    });

    // Load sample on first visit
    loadSample();
});