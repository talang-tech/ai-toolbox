// Timestamp Converter
(() => {
  const nowBtn = document.getElementById("tsNow");
  const tsInput = document.getElementById("tsInput");
  const tsHuman = document.getElementById("tsHuman");
  const tsIso = document.getElementById("tsIso");
  const tsUnix = document.getElementById("tsUnix");
  const tsMs = document.getElementById("tsMs");

  function tsNow() {
    return Math.floor(Date.now() / 1000);
  }

  function updateFromTs(value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) { tsHuman.value = ""; tsIso.value = ""; tsUnix.value = ""; tsMs.value = ""; return; }
    // Detect if in seconds or ms (year 2000 = 946684800, year 2100 = 3250368000000)
    const isMs = num > 9999999999;
    const sec = isMs ? Math.floor(num / 1000) : num;
    const ms = isMs ? num : num * 1000;
    const d = new Date(ms);
    tsHuman.value = d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) + " (北京时间) / " + d.toUTCString();
    tsIso.value = d.toISOString();
    tsUnix.value = sec;
    tsMs.value = ms;
  }

  function updateFromDate(value) {
    if (!value) { tsInput.value = ""; tsIso.value = ""; tsUnix.value = ""; tsMs.value = ""; return; }
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    const sec = Math.floor(d.getTime() / 1000);
    tsInput.value = sec;
    tsIso.value = d.toISOString();
    tsUnix.value = sec;
    tsMs.value = d.getTime();
    tsHuman.value = d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) + " (北京时间) / " + d.toUTCString();
  }

  nowBtn.addEventListener("click", () => {
    const t = tsNow();
    tsInput.value = t;
    updateFromTs(t);
  });

  tsInput.addEventListener("input", (e) => updateFromTs(e.target.value));
  document.getElementById("tsDate").addEventListener("input", (e) => updateFromDate(e.target.value));

  // Copy buttons
  [tsUnix, tsMs, tsIso, tsHuman].forEach((el, i) => {
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

  // Init with current time
  const t = tsNow();
  tsInput.value = t;
  updateFromTs(t);
})();
