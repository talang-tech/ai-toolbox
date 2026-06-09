// JSON ↔ YAML Converter
document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const yamlInput = document.getElementById('yaml-input');
    const convertBtn = document.getElementById('convert-btn');
    const direction = document.getElementById('direction');
    
    if (!jsonInput || !yamlInput) return;

    // Simple YAML parser/generator (basic implementation)
    function jsonToYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let result = '';

        if (obj === null) return 'null';
        if (typeof obj === 'boolean') return obj ? 'true' : 'false';
        if (typeof obj === 'number') return obj.toString();
        if (typeof obj === 'string') {
            if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || 
                obj.startsWith('&') || obj.startsWith('*') || obj.startsWith('!') ||
                obj.includes('|') || obj.includes('>')) {
                return `"${obj.replace(/"/g, '\\"')}"`;
            }
            return obj;
        }
        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            return '\n' + obj.map(item => 
                `${spaces}- ${jsonToYaml(item, indent + 1).trimStart()}`
            ).join('\n');
        }
        if (typeof obj === 'object') {
            const entries = Object.entries(obj);
            if (entries.length === 0) return '{}';
            return '\n' + entries.map(([key, value]) => 
                `${spaces}${key}: ${jsonToYaml(value, indent + 1).trimStart()}`
            ).join('\n');
        }
        return '';
    }

    function yamlToJson(yamlStr) {
        // Very simplified YAML to JSON converter
        // This handles basic cases - full YAML spec is complex
        try {
            return JSON.parse(yamlStr);
        } catch {
            // Try simple parsing
            const lines = yamlStr.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
            const result = {};
            
            lines.forEach(line => {
                const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
                if (match) {
                    const [_, indent, key, value] = match;
                    const k = key.trim();
                    let v = value.trim();
                    
                    if (v === 'true') v = true;
                    else if (v === 'false') v = false;
                    else if (v === 'null' || v === '') v = null;
                    else if (!isNaN(v) && v !== '') v = parseFloat(v);
                    else if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
                    else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
                    
                    result[k] = v;
                }
            });
            
            return result;
        }
    }

    function convert() {
        const dir = direction?.value || 'json-to-yaml';
        
        if (dir === 'json-to-yaml') {
            try {
                const json = JSON.parse(jsonInput.value || '{}');
                yamlInput.value = jsonToYaml(json);
            } catch (e) {
                yamlInput.value = `# Error: ${e.message}`;
            }
        } else {
            try {
                // For proper YAML support, would use js-yaml library
                // This is simplified version
                const json = yamlToJson(yamlInput.value);
                jsonInput.value = JSON.stringify(json, null, 2);
            } catch (e) {
                jsonInput.value = `// Error: ${e.message}`;
            }
        }
    }

    convertBtn?.addEventListener('click', convert);
    direction?.addEventListener('change', convert);
    
    // Sample data
    jsonInput.value = JSON.stringify({
        name: "John Doe",
        age: 30,
        isActive: true,
        tags: ["developer", "admin"],
        contact: {
            email: "john@example.com",
            phone: "+1234567890"
        }
    }, null, 2);
    
    convert();
});
