// JSON to Go Struct Converter
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('json-input');
    const output = document.getElementById('go-output');
    const structName = document.getElementById('struct-name');
    const useOmitEmpty = document.getElementById('omit-empty');
    const inline = document.getElementById('inline');
    
    if (!input || !output) return;

    function convert() {
        try {
            const json = JSON.parse(input.value || '{}');
            const name = structName?.value || 'Root';
            const omitEmpty = useOmitEmpty?.checked;
            
            const result = jsonToGo(json, name, omitEmpty);
            output.value = result;
        } catch (e) {
            output.value = `// Error: ${e.message}`;
        }
    }

    function toPascalCase(str) {
        return str.split(/[-_]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }

    function getGoType(value, name, structs, omitEmpty) {
        if (value === null) return 'interface{}';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'float64';
        if (typeof value === 'boolean') return 'bool';
        if (Array.isArray(value)) {
            if (value.length === 0) return '[]interface{}';
            const types = [...new Set(value.map(v => getGoType(v, name, structs, omitEmpty)))];
            const arrType = types.length === 1 ? types[0] : 'interface{}';
            return `[]${arrType}`;
        }
        if (typeof value === 'object') {
            const structName = toPascalCase(name);
            if (!structs.find(s => s.name === structName)) {
                structs.push({
                    name: structName,
                    fields: Object.entries(value).map(([key, val]) => ({
                        goName: toPascalCase(key),
                        jsonName: key,
                        type: getGoType(val, key, structs, omitEmpty),
                        omitEmpty: omitEmpty && val !== null
                    }))
                });
            }
            return structName;
        }
        return 'interface{}';
    }

    function jsonToGo(obj, rootName, omitEmpty) {
        const structs = [];
        getGoType(obj, rootName, structs, omitEmpty);
        
        return structs.map(s => {
            const fields = s.fields.map(f => {
                const tag = omitEmpty 
                    ? `\`json:"${f.jsonName},omitempty"\`` 
                    : `\`json:"${f.jsonName}"\``;
                return `    ${f.goName} ${f.type} ${tag}`;
            }).join('\n');
            
            return `type ${s.name} struct {\n${fields}\n}`;
        }).join('\n\n');
    }

    input.addEventListener('input', convert);
    structName?.addEventListener('input', convert);
    useOmitEmpty?.addEventListener('change', convert);

    // Sample data
    input.value = JSON.stringify({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        is_active: true,
        tags: ["developer", "admin"],
        profile: {
            avatar_url: "https://example.com/avatar.jpg",
            bio: "Hello World"
        }
    }, null, 2);
    
    convert();
});
