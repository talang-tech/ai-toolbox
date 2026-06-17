// Markdown Table Generator - generate markdown tables from CSV/TSV data
(function () {
  'use strict';

  const input = document.getElementById('mtgInput');
  const generateBtn = document.getElementById('mtgGenerate');
  const output = document.getElementById('mtgOutput');
  const copyBtn = document.getElementById('mtgCopy');
  const status = document.getElementById('mtgStatus');
  const delimSelect = document.getElementById('mtgDelim');
  const alignSelect = document.getElementById('mtgAlign');
  const headerCheck = document.getElementById('mtgHeader');
  const isEN = document.documentElement.lang === 'en';

  const t = {
    empty: isEN ? 'Please enter source data (CSV/TSV/text).' : '请先输入源数据（CSV/TSV/文本）。',
    noRows: isEN ? 'No rows found. Check your data and delimiter.' : '未找到数据行，请检查分隔符。',
    generated: (r, c) => isEN ? `Generated ${r} × ${c} Markdown table` : `已生成 ${r} 行 × ${c} 列 Markdown 表格`,
    copied: isEN ? 'Copied!' : '已复制！',
    copyFail: isEN ? 'Copy failed' : '复制失败',
    // Alignment labels
    left: isEN ? 'Left' : '左对齐',
    center: isEN ? 'Center' : '居中',
    right: isEN ? 'Right' : '右对齐',
  };

  function escapeMdCell(cell) {
    // Escape pipe, backslash, newlines in table cells
    return String(cell).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  }

  function generateTable() {
    const raw = input.value.trim();
    if (!raw) {
      status.textContent = t.empty;
      status.className = 'error-message';
      output.value = '';
      return;
    }

    const delim = delimSelect.value;
    const alignment = alignSelect.value;
    const firstRowHeader = headerCheck.checked;

    // Split into lines, remove empty lines
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      status.textContent = t.noRows;
      status.className = 'error-message';
      output.value = '';
      return;
    }

    // Parse rows
    const rows = lines.map(line => {
      // Simple CSV parsing (handles quoted fields)
      if (delim === ',') {
        return parseCSVLine(line);
      }
      return line.split(delim).map(cell => cell.trim());
    });

    const numCols = Math.max(...rows.map(r => r.length));
    if (numCols === 0) {
      status.textContent = t.noRows;
      status.className = 'error-message';
      output.value = '';
      return;
    }

    // Normalize row lengths
    const normalized = rows.map(r => {
      while (r.length < numCols) r.push('');
      return r.slice(0, numCols);
    });

    // Build markdown table
    const mdRows = [];

    // Header row
    if (firstRowHeader) {
      const headerCells = normalized[0].map(c => escapeMdCell(c));
      mdRows.push('| ' + headerCells.join(' | ') + ' |');
      const alignRow = normalized[0].map(() => {
        switch (alignment) {
          case 'left': return ':---';
          case 'center': return ':---:';
          case 'right': return '---:';
          default: return '---';
        }
      });
      mdRows.push('| ' + alignRow.join(' | ') + ' |');

      // Data rows
      for (let i = 1; i < normalized.length; i++) {
        const cells = normalized[i].map(c => escapeMdCell(c));
        mdRows.push('| ' + cells.join(' | ') + ' |');
      }
    } else {
      // No header row - create separator row manually
      const hdrCells = normalized[0].map(c => escapeMdCell(c));
      mdRows.push('| ' + hdrCells.join(' | ') + ' |');
      const alignRow = normalized[0].map(() => {
        switch (alignment) {
          case 'left': return ':---';
          case 'center': return ':---:';
          case 'right': return '---:';
          default: return '---';
        }
      });
      mdRows.push('| ' + alignRow.join(' | ') + ' |');

      for (let i = 1; i < normalized.length; i++) {
        const cells = normalized[i].map(c => escapeMdCell(c));
        mdRows.push('| ' + cells.join(' | ') + ' |');
      }
    }

    const result = mdRows.join('\n');
    output.value = result;

    const dataRows = firstRowHeader ? normalized.length - 1 : normalized.length;
    status.textContent = t.generated(dataRows, numCols);
    status.className = 'success-message';
  }

  // Simple CSV line parser (handles quoted fields with commas)
  function parseCSVLine(line) {
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
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  generateBtn.addEventListener('click', generateTable);

  copyBtn.addEventListener('click', function () {
    const text = output.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = t.copied;
      setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    }).catch(() => {
      alert(t.copyFail);
    });
  });

  // Auto-generate with sample data on load if input is empty
  function loadSample() {
    if (!input.value.trim()) {
      const sample = isEN
        ? 'Name,Email,Role,Department\nAlice,alice@example.com,Developer,Engineering\nBob,bob@test.com,Designer,Design\nCharlie,charlie@corp.io,Manager,Operations'
        : '姓名,邮箱,角色,部门\n张三,zhangsan@example.com,开发,技术部\n李四,lisi@test.com,设计,设计部\n王五,wangwu@corp.io,经理,运营部';
      input.value = sample;
      setTimeout(generateTable, 100);
    }
  }
  loadSample();

})();