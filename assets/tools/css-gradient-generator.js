// CSS Gradient Generator
(() => {
  const color1 = document.getElementById("gradColor1");
  const color2 = document.getElementById("gradColor2");
  const color1Text = document.getElementById("gradColor1Text");
  const color2Text = document.getElementById("gradColor2Text");
  const angle = document.getElementById("gradAngle");
  const angleVal = document.getElementById("gradAngleVal");
  const typeRadial = document.getElementById("gradTypeRadial");
  const typeLinear = document.getElementById("gradTypeLinear");
  const preview = document.getElementById("gradPreview");
  const cssOutput = document.getElementById("gradCssOutput");
  const copyBtn = document.getElementById("gradCopy");
  const copyCssBtn = document.getElementById("gradCopyCss");
  const presetBtns = document.querySelectorAll(".grad-preset");

  function generateGradient() {
    const c1 = color1.value;
    const c2 = color2.value;
    const a = parseInt(angle.value);
    const isLinear = typeLinear.checked;
    
    let css = "";
    if (isLinear) {
      css = `background: linear-gradient(${a}deg, ${c1}, ${c2});`;
    } else {
      css = `background: radial-gradient(circle, ${c1}, ${c2});`;
    }
    
    preview.style.background = isLinear
      ? `linear-gradient(${a}deg, ${c1}, ${c2})`
      : `radial-gradient(circle, ${c1}, ${c2})`;
    
    cssOutput.value = `.gradient-element {\n  ${css}\n}`;
  }

  function updateFromPreset(btn) {
    color1.value = btn.dataset.c1 || "#6366f1";
    color2.value = btn.dataset.c2 || "#ec4899";
    color1Text.value = color1.value;
    color2Text.value = color2.value;
    if (btn.dataset.angle) {
      angle.value = btn.dataset.angle;
      angleVal.textContent = `${angle.value}°`;
    }
    if (btn.dataset.type === "radial") {
      typeRadial.checked = true;
    } else {
      typeLinear.checked = true;
    }
    generateGradient();
  }

  // Color inputs sync with text
  function syncColorInput(el, target, other) {
    el.addEventListener("input", () => {
      target.value = el.value;
      if (other) generateGradient();
    });
  }
  function syncColorText(el, target) {
    el.addEventListener("input", () => {
      const val = el.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
        target.value = val;
        generateGradient();
      }
    });
  }

  syncColorInput(color1, color1Text);
  syncColorInput(color2, color2Text);
  syncColorText(color1Text, color1);
  syncColorText(color2Text, color2);

  angle.addEventListener("input", () => {
    angleVal.textContent = `${angle.value}°`;
    generateGradient();
  });

  typeLinear.addEventListener("change", generateGradient);
  typeRadial.addEventListener("change", generateGradient);

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => updateFromPreset(btn));
  });

  // Copy color
  copyBtn.addEventListener("click", () => {
    const text = `${color1.value}`;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "已复制";
      setTimeout(() => copyBtn.textContent = "复制 #1", 1200);
    });
  });

  // Copy CSS
  copyCssBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(cssOutput.value).then(() => {
      copyCssBtn.textContent = "✓ 已复制 CSS";
      setTimeout(() => copyCssBtn.textContent = "📋 复制 CSS", 1200);
    });
  });

  // Init with first preset
  updateFromPreset(presetBtns[0]);
})();