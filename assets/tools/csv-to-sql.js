// CSV to SQL INSERT Generator
document.addEventListener('DOMContentLoaded', () => {
    const csvInput = document.getElementById('csv-input');
    const sqlOutput = document.getElementById('sql-output');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const tableName = document.getElementById('table-name');
    const insertMode = document.getElementById('insert-mode');
    const delimiter = document.getElementById('delimiter');
    const hasHeader = document.getElementById('has-header');
    const nullEmpty = document.getElementById('null-empty');
    const status = document.getElementById('status');

    if (!csvInput || !sqlOutput) return;

    function escapeSqlValue(val, treatNull) {
        if (val === null || val === undefined) return 'NULL';
        const trimmed = val.trim();
        if (trimmed === '' && treatNull) return 'NULL';
        if (trimmed === '' && !treatNull) return "''";
        if (trimmed === 'NULL' || trimmed === 'null') return 'NULL';
        if (trimmed === 'TRUE' || trimmed === 'true' || trimmed === 'FALSE' || trimmed === 'false') {
            return trimmed.toUpperCase();
        }
        // Check if it's a number
        if (!isNaN(trimmed) && trimmed !== '') return trimmed;
        // String: escape single quotes and backslashes
        const escaped = trimmed.replace(/'/g, "''").replace(/\\/g, '\\\\');
        return `'${escaped}'`;
    }

    function parseCSVLine(line, delim) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === delim) {
                    result.push(current);
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        result.push(current);
        return result;
    }

    function convert() {
        try {
            const raw = csvInput.value.trim();
            if (!raw) {
                sqlOutput.value = '';
                status.textContent = '请粘贴 CSV 数据';
                return;
            }

            const delim = delimiter?.value || ',';
            const tbl = tableName?.value.trim() || 'my_table';
            const mode = insertMode?.value || 'batch';
            const header = hasHeader?.checked !== false;
            const nullAs = nullEmpty?.checked !== false;

            const lines = raw.split('\n').filter(l => l.trim());
            if (lines.length === 0) {
                status.textContent = '没有可处理的 CSV 数据';
                return;
            }

            let columns = [];
            let startRow = 0;

            if (header) {
                columns = parseCSVLine(lines[0], delim).map(c => c.trim());
                startRow = 1;
            } else {
                // Auto-generate col1, col2, ...
                const firstLine = parseCSVLine(lines[0], delim);
                columns = firstLine.map((_, i) => `col${i + 1}`);
            }

            if (startRow >= lines.length) {
                status.textContent = 'CSV 只有表头没有数据';
                sqlOutput.value = '';
                return;
            }

            // Parse data rows
            const dataRows = [];
            for (let i = startRow; i < lines.length; i++) {
                const fields = parseCSVLine(lines[i], delim);
                const row = {};
                for (let j = 0; j < columns.length; j++) {
                    row[columns[j]] = (j < fields.length) ? fields[j] : '';
                }
                dataRows.push(row);
            }

            const colNames = columns.map(c => `"${c}"`).join(', ');
            const sqlLines = [];

            if (mode === 'batch') {
                // Batch insert: INSERT INTO tbl (col1, col2) VALUES (v1, v2), (v3, v4), ...
                const valueRows = dataRows.map(row => {
                    const vals = columns.map(col => escapeSqlValue(row[col], nullAs));
                    return `(${vals.join(', ')})`;
                });
                const chunkSize = 100; // Split into chunks for readability
                for (let i = 0; i < valueRows.length; i += chunkSize) {
                    const chunk = valueRows.slice(i, i + chunkSize);
                    if (i === 0) {
                        sqlLines.push(`INSERT INTO "${tbl}" (${colNames}) VALUES`);
                        sqlLines.push(chunk.join(',\n'));
                    } else {
                        sqlLines.push(`\nINSERT INTO "${tbl}" (${colNames}) VALUES`);
                        sqlLines.push(chunk.join(',\n'));
                    }
                    sqlLines.push(';');
                }
            } else {
                // Single row: one INSERT per row
                for (const row of dataRows) {
                    const vals = columns.map(col => escapeSqlValue(row[col], nullAs));
                    sqlLines.push(`INSERT INTO "${tbl}" (${colNames}) VALUES (${vals.join(', ')});`);
                }
            }

            sqlOutput.value = sqlLines.join('\n');
            status.textContent = `✅ 已生成 ${dataRows.length} 行 INSERT 语句`;

        } catch (e) {
            sqlOutput.value = '';
            status.textContent = `❌ 错误: ${e.message}`;
        }
    }

    function copyToClipboard() {
        if (!sqlOutput.value) {
            status.textContent = '没有内容可复制';
            return;
        }
        navigator.clipboard.writeText(sqlOutput.value).then(() => {
            status.textContent = '✅ 已复制到剪贴板';
        }).catch(() => {
            sqlOutput.select();
            document.execCommand('copy');
            status.textContent = '✅ 已复制到剪贴板';
        });
    }

    function clearAll() {
        csvInput.value = '';
        sqlOutput.value = '';
        status.textContent = '';
    }

    function loadSample() {
        csvInput.value = 'name,email,age,active,role\n' +
            'Alice Johnson,alice@example.com,28,true,admin\n' +
            'Bob Smith,bob@example.com,35,false,editor\n' +
            'Charlie Brown,charlie@example.com,22,true,viewer\n' +
            'Diana Prince,diana@example.com,31,true,admin\n' +
            'Eve Wilson,eve@example.com,27,false,editor';
        convert();
    }

    convertBtn?.addEventListener('click', convert);
    copyBtn?.addEventListener('click', copyToClipboard);
    clearBtn?.addEventListener('click', clearAll);
    sampleBtn?.addEventListener('click', loadSample);
    tableName?.addEventListener('input', convert);
    insertMode?.addEventListener('change', convert);
    delimiter?.addEventListener('change', convert);
    hasHeader?.addEventListener('change', convert);
    nullEmpty?.addEventListener('change', convert);

    // Debounced auto-convert
    let debounceTimer;
    csvInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(convert, 500);
    });

    // Load sample
    loadSample();
});