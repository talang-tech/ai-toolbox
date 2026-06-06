// JWT Decoder
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const input = document.getElementById('jwt-input');
    const headerOutput = document.getElementById('header-output');
    const payloadOutput = document.getElementById('payload-output');
    const tokenInfo = document.getElementById('token-info');
    
    if (!input || !headerOutput || !payloadOutput) return;

    function decodeBase64Url(str) {
        // Replace URL-safe characters
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with = to make length divisible by 4
        while (str.length % 4) str += '=';
        // Decode
        const decoded = atob(str);
        return decodeURIComponent(escape(decoded));
    }

    function decodeJWT() {
        const token = input.value.trim();
        
        if (!token) {
            headerOutput.value = '';
            payloadOutput.value = '';
            tokenInfo.textContent = 'Enter a JWT token above';
            return;
        }

        const parts = token.split('.');
        
        if (parts.length !== 3) {
            headerOutput.value = '';
            payloadOutput.value = '';
            tokenInfo.textContent = 'Error: Invalid JWT format (expected 3 dot-separated parts)';
            tokenInfo.className = 'text-red-500';
            return;
        }

        try {
            const headerJson = decodeBase64Url(parts[0]);
            const payloadJson = decodeBase64Url(parts[1]);
            
            const header = JSON.parse(headerJson);
            const payload = JSON.parse(payloadJson);

            headerOutput.value = JSON.stringify(header, null, 2);
            payloadOutput.value = JSON.stringify(payload, null, 2);

            // Token info
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const iat = payload.iat;
            
            let info = '';
            info += `Algorithm: ${header.alg || 'Unknown'}\n`;
            info += `Type: ${header.typ || 'Unknown'}\n`;
            if (iat) info += `Issued At: ${new Date(iat * 1000).toLocaleString()}\n`;
            
            if (exp) {
                const expDate = new Date(exp * 1000);
                const expired = now > exp;
                info += `Expires: ${expDate.toLocaleString()} (${expired ? 'EXPIRED' : 'Valid'})`;
                tokenInfo.className = expired ? 'text-red-500' : 'text-green-500';
            } else {
                tokenInfo.className = 'text-gray-500';
            }
            
            tokenInfo.textContent = info;
        } catch (e) {
            headerOutput.value = '';
            payloadOutput.value = '';
            tokenInfo.textContent = `Error: ${e.message}`;
            tokenInfo.className = 'text-red-500';
        }
    }

    input.addEventListener('input', decodeJWT);

    // Sample JWT (valid format, but signature not valid for production)
    const sampleHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const samplePayload = btoa(JSON.stringify({ 
        sub: "1234567890",
        name: "John Doe",
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) + 7200
    }));
    input.value = `${sampleHeader}.${samplePayload}.sample-signature`;
    
    decodeJWT();
});
