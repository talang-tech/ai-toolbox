// SQL Formatter
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('sql-input');
    const output = document.getElementById('sql-output');
    const keywordCase = document.getElementById('keyword-case');
    const indentSize = document.getElementById('indent-size');
    
    if (!input || !output) return;

    const KEYWORDS = [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON',
        'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL',
        'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'AS',
        'CREATE', 'TABLE', 'ALTER', 'DROP', 'TRUNCATE',
        'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'VARCHAR', 'INT', 'INTEGER',
        'DECIMAL', 'DATE', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'TEXT',
        'DEFAULT', 'AUTO_INCREMENT', 'NOT NULL', 'UNIQUE', 'CHECK'
    ];

    function formatSQL() {
        let sql = input.value.trim();
        if (!sql) {
            output.value = '';
            return;
        }

        const indent = ' '.repeat(parseInt(indentSize?.value) || 2);
        const upperKeywords = keywordCase?.value === 'upper';

        // Standardize whitespace
        sql = sql.replace(/\s+/g, ' ');

        // Keywords that trigger newlines
        const breakKeywords = [
            'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
            'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
            'UNION', 'VALUES', 'SET', 'AND', 'OR', 'LIMIT'
        ];

        // Add newlines before keywords
        for (const kw of breakKeywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            sql = sql.replace(regex, `\n${indent}${upperKeywords ? kw : kw.toLowerCase()}`);
        }

        // Handle SELECT specially
        sql = sql.replace(/\bSELECT\b/gi, (m) => upperKeywords ? 'SELECT' : 'select');
        
        // Handle commas - newline after commas in SELECT
        sql = sql.replace(/,\s*/g, ',\n' + indent);

        // Capitalize other keywords
        if (upperKeywords) {
            for (const kw of KEYWORDS) {
                if (!breakKeywords.includes(kw)) {
                    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
                    sql = sql.replace(regex, kw);
                }
            }
        }

        // Fix indentation and spacing
        sql = sql.split('\n').map(line => line.trimEnd()).join('\n');
        sql = sql.replace(/\n{3,}/g, '\n\n');

        output.value = sql;
    }

    input.addEventListener('input', formatSQL);
    keywordCase?.addEventListener('change', formatSQL);
    indentSize?.addEventListener('change', formatSQL);

    // Sample SQL
    input.value = "SELECT id, name, email FROM users WHERE age > 18 AND country = 'USA' ORDER BY created_at DESC LIMIT 10";
    formatSQL();
});
