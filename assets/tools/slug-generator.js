// URL Slug Generator
(() => {
  const input = document.getElementById("slugInput");
  const output = document.getElementById("slugOutput");
  const copyBtn = document.getElementById("slugCopy");
  const lower = document.getElementById("slugLower");
  const separator = document.getElementById("slugSeparator");
  const maxLen = document.getElementById("slugMaxLen");
  const previewLink = document.getElementById("slugPreviewLink");

  function generateSlug() {
    let text = input.value;
    if (!text) {
      output.value = "";
      previewLink.textContent = "";
      return;
    }

    // Normalize unicode
    text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    // Replace non-alphanumeric with separator
    const sep = separator.value || "-";
    let slug = text
      .replace(/[^a-zA-Z0-9\s_-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, sep)
      .replace(new RegExp(`^${escapeRegex(sep)}+|${escapeRegex(sep)}+$`, "g"), "");

    if (lower.checked) {
      slug = slug.toLowerCase();
    }

    // Max length - break at word boundary
    const max = parseInt(maxLen.value) || 80;
    if (slug.length > max) {
      const truncated = slug.slice(0, max);
      const lastSep = truncated.lastIndexOf(sep);
      if (lastSep > max * 0.7) {
        slug = truncated.slice(0, lastSep);
      } else {
        slug = truncated;
      }
    }

    output.value = slug;
    previewLink.textContent = `https://example.com/${slug}`;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Debounced input
  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateSlug, 100);
  });

  lower.addEventListener("change", generateSlug);
  separator.addEventListener("input", generateSlug);
  maxLen.addEventListener("input", generateSlug);

  copyBtn.addEventListener("click", () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = "✓ 已复制";
      setTimeout(() => copyBtn.textContent = "📋 复制 Slug", 1200);
    });
  });

  // Init with demo
  input.value = "AI Toolbox Free Online Developer Utilities";
  generateSlug();
})();