// HTML to Markdown Converter
(() => {
  const input = document.getElementById("htmInput");
  const output = document.getElementById("htmOutput");
  const preview = document.getElementById("htmPreview");
  const convertBtn = document.getElementById("htmConvert");
  const copyBtn = document.getElementById("htmCopy");
  const downloadBtn = document.getElementById("htmDownload");
  const clearBtn = document.getElementById("htmClear");
  const status = document.getElementById("htmStatus");
  const escapeMode = document.getElementById("htmEscapeMode");

  // Simple HTML to Markdown converter
  function htmlToMarkdown(html) {
    if (!html || !html.trim()) return "";

    let md = html;

    // Normalize line endings
    md = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // --- Block-level conversions (order matters) ---

    // Headings: h1-h6
    md = md.replace(/<h([1-6])(?:\s[^>]*)?>(.*?)<\/h\1>/gi, (_, level, content) => {
      const prefix = "#".repeat(parseInt(level));
      return `\n\n${prefix} ${inlineToMarkdown(content)}\n\n`;
    });

    // Horizontal rules
    md = md.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");

    // Code blocks (pre > code)
    md = md.replace(/<pre><code(?:\s+class="[^"]*language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi, (_, lang, code) => {
      const langAttr = lang ? lang : "";
      return `\n\n\`\`\`${langAttr}\n${decodeEntities(code)}\n\`\`\`\n\n`;
    });

    // Code blocks (pre only, wrap content in triple backticks)
    md = md.replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, code) => {
      return `\n\n\`\`\`\n${decodeEntities(inlineToMarkdown(code))}\n\`\`\`\n\n`;
    });

    // Blockquotes
    md = md.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
      const inner = htmlToMarkdown(content).trim();
      const lines = inner.split("\n").map(l => l.trim() ? `> ${l}` : ">");
      return `\n\n${lines.join("\n")}\n\n`;
    });

    // Ordered lists
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (!items) return "";
      const result = items.map((item, i) => {
        const inner = item.replace(/<\/?li[^>]*>/gi, "").trim();
        return `${i + 1}. ${inlineToMarkdown(inner)}`;
      }).join("\n");
      return `\n\n${result}\n\n`;
    });

    // Unordered lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (!items) return "";
      const result = items.map(item => {
        const inner = item.replace(/<\/?li[^>]*>/gi, "").trim();
        return `- ${inlineToMarkdown(inner)}`;
      }).join("\n");
      return `\n\n${result}\n\n`;
    });

    // Paragraphs
    md = md.replace(/<p(?:\s[^>]*)?>(.*?)<\/p>/gi, (_, content) => {
      return `\n\n${inlineToMarkdown(content)}\n\n`;
    });

    // Tables
    md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, content) => {
      const rows = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (!rows || rows.length === 0) return "";

      const tableData = rows.map(row => {
        const cells = [];
        // Parse th/td
        const thMatch = row.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
        const tdMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        const allCells = thMatch || tdMatch || [];
        allCells.forEach(cell => {
          const inner = cell.replace(/<\/?(th|td)[^>]*>/gi, "").trim();
          cells.push(inlineToMarkdown(inner).replace(/\|/g, "\\|"));
        });
        return cells;
      });

      const headerRow = tableData[0] || [];
      const bodyRows = tableData.slice(1);

      // Build Markdown table
      const header = `| ${headerRow.join(" | ")} |`;
      const separator = `| ${headerRow.map(() => "---").join(" | ")} |`;
      const body = bodyRows.map(row => `| ${row.join(" | ")} |`).join("\n");

      return `\n\n${header}\n${separator}\n${body}\n\n`;
    });

    // Divs and other block containers
    md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, content) => {
      return `\n\n${htmlToMarkdown(content)}\n\n`;
    });

    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, "\n");

    // --- Inline conversions ---
    function inlineToMarkdown(text) {
      if (!text) return "";

      let t = text;

      // Images: must be before links
      t = t.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, (_, src, alt) => {
        return `![${alt}](${src})`;
      });
      t = t.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, (_, src) => {
        return `![](${src})`;
      });

      // Links
      t = t.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (_, href, text) => {
        const inner = inlineToMarkdown(text);
        return `[${inner}](${href})`;
      });

      // Bold
      t = t.replace(/<(strong|b)(?:\s[^>]*)?>(.*?)<\/(strong|b)>/gi, (_, __, content) => {
        return `**${inlineToMarkdown(content)}**`;
      });

      // Italic
      t = t.replace(/<(em|i)(?:\s[^>]*)?>(.*?)<\/(em|i)>/gi, (_, __, content) => {
        return `*${inlineToMarkdown(content)}*`;
      });

      // Strikethrough
      t = t.replace(/<(del|s|strike)(?:\s[^>]*)?>(.*?)<\/(del|s|strike)>/gi, (_, __, content) => {
        return `~~${inlineToMarkdown(content)}~~`;
      });

      // Inline code
      t = t.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, content) => {
        return `\`${content}\``;
      });

      // Script/style removal
      t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      t = t.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

      // Strip remaining HTML tags
      t = t.replace(/<[^>]*>/g, "");

      // Decode HTML entities
      t = decodeEntities(t);

      return t;
    }

    function decodeEntities(text) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    }

    // Process inline in the main text
    md = inlineToMarkdown(md);

    // Collapse excessive whitespace (3+ newlines -> 2)
    md = md.replace(/\n{3,}/g, "\n\n");

    return md.trim();
  }

  function convert() {
    const html = input.value;
    if (!html.trim()) {
      output.value = "";
      preview.innerHTML = "";
      status.textContent = "请先输入 HTML 内容";
      return;
    }

    try {
      const md = htmlToMarkdown(html);
      output.value = md;

      // Preview
      updatePreview(md);

      const lines = md.split("\n").length;
      const chars = md.length;
      status.textContent = `✓ 已转换：${lines} 行，${chars} 字符`;
    } catch (e) {
      output.value = "";
      preview.innerHTML = "";
      status.textContent = "✗ 转换出错：" + e.message;
    }
  }

  function updatePreview(md) {
    // Simple preview using marked-like rendering via innerHTML
    // We'll do a basic Markdown -> HTML render for preview
    let html = md;

    // Escape HTML for safety
    if (escapeMode && escapeMode.checked) {
      html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
    // Headings
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    // Horizontal rule
    html = html.replace(/^---$/gm, "<hr>");
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Images
    html = html.replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');
    // Unordered list
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
    // Ordered list
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(?:(?:<ul>)?<li>.*<\/li>\n?)+(?:<\/ul>)?/g, (match) => {
      if (match.includes("<ul>")) return match;
      return "<ol>" + match.replace(/^<li>/gm, "<li>") + "</ol>";
    });
    // Blockquotes
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
    // Paragraphs
    html = html.replace(/\n\n([^<\n].+)/g, "\n\n<p>$1</p>");
    // Line breaks
    html = html.replace(/\n/g, "<br>");

    preview.innerHTML = html;
  }

  // Event listeners
  convertBtn.addEventListener("click", convert);
  
  copyBtn.addEventListener("click", () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = "✓ 已复制";
      setTimeout(() => copyBtn.textContent = "📋 复制 Markdown", 1200);
    });
  });

  downloadBtn.addEventListener("click", () => {
    if (!output.value) return;
    const blob = new Blob([output.value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.md";
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    preview.innerHTML = "";
    status.textContent = "";
  });

  // Ctrl+Enter shortcut
  input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      convert();
    }
  });

  // Init with sample
  input.value = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<p>Visit <a href="https://example.com">Example</a> for more.</p>`;
  convert();
})();