(function() {
  'use strict';

  const isEN = window.location.pathname.startsWith('/en/');

  let headerEnabled = true;
  let rowCount = 1;
  let colCount = 3;

  function generateHTML() {
    var headRows = '';
    if (headerEnabled) {
      headRows += '<tr>';
      for (var c = 0; c < colCount; c++) {
        headRows += '<th style="border:1px solid var(--tgb-color,#ccc);padding:8px;text-align:center;background:#f5f5f5" contenteditable="true">Header ' + (c + 1) + '</th>';
      }
      headRows += '</tr>';
    }
    var bodyRows = '';
    for (var r = 0; r < rowCount; r++) {
      bodyRows += '<tr>';
      for (var c = 0; c < colCount; c++) {
        bodyRows += '<td style="border:1px solid var(--tgb-color,#ccc);padding:8px" contenteditable="true">Data ' + (c + 1) + '</td>';
      }
      bodyRows += '</tr>';
    }
    var html = '<table style="width:100%;border-collapse:collapse">';
    if (headerEnabled) {
      html += '<thead>' + headRows + '</thead>';
    }
    html += '<tbody>' + bodyRows + '</tbody>';
    html += '</table>';
    return html;
  }

  function renderTable() {
    var table = document.getElementById('tgTable');
    var head = document.getElementById('tgHead');
    var body = document.getElementById('tgBody');
    if (!table || !body) return;

    var borderW = parseInt(document.getElementById('tgBorder').value) || 1;
    var borderColor = document.getElementById('tgBorderColor').value || '#ccc';
    var hoverOn = document.getElementById('tgHover').checked;
    var stripeOn = document.getElementById('tgStripe').checked;

    // Set CSS variables on table
    table.style.setProperty('--tgb-color', borderColor);
    table.style.borderCollapse = 'collapse';

    // Rebuild header
    if (headerEnabled && head) {
      head.style.display = '';
      var hr = '<tr>';
      for (var c = 0; c < colCount; c++) {
        hr += '<th style="border:' + borderW + 'px solid ' + borderColor + ';padding:8px;text-align:center;background:#f5f5f5" contenteditable="true">' + (isEN ? 'Header' : '表头') + ' ' + (c + 1) + '</th>';
      }
      hr += '</tr>';
      head.innerHTML = hr;
    } else if (head) {
      head.style.display = 'none';
    }

    // Rebuild body
    var br = '';
    for (var r = 0; r < rowCount; r++) {
      var bg = '';
      if (stripeOn && r % 2 === 1) {
        bg = 'background:#fafafa;';
      }
      br += '<tr' + (hoverOn ? ' onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'\'"' : '') + '>';
      for (var c = 0; c < colCount; c++) {
        br += '<td style="border:' + borderW + 'px solid ' + borderColor + ';padding:8px;' + bg + '" contenteditable="true">' + (isEN ? 'Cell' : '数据') + ' ' + (r * colCount + c + 1) + '</td>';
      }
      br += '</tr>';
    }
    body.innerHTML = br;

    // Update border display
    document.getElementById('tgBorderVal').textContent = borderW + 'px';

    // Update output
    updateOutput();
  }

  function getTableHTML() {
    var table = document.getElementById('tgTable');
    if (!table) return '';
    // Clone and clean up event handlers
    var clone = table.cloneNode(true);
    // Remove onmouseover/onmouseout
    var rows = clone.querySelectorAll('tr');
    rows.forEach(function(r) {
      r.removeAttribute('onmouseover');
      r.removeAttribute('onmouseout');
    });
    // Get border settings
    var borderW = parseInt(document.getElementById('tgBorder').value) || 1;
    var borderColor = document.getElementById('tgBorderColor').value || '#ccc';
    clone.style.borderCollapse = 'collapse';
    clone.style.removeProperty('--tgb-color');
    // Update all cells inline
    clone.querySelectorAll('th, td').forEach(function(cell) {
      var currentStyle = cell.getAttribute('style') || '';
      // Keep existing styles
    });
    // Don't add extra style attributes to preserve editable content
    var html = clone.outerHTML;
    // Clean up
    html = html.replace(/ contenteditable="true"/g, '');
    html = html.replace(/ onmouseover="[^"]*"/g, '');
    html = html.replace(/ onmouseout="[^"]*"/g, '');
    html = html.replace(/ style="width:100%;border-collapse:collapse"/, ' style="width:100%;border-collapse:collapse"');
    return html;
  }

  function updateOutput() {
    var output = document.getElementById('tgOutput');
    if (!output) return;
    output.value = getTableHTML();
  }

  // Global functions called from UI
  window.tgAddRow = function() {
    rowCount++;
    renderTable();
  };

  window.tgAddCol = function() {
    colCount++;
    renderTable();
  };

  window.tgRemoveRow = function() {
    if (rowCount > 1) {
      rowCount--;
      renderTable();
    } else {
      toast(isEN ? 'Need at least 1 row' : '至少需要 1 行');
    }
  };

  window.tgRemoveCol = function() {
    if (colCount > 1) {
      colCount--;
      renderTable();
    } else {
      toast(isEN ? 'Need at least 1 column' : '至少需要 1 列');
    }
  };

  window.tgToggleHeader = function() {
    headerEnabled = !headerEnabled;
    renderTable();
  };

  window.tgCopyHTML = function() {
    var html = getTableHTML();
    navigator.clipboard.writeText(html).then(function() {
      toast(isEN ? 'HTML copied!' : 'HTML 代码已复制!');
    }).catch(function() {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast(isEN ? 'HTML copied!' : 'HTML 代码已复制!');
    });
  };

  window.tgDownload = function() {
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' +
      (isEN ? 'Table Export' : '表格导出') + '</title></head><body>' +
      getTableHTML() + '</body></html>';
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'table.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  window.tgRefreshStyle = function() {
    renderTable();
  };

  function init() {
    var table = document.getElementById('tgTable');
    var output = document.getElementById('tgOutput');
    if (!table || !output) return;
    renderTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();