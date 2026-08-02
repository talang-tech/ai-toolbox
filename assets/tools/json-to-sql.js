/**
 * JSON to SQL Converter - Converts JSON array/object to SQL INSERT statements
 * Pure JS, zero dependencies, runs entirely in browser.
 */
(function () {
    'use strict';

    const input = document.getElementById('json2sql-input');
    const output = document.getElementById('json2sql-output');
    const convertBtn = document.getElementById('json2sql-convert');
    const copyBtn = document.getElementById('json2sql-copy');
    const clearBtn = document.getElementById('json2sql-clear');
    const statusEl = document.getElementById('json2sql-status');

    const tableName = document.getElementById('json2sql-table');
    const useBatch = document.getElementById('json2sql-batch');
    const useUpsert = document.getElementById('json2sql-upsert');
    const useKeyColumns = document.getElementById('json2sql-key-columns');
    const keyColumnsInput = document.getElementById('json2sql-key-columns-input');
    const quoteStyle = document.getElementById('json2sql-quote');
    const nullHandler = document.getElementById('json2sql-null');
    const useDrop = document.getElementById('json2sql-drop');
    const useCreate = document.getElementById('json2sql-create');

    const isEN = document.documentElement.lang === 'en';

    const T = (zh, en) => isEN ? en : zh;

    if (!input || !output || !convertBtn) return;

    function escapeSQL(value, quote) {
        if (value === null || value === undefined) return 'NULL';
        const t = typeof value;
        if (t === 'number' || t === 'boolean') return String(value);
        if (t === 'object' && value instanceof Date) {
            return quote === 'single' 
                ? "'" + value.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '') + "'" 
                : '"' + value.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '') + '"';
        }
        // String
        let str = String(value);
        if (quote === 'single') {
            str = str.replace(/'/g, "''");
            return "'" + str + "'";
        } else {
            str = str.replace(/"/g, '""');
            return '"' + str + '"';
        }
    }

    function toSnakeCase(str) {
        return str.replace(/[A-Z]/g, (m, idx) => (idx === 0 ? m.toLowerCase() : '_' + m.toLowerCase()))
            .replace(/[-.\s]+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .replace(/^_+|_+$/g, '');
    }

    function sanitizeColumnName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
    }

    function wrapName(name, quote) {
        return quote === 'single' ? '`' + name + '`' : '"' + name + '"';
    }

    function convert() {
        try {
            const raw = input.value.trim();
            if (!raw) {
                statusEl.textContent = T('请输入 JSON 数据', 'Please enter JSON data');
                statusEl.style.color = 'var(--text-dim)';
                return;
            }

            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                statusEl.textContent = T('JSON 格式错误: ' + e.message, 'Invalid JSON: ' + e.message);
                statusEl.style.color = '#e74c3c';
                return;
            }

            // Normalize to array
            let rows = Array.isArray(data) ? data : [data];
            if (rows.length === 0) {
                statusEl.textContent = T('JSON 数组为空', 'JSON array is empty');
                statusEl.style.color = 'var(--text-dim)';
                return;
            }

            // Collect all keys from all rows
            const keys = new Set();
            for (const row of rows) {
                if (typeof row === 'object' && row !== null) {
                    Object.keys(row).forEach(k => keys.add(k));
                }
            }

            if (keys.size === 0) {
                statusEl.textContent = T('未找到字段', 'No fields found');
                statusEl.style.color = '#e74c3c';
                return;
            }

            const tbl = tableName.value.trim() || 'my_table';
            const quote = quoteStyle.value;
            const nullMode = nullHandler.value;
            const batch = useBatch.checked;
            const upsert = useUpsert.checked;
            const keyColsEnabled = useKeyColumns.checked;
            const keyColsRaw = keyColumnsInput.value.trim();
            const dropTable = useDrop.checked;
            const createTable = useCreate.checked;

            let sql = '';

            // DROP TABLE
            if (dropTable) {
                sql += 'DROP TABLE IF EXISTS ' + wrapName(tbl, quote) + ';\n\n';
            }

            // CREATE TABLE
            if (createTable) {
                const colDefs = [];
                for (const key of keys) {
                    const col = sanitizeColumnName(key);
                    const sample = rows.find(r => r && typeof r === 'object' && r[key] !== null && r[key] !== undefined);
                    const val = sample ? sample[key] : null;
                    let colType = 'TEXT';
                    if (val !== null && val !== undefined) {
                        const t = typeof val;
                        if (t === 'number') colType = Number.isInteger(val) && Math.abs(val) < 2147483648 ? 'INTEGER' : 'REAL';
                        else if (t === 'boolean') colType = 'BOOLEAN';
                        else if (t === 'string' && /^\d{4}-\d{2}-\d{2}(T| )/.test(val)) colType = 'TIMESTAMP';
                        else if (t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) colType = 'DATE';
                        else colType = 'TEXT';
                    }
                    colDefs.push('  ' + wrapName(col, quote) + ' ' + colType);
                }
                sql += 'CREATE TABLE ' + wrapName(tbl, quote) + ' (\n' + colDefs.join(',\n') + '\n);\n\n';
            }

            // INSERT statements
            const colNames = Array.from(keys).map(k => wrapName(sanitizeColumnName(k), quote));
            const colNamesStr = colNames.join(', ');

            if (batch) {
                // Batch INSERT
                const valuesList = [];
                for (const row of rows) {
                    const vals = [];
                    for (const key of keys) {
                        let v = null;
                        if (row && typeof row === 'object' && key in row) {
                            v = row[key];
                        }
                        if (v === null || v === undefined) {
                            vals.push(nullMode === 'null' ? 'NULL' : (nullMode === 'default' ? 'DEFAULT' : ''));
                        } else {
                            vals.push(escapeSQL(v, quote));
                        }
                    }
                    valuesList.push('(' + vals.join(', ') + ')');
                }
                sql += 'INSERT INTO ' + wrapName(tbl, quote) + ' (' + colNamesStr + ')\nVALUES\n' + valuesList.join(',\n') + ';';
            } else {
                // Individual INSERTs
                for (const row of rows) {
                    const vals = [];
                    for (const key of keys) {
                        let v = null;
                        if (row && typeof row === 'object' && key in row) {
                            v = row[key];
                        }
                        if (v === null || v === undefined) {
                            vals.push(nullMode === 'null' ? 'NULL' : (nullMode === 'default' ? 'DEFAULT' : ''));
                        } else {
                            vals.push(escapeSQL(v, quote));
                        }
                    }
                    sql += 'INSERT INTO ' + wrapName(tbl, quote) + ' (' + colNamesStr + ') VALUES (' + vals.join(', ') + ');\n';
                }
            }

            // Upsert (ON CONFLICT)
            if (upsert) {
                let keyCols = [];
                if (keyColsEnabled && keyColsRaw) {
                    keyCols = keyColsRaw.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    // Default to first column
                    keyCols = [sanitizeColumnName(Array.from(keys)[0])];
                }
                if (keyCols.length > 0) {
                    const updateSet = colNames.map(c => c + ' = EXCLUDED.' + c).join(', ');
                    const keyColsWrapped = keyCols.map(k => wrapName(k, quote)).join(', ');
                    const lastStmt = batch ? ';' : ';\n';
                    sql += '\nON CONFLICT (' + keyColsWrapped + ') DO UPDATE SET ' + updateSet + ';';
                }
            }

            output.value = sql;
            const rowCount = rows.length;
            statusEl.textContent = T(
                '✅ 已生成 SQL (' + rowCount + ' 行, ' + keys.size + ' 列)',
                '✅ SQL generated (' + rowCount + ' rows, ' + keys.size + ' columns)'
            );
            statusEl.style.color = '#27ae60';

        } catch (e) {
            statusEl.textContent = T('错误: ' + e.message, 'Error: ' + e.message);
            statusEl.style.color = '#e74c3c';
        }
    }

    // Copy
    copyBtn.addEventListener('click', function () {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(function () {
            const orig = copyBtn.textContent;
            copyBtn.textContent = T('✅ 已复制', '✅ Copied');
            setTimeout(function () { copyBtn.textContent = orig; }, 2000);
        }).catch(function () {
            output.select();
            document.execCommand('copy');
            const orig = copyBtn.textContent;
            copyBtn.textContent = T('✅ 已复制', '✅ Copied');
            setTimeout(function () { copyBtn.textContent = orig; }, 2000);
        });
    });

    // Clear
    clearBtn.addEventListener('click', function () {
        input.value = '';
        output.value = '';
        statusEl.textContent = '';
    });

    // Toggle key columns input
    useKeyColumns.addEventListener('change', function () {
        keyColumnsInput.disabled = !this.checked;
        if (!this.checked) keyColumnsInput.value = '';
    });
    keyColumnsInput.disabled = true;

    convertBtn.addEventListener('click', convert);

    // Auto-run if input has content
    if (input.value.trim()) convert();

    // Ctrl+Enter to convert
    input.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            convert();
        }
    });

})();