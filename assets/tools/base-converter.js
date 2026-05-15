// Base Converter
(() => {
  const inputs = {
    bin: document.getElementById("binInput"),
    oct: document.getElementById("octInput"),
    dec: document.getElementById("decInput"),
    hex: document.getElementById("hexInput"),
  };

  const bases = { bin: 2, oct: 8, dec: 10, hex: 16 };

  function sync(from, value) {
    if (!value.trim()) {
      Object.keys(inputs).forEach(k => inputs[k].value = "");
      return;
    }
    try {
      const num = BigInt(parseInt(value, bases[from]));
      if (num.toString() === "NaN") throw new Error("NaN");
      Object.keys(inputs).forEach(k => {
        if (k !== from) {
          inputs[k].value = num.toString(bases[k]);
        }
      });
    } catch (e) {
      // Invalid input, show error visually?
    }
  }

  Object.keys(inputs).forEach(k => {
    inputs[k].addEventListener("input", (e) => sync(k, e.target.value));
  });

  // Copy buttons
  Object.values(inputs).forEach((el, i) => {
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
