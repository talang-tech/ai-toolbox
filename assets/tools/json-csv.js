// JSON ↔ CSV Converter
(() => {
  const jsonInput = document.getElementById("jsonCsvJson");
  const csvInput = document.getElementById("jsonCsvCsv");
  const toCsvBtn = document.getElementById("toCsvBtn");
  const toJsonBtn = document.getElementById("toJsonBtn");
  const msg = document.getElementById("jsonCsvMsg");

  function showMsg(text, isError = false) {
    msg.textContent = text;
    msg.style.color = isError ? "#ef4444" : "#22c55e";
    setTimeout(() => msg.textContent = "", 2500);
  }

  function escapeCsv(val) {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function toCsv() {
    try {
      let data = JSON.parse(jsonInput.value);
      if (!Array.isArray(data)) data = [data];
      if (data.length === 0) { showMsg("空数组", true); return; }
      const keys = Object.keys(data[0]);
      const rows = [keys.join(",")];
      for (const row of data) {
        rows.push(keys.map(k => escapeCsv(row[k])).join(","));
      }
      csvInput.value = rows.join("\n");
      showMsg(`转换成功 → ${rows.length} 行`);
    } catch (e) { showMsg("JSON 解析错误: " + e.message, true); }
  }

  function toJson() {
    try {
      const lines = csvInput.value.trim().split("\n").filter(l => l.trim());
      if (lines.length === 0) { showMsg("空 CSV", true); return; }
      const parseLine = (line) => {
        const result = [];
        let current = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            if (inQuote && line[i+1] === '"') { current += '"'; i++; }
            else inQuote = !inQuote;
          } else if (c === "," && !inQuote) {
            result.push(current); current = "";
          } else { current += c; }
        }
        result.push(current);
        return result;
      };
      const headers = parseLine(lines[0]);
      const out = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        const obj = {};
        headers.forEach((h, j) => obj[h] = values[j] ?? "");
        out.push(obj);
      }
      jsonInput.value = JSON.stringify(out, null, 2);
      showMsg(`转换成功 → ${out.length} 条记录`);
    } catch (e) { showMsg("CSV 解析错误: " + e.message, true); }
  }

  toCsvBtn.addEventListener("click", toCsv);
  toJsonBtn.addEventListener("click", toJson);
  // Copy buttons
  [jsonInput, csvInput].forEach((el, i) => {
    const btn = document.createElement("button");
    btn.className = "tool-btn";
    btn.textContent = "复制";
    btn.style.marginLeft = "8px";
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(el.value);
      btn.textContent = "已复制";
      setTimeout(() => btn.textContent = "复制", 1200);
    });
    el.parentElement.appendChild(btn);
  });
})();
