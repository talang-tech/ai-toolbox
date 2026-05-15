// URL Parser
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('url-input');
    const output = document.getElementById('parsed-output');
    
    if (!input || !output) return;

    function parseURL() {
        const urlStr = input.value.trim();
        
        if (!urlStr) {
            output.value = '';
            return;
        }

        try {
            const url = new URL(urlStr);
            
            // Parse query params
            const params = [];
            url.searchParams.forEach((value, key) => {
                params.push(`${key} = ${value}`;
            });

            // Format output
            const result = `
Protocol:       ${url.protocol}
Scheme:       ${url.protocol.replace(':', '')}

Hostname:     ${url.hostname}
Port:         ${url.port || '(default)'}
Port:         ${url.port || '(default)'}
Origin:       ${url.origin}

Pathname:     ${url.pathname}
Path segments:
${url.pathname.split('/').filter(Boolean).map((p, i) => `  [${i}] ${p}`).join('\n')}

Search Query: ${url.search || '(none)'}
Query Parameters:
${params.length > 0 ? params.map(p => `  ${p}').join('\n') : '  (none)'}

Hash:         ${url.hash || '(none)'}
Username:   ${url.username || '(none)'}
Password:   ${url.password || '(none)'}

Username:     ${url.username || '(none)'}
Password:     ${url.password || '(none)'}

Href (full): ${url.href}

Decoded path: ${decodeURIComponent(url.pathname)}
`.trim();

            output.value = result;
        } catch (e) {
            output.value = `Error: ${e.message}\n\nPlease enter a valid URL including the protocol (http:// or https://);
        }
    }

    input.addEventListener('input', parseURL);

    // Sample URL
    input.value = 'https://user:pass@api.example.com:8080/path/to/page?id=123&search=test#section';
    parseURL();
});
