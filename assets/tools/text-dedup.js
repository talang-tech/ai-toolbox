// Text Deduplicator
(() => {
  const input = document.getElementById("dedupInput");
  const output = document.getElementById("dedupOutput");
  const ignoreCase = document.getElementById("dedupCase");
  const ignoreEmpty = document.getElementById("dedupEmpty");
  const trimLines = document.getElementById("dedupTrim");
  const stats = document.getElementById("dedupStats");

  function dedup() {
    let lines = input.value.split("\n");
    const original = lines.length;
    const seen = new Set();
    const out = [];
    for (let line of lines) {
      if (trimLines.checked) line = line.trim();
      if (ignoreEmpty.checked && !line.trim()) continue;
      const key = ignoreCase.checked ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(line);
      }
    }
    output.value = out.join("\n");
    const removed = original - out.length;
    const pct = original > 0 ? Math.round((removed / original) * 100) : 0;
    stats.innerHTML = `原 <strong>${original}</strong> 行 → 去重后 <strong>${out.length}</strong> 行 → 移除 <strong>${removed}</strong> 行 (${pct}%)`;
  }

  input.addEventListener("input", dedup);
  [ignoreCase, ignoreEmpty, trimLines].forEach(el => el.addEventListener("change", dedup));
  document.getElementById("dedupCopy").addEventListener("click", () => {
    navigator.clipboard.writeText(output.value);
    const btn = document.getElementById("dedupCopy");
    btn.textContent = "已复制";
    setTimeout(() => btn.textContent = "复制结果", 1200);
  });

  // Init
  input.value = "apple\napple\nbanana\nBanana\ncherry\n\n\n";
  dedup();
})();
