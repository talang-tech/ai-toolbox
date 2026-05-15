// JSON to TypeScript Converter
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('json-input');
    const output = document.getElementById('ts-output');
    const interfaceName = document.getElementById('interface-name');
    const useCamelCase = document.getElementById('use-camelcase');
    const useTypeAlias = document.getElementById('use-type-alias');
    
    if (!input || !output) return;

    function convert() {
        try {
            const json = JSON.parse(input.value || '{}');
            const name = interfaceName?.value || 'Root';
            const camelCase = useCamelCase?.checked;
            const typeAlias = useTypeAlias?.checked;
            
            const result = jsonToTS(json, name, camelCase, typeAlias);
            output.value = result;
        } catch (e) {
            output.value = `// Error: ${e.message}`;
        }
    }

    function toCamelCase(str) {
        return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase())
                  .replace(/^(.)/, (_, c) => c.toLowerCase());
    }

    function toPascalCase(str) {
        const camel = toCamelCase(str);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    }

    function getType(value, name, interfaces, camelCase) {
        if (value === null) return 'null';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            const types = [...new Set(value.map(v => getType(v, name, interfaces, camelCase)))];
            const arrType = types.length === 1 ? types[0] : 'any';
            return `${arrType}[]`;
        }
        if (typeof value === 'object') {
            const interfaceName = toPascalCase(camelCase ? toCamelCase(name) : name);
            if (!interfaces.find(i => i.name === interfaceName)) {
                interfaces.push({
                    name: interfaceName,
                    fields: Object.entries(value).map(([key, val]) => ({
                        name: camelCase ? toCamelCase(key) : key,
                        type: getType(val, key, interfaces, camelCase),
                        optional: val === null
                    }))
                });
            }
            return interfaceName;
        }
        return 'any';
    }

    function jsonToTS(obj, rootName, camelCase, typeAlias) {
        const interfaces = [];
        const rootType = getType(obj, rootName, interfaces, camelCase);
        
        if (typeAlias) {
            return interfaces.map(i => 
                `export type ${i.name} = {\n${i.fields.map(f => 
                    `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`
                ).join('\n')}\n};`
            ).join('\n\n');
        } else {
            return interfaces.map(i => 
                `export interface ${i.name} {\n${i.fields.map(f => 
                    `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`
                ).join('\n')}\n}`
            ).join('\n\n');
        }
    }

    input.addEventListener('input', convert);
    interfaceName?.addEventListener('input', convert);
    useCamelCase?.addEventListener('change', convert);
    useTypeAlias?.addEventListener('change', convert);

    // Sample data
    input.value = JSON.stringify({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        tags: ["developer", "admin"],
        profile: {
            avatar: "https://example.com/avatar.jpg",
            bio: "Hello World"
        }
    }, null, 2);
    
    convert();
});
