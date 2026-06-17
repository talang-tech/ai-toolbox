// JSON Schema Validator - validate JSON data against a JSON Schema locally
(function () {
  'use strict';

  const schemaInput = document.getElementById('jsvSchema');
  const dataInput = document.getElementById('jsvData');
  const validateBtn = document.getElementById('jsvValidate');
  const output = document.getElementById('jsvOutput');
  const copyBtn = document.getElementById('jsvCopy');
  const isEN = document.documentElement.lang === 'en';

  const t = {
    missingSchema: isEN ? 'Please enter a JSON Schema.' : '请先填写 JSON Schema。',
    missingData: isEN ? 'Please enter JSON data to validate.' : '请先填写要校验的 JSON 数据。',
    invalidSchema: isEN ? 'Invalid JSON Schema (not valid JSON): ' : 'JSON Schema 格式无效（不是合法的 JSON）：',
    invalidData: isEN ? 'Invalid JSON (parse error): ' : 'JSON 数据格式无效（解析错误）：',
    valid: isEN ? '✓ JSON data is VALID against the schema!' : '✓ JSON 数据符合 Schema！',
    invalid: (errors) => isEN ? `✗ Validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}):` : `✗ 校验失败（共 ${errors.length} 个错误）：`,
    copied: isEN ? 'Copied to clipboard.' : '已复制到剪贴板。',
    copyFail: isEN ? 'Copy failed.' : '复制失败。',
    path: isEN ? 'Path' : '路径',
    message: isEN ? 'Message' : '信息',
  };

  // Simple JSON Schema validator (Draft-07 subset)
  function validateSchema(schema, data) {
    const errors = [];
    validate(schema, data, '#', errors);
    return errors;
  }

  function validate(schema, data, path, errors) {
    if (schema == null || typeof schema !== 'object') return;

    // type
    if (schema.type !== undefined) {
      const actualType = getType(data);
      if (schema.type !== actualType) {
        errors.push({ path, message: `Expected type "${schema.type}", got "${actualType}"` });
        return;
      }
    }

    // enum
    if (schema.enum !== undefined) {
      if (!schema.enum.some(v => deepEqual(v, data))) {
        errors.push({ path, message: `Value not in enum: ${JSON.stringify(data)}` });
        return;
      }
    }

    // const
    if (schema.const !== undefined) {
      if (!deepEqual(schema.const, data)) {
        errors.push({ path, message: `Expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(data)}` });
        return;
      }
    }

    // allOf / anyOf / oneOf
    if (schema.allOf) {
      schema.allOf.forEach((sub, i) => validate(sub, data, `${path}/allOf[${i}]`, errors));
    }
    if (schema.anyOf) {
      const subErrors = [];
      schema.anyOf.forEach((sub, i) => {
        const e = [];
        validate(sub, data, `${path}/anyOf[${i}]`, e);
        subErrors.push(e);
      });
      if (!subErrors.some(e => e.length === 0)) {
        errors.push({ path, message: `Data does not match any schema in anyOf` });
      }
    }
    if (schema.oneOf) {
      const subErrors = [];
      schema.oneOf.forEach((sub, i) => {
        const e = [];
        validate(sub, data, `${path}/oneOf[${i}]`, e);
        subErrors.push(e);
      });
      const validCount = subErrors.filter(e => e.length === 0).length;
      if (validCount !== 1) {
        errors.push({ path, message: `Data matches ${validCount} schema(s) in oneOf, expected exactly 1` });
      }
    }

    // not
    if (schema.not) {
      const e = [];
      validate(schema.not, data, `${path}/not`, e);
      if (e.length === 0) {
        errors.push({ path, message: `Data matches the "not" schema (should NOT match)` });
      }
    }

    // type-specific validations
    if (getType(data) === 'object') {
      if (data == null || typeof data !== 'object') return;
      if (Array.isArray(data)) return;

      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (data.hasOwnProperty(key)) {
            validate(propSchema, data[key], `${path}.${key}`, errors);
          } else if (propSchema.default !== undefined) {
            // default exists, schema is satisfied
          } else if (isRequired(schema, key)) {
            errors.push({ path, message: `Missing required property "${key}"` });
          }
        }
      }

      if (schema.additionalProperties !== undefined) {
        const allowed = new Set(Object.keys(schema.properties || {}));
        for (const key of Object.keys(data)) {
          if (!allowed.has(key) && schema.additionalProperties !== false) {
            if (typeof schema.additionalProperties === 'object') {
              validate(schema.additionalProperties, data[key], `${path}.${key}`, errors);
            }
          } else if (!allowed.has(key) && schema.additionalProperties === false) {
            errors.push({ path, message: `Additional property "${key}" not allowed` });
          }
        }
      }

      if (schema.required) {
        for (const key of schema.required) {
          if (!data.hasOwnProperty(key)) {
            errors.push({ path, message: `Missing required property "${key}"` });
          }
        }
      }

      // propertyNames
      if (schema.propertyNames && schema.propertyNames.pattern) {
        const re = new RegExp(schema.propertyNames.pattern);
        for (const key of Object.keys(data)) {
          if (!re.test(key)) {
            errors.push({ path, message: `Property name "${key}" does not match pattern "${schema.propertyNames.pattern}"` });
          }
        }
      }

      // dependencies
      if (schema.dependencies) {
        for (const [key, dep] of Object.entries(schema.dependencies)) {
          if (data.hasOwnProperty(key)) {
            if (Array.isArray(dep)) {
              for (const d of dep) {
                if (!data.hasOwnProperty(d)) {
                  errors.push({ path, message: `Property "${key}" depends on "${d}" which is missing` });
                }
              }
            }
          }
        }
      }

      // minProperties / maxProperties
      if (schema.minProperties !== undefined && Object.keys(data).length < schema.minProperties) {
        errors.push({ path, message: `Minimum properties: ${schema.minProperties}, got ${Object.keys(data).length}` });
      }
      if (schema.maxProperties !== undefined && Object.keys(data).length > schema.maxProperties) {
        errors.push({ path, message: `Maximum properties: ${schema.maxProperties}, got ${Object.keys(data).length}` });
      }
    }

    if (getType(data) === 'array') {
      if (!Array.isArray(data)) return;

      // items (tuple + additionalItems)
      if (Array.isArray(schema.items)) {
        // tuple validation
        schema.items.forEach((itemSchema, i) => {
          if (i < data.length) {
            validate(itemSchema, data[i], `${path}[${i}]`, errors);
          }
        });
        // additionalItems
        if (schema.additionalItems !== undefined && schema.additionalItems === false) {
          if (data.length > schema.items.length) {
            errors.push({ path, message: `Too many items: expected ${schema.items.length}, got ${data.length}` });
          }
        } else if (schema.additionalItems && typeof schema.additionalItems === 'object') {
          for (let i = schema.items.length; i < data.length; i++) {
            validate(schema.additionalItems, data[i], `${path}[${i}]`, errors);
          }
        }
      } else if (schema.items) {
        // single schema for all items
        data.forEach((item, i) => {
          validate(schema.items, item, `${path}[${i}]`, errors);
        });
      }

      if (schema.contains !== undefined) {
        const containsErrors = data.map((item, i) => {
          const e = [];
          validate(schema.contains, item, `${path}[${i}]`, e);
          return e;
        });
        if (!containsErrors.some(e => e.length === 0)) {
          errors.push({ path, message: `No item matches the "contains" schema` });
        }
      }

      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push({ path, message: `Minimum items: ${schema.minItems}, got ${data.length}` });
      }
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        errors.push({ path, message: `Maximum items: ${schema.maxItems}, got ${data.length}` });
      }
      if (schema.uniqueItems && hasDuplicates(data)) {
        errors.push({ path, message: `Array items must be unique` });
      }
    }

    if (getType(data) === 'string') {
      if (typeof data !== 'string') return;

      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({ path, message: `Minimum length: ${schema.minLength}, got ${data.length}` });
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({ path, message: `Maximum length: ${schema.maxLength}, got ${data.length}` });
      }
      if (schema.pattern) {
        try {
          const re = new RegExp(schema.pattern);
          if (!re.test(data)) {
            errors.push({ path, message: `String does not match pattern: ${schema.pattern}, value: "${data}"` });
          }
        } catch(e) {
          errors.push({ path, message: `Invalid regex pattern: ${schema.pattern}` });
        }
      }
      if (schema.format) {
        validateFormat(schema.format, data, path, errors);
      }
    }

    if (getType(data) === 'number') {
      if (typeof data !== 'number') return;

      if (schema.minimum !== undefined) {
        if (schema.exclusiveMinimum ? data <= schema.minimum : data < schema.minimum) {
          errors.push({ path, message: `Minimum: ${schema.minimum} (exclusive: ${!!schema.exclusiveMinimum}), got ${data}` });
        }
      }
      if (schema.maximum !== undefined) {
        if (schema.exclusiveMaximum ? data >= schema.maximum : data > schema.maximum) {
          errors.push({ path, message: `Maximum: ${schema.maximum} (exclusive: ${!!schema.exclusiveMaximum}), got ${data}` });
        }
      }
      if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
        errors.push({ path, message: `Must be multiple of ${schema.multipleOf}, got ${data}` });
      }
    }

    if (getType(data) === 'integer') {
      if (typeof data !== 'number' || !Number.isInteger(data)) return;
      // Re-run number validations for integers too
      if (schema.minimum !== undefined) {
        if (schema.exclusiveMinimum ? data <= schema.minimum : data < schema.minimum) {
          errors.push({ path, message: `Minimum: ${schema.minimum} (exclusive: ${!!schema.exclusiveMinimum}), got ${data}` });
        }
      }
      if (schema.maximum !== undefined) {
        if (schema.exclusiveMaximum ? data >= schema.maximum : data > schema.maximum) {
          errors.push({ path, message: `Maximum: ${schema.maximum} (exclusive: ${!!schema.exclusiveMaximum}), got ${data}` });
        }
      }
      if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
        errors.push({ path, message: `Must be multiple of ${schema.multipleOf}, got ${data}` });
      }
    }

    // if/then/else
    if (schema.if) {
      const ifErrors = [];
      validate(schema.if, data, `${path}/if`, ifErrors);
      if (ifErrors.length === 0 && schema.then) {
        validate(schema.then, data, `${path}/then`, errors);
      } else if (ifErrors.length > 0 && schema.else) {
        validate(schema.else, data, `${path}/else`, errors);
      }
    }
  }

  function getType(val) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    if (typeof val === 'number') {
      return Number.isInteger(val) ? 'integer' : 'number';
    }
    return typeof val;
  }

  function isRequired(schema, key) {
    return Array.isArray(schema.required) && schema.required.includes(key);
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      const keysA = Object.keys(a).sort();
      const keysB = Object.keys(b).sort();
      if (JSON.stringify(keysA) !== JSON.stringify(keysB)) return false;
      return keysA.every(k => deepEqual(a[k], b[k]));
    }
    return false;
  }

  function hasDuplicates(arr) {
    const seen = new Set();
    for (const item of arr) {
      const key = typeof item === 'object' ? JSON.stringify(item) : item;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  }

  function validateFormat(format, value, path, errors) {
    switch (format) {
      case 'date-time':
        if (isNaN(Date.parse(value))) errors.push({ path, message: `Invalid date-time format: "${value}"` });
        break;
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) errors.push({ path, message: `Invalid date format (expected YYYY-MM-DD): "${value}"` });
        break;
      case 'time':
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) errors.push({ path, message: `Invalid time format: "${value}"` });
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push({ path, message: `Invalid email format: "${value}"` });
        break;
      case 'uri':
        try { new URL(value); } catch(e) { errors.push({ path, message: `Invalid URI format: "${value}"` }); }
        break;
      case 'ipv4':
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value) || value.split('.').some(s => parseInt(s) > 255))
          errors.push({ path, message: `Invalid IPv4 format: "${value}"` });
        break;
      case 'hostname':
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value))
          errors.push({ path, message: `Invalid hostname format: "${value}"` });
        break;
      case 'uuid':
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
          errors.push({ path, message: `Invalid UUID format: "${value}"` });
        break;
    }
  }

  function validateJson() {
    const schemaText = schemaInput.value.trim();
    const dataText = dataInput.value.trim();

    if (!schemaText) {
      output.textContent = t.missingSchema;
      output.className = 'error-message';
      return;
    }
    if (!dataText) {
      output.textContent = t.missingData;
      output.className = 'error-message';
      return;
    }

    let schema, data;
    try {
      schema = JSON.parse(schemaText);
    } catch (e) {
      output.textContent = t.invalidSchema + e.message;
      output.className = 'error-message';
      return;
    }

    try {
      data = JSON.parse(dataText);
    } catch (e) {
      output.textContent = t.invalidData + e.message;
      output.className = 'error-message';
      return;
    }

    const errors = validateSchema(schema, data);

    if (errors.length === 0) {
      output.textContent = t.valid;
      output.className = 'success-message';
    } else {
      const lines = [t.invalid(errors)];
      errors.forEach(e => {
        lines.push(`  ${t.path}: ${e.path}  |  ${t.message}: ${e.message}`);
      });
      output.textContent = lines.join('\n');
      output.className = 'error-message';
    }
  }

  // Event listeners
  validateBtn.addEventListener('click', validateJson);

  copyBtn.addEventListener('click', function () {
    const text = output.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = t.copied;
      setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    }).catch(() => {
      alert(t.copyFail);
    });
  });

  // Allow keyboard shortcut: Ctrl+Enter / Cmd+Enter to validate
  schemaInput.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      validateJson();
    }
  });
  dataInput.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      validateJson();
    }
  });

})();