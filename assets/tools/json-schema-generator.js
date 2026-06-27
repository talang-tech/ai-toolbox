// JSON Schema Generator
(() => {
  const input = document.getElementById("jsgInput");
  const output = document.getElementById("jsgOutput");
  const generateBtn = document.getElementById("jsgGenerate");
  const copyBtn = document.getElementById("jsgCopy");
  const clearBtn = document.getElementById("jsgClear");
  const status = document.getElementById("jsgStatus");
  const inferType = document.getElementById("jsgInferType");
  const requiredOpt = document.getElementById("jsgRequired");
  const descOpt = document.getElementById("jsgDescriptions");

  function inferType(value) {
    if (value === null || value === undefined) return ["null", "null"];
    if (Array.isArray(value)) return ["array", "array"];
    const t = typeof value;
    if (t === "number") {
      if (Number.isInteger(value)) return ["integer", "integer"];
      return ["number", "number"];
    }
    if (t === "string") {
      // Check for common formats
      if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/.test(value)) return ["string", "string", "date-time"];
      if (/^https?:\/\/.+/.test(value)) return ["string", "string", "uri"];
      if (/^.+@.+\..+$/.test(value)) return ["string", "string", "email"];
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return ["string", "string", "uuid"];
      return ["string", "string"];
    }
    return [t, t];
  }

  function sampleValue(type, depth) {
    if (depth > 5) return "";
    switch (type) {
      case "string": return "example";
      case "integer": return 0;
      case "number": return 0.0;
      case "boolean": return true;
      case "object": return {};
      case "array": return [];
      default: return null;
    }
  }

  function generateSchema(data, depth) {
    if (depth === undefined) depth = 0;
    if (depth > 10) return {};

    const schema = {};

    // Type inference
    if (inferType && inferType.checked) {
      if (data === null) {
        schema.type = "null";
        return schema;
      }

      if (Array.isArray(data)) {
        schema.type = "array";
        if (data.length > 0) {
          // Collect item schemas
          const itemSchemas = data.map(item => generateSchema(item, depth + 1));
          // Merge if all items share the same type
          const firstType = itemSchemas[0] ? itemSchemas[0].type : undefined;
          const allSameType = firstType && itemSchemas.every(s => s.type === firstType);
          if (allSameType && firstType !== "object") {
            schema.items = itemSchemas[0];
          } else if (data.length > 0) {
            // Use first item as reference
            schema.items = generateSchema(data[0], depth + 1);
          }
        } else {
          schema.items = {};
        }
        if (descOpt && descOpt.checked) {
          schema.description = "Array of items";
        }
        return schema;
      }

      const type = typeof data;
      if (type === "object") {
        schema.type = "object";
        
        if (requiredOpt && requiredOpt.checked) {
          schema.required = Object.keys(data).filter(key => data[key] !== null && data[key] !== undefined);
          if (schema.required.length === 0) delete schema.required;
        }

        if (Object.keys(data).length > 0) {
          schema.properties = {};
          for (const [key, value] of Object.entries(data)) {
            const propSchema = generateSchema(value, depth + 1);
            
            if (descOpt && descOpt.checked && typeof value === "string" && value.length > 0 && value.length < 80) {
              // If value looks like a description string, use it
              const cleaned = value.replace(/[{}[\]]/g, "").trim();
              if (cleaned.length > 3 && cleaned.length < 60 && !/^[\d\s.,;:!?]+$/.test(cleaned)) {
                propSchema.description = cleaned;
              }
            }
            
            schema.properties[key] = propSchema;
          }
        }

        // Additional properties
        schema.additionalProperties = false;

        if (descOpt && descOpt.checked) {
          schema.description = "Object containing properties";
        }
        
        return schema;
      }

      // Primitive types
      if (type === "number") {
        schema.type = Number.isInteger(data) ? "integer" : "number";
        return schema;
      }

      schema.type = type;
      return schema;
    }

    // Simple mode: just use typeof
    schema.type = typeof data;
    if (Array.isArray(data)) schema.type = "array";
    if (data === null) schema.type = "null";
    
    return schema;
  }

  function formatSchema(schema, indent) {
    return JSON.stringify(schema, null, 2);
  }

  function generate() {
    const raw = input.value.trim();
    if (!raw) {
      output.value = "";
      status.textContent = "请先输入 JSON 数据";
      return;
    }

    try {
      const data = JSON.parse(raw);
      const schema = generateSchema(data, 0);
      const schemaStr = formatSchema(schema);
      output.value = schemaStr;

      const schemaSize = schemaStr.length;
      const props = schema.properties ? Object.keys(schema.properties).length : 0;
      status.textContent = `✓ 已生成 Schema（${schemaSize} 字符）`;
      if (props > 0) {
        status.textContent += `，检测到 ${props} 个属性`;
      }
    } catch (e) {
      output.value = "";
      status.textContent = "✗ JSON 解析失败：" + e.message;
    }
  }

  // Event listeners
  generateBtn.addEventListener("click", generate);

  copyBtn.addEventListener("click", () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = "✓ 已复制";
      setTimeout(() => copyBtn.textContent = "📋 复制 Schema", 1200);
    });
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    status.textContent = "";
  });

  // Re-generate on option change
  inferType.addEventListener("change", generate);
  requiredOpt.addEventListener("change", generate);
  descOpt.addEventListener("change", generate);

  // Ctrl+Enter shortcut
  input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });

  // Init with sample
  input.value = JSON.stringify({
    "name": "Alice Wang",
    "email": "alice@example.com",
    "age": 30,
    "role": "Developer",
    "active": true,
    "tags": ["frontend", "backend", "devops"],
    "address": {
      "city": "Shanghai",
      "zip": "200000",
      "country": "China",
      "isActive": true
    },
    "projects": [
      {
        "id": 1,
        "title": "AI Toolbox",
        "url": "https://tools.talang.fun"
      }
    ]
  }, null, 2);
  generate();
})();