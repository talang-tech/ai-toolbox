// Timestamp Converter
document.addEventListener('DOMContentLoaded', () => {
    const timestampInput = document.getElementById('timestamp-input');
    const datetimeInput = document.getElementById('datetime-input');
    const unitSelect = document.getElementById('timestamp-unit');
    const timezoneSelect = document.getElementById('timezone');
    const output = document.getElementById('conversion-output');
    
    if (!timestampInput || !datetimeInput) return;

    function formatDate(date, tz) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        if (tz === 'utc') {
            options.timeZone = 'UTC';
        } else if (tz === 'local') {
            // Use browser timezone
        }

        return date.toLocaleString('en-US', options);
    }

    function convertFromTimestamp() {
        let ts = parseFloat(timestampInput.value);
        if (isNaN(ts)) return;

        const unit = unitSelect?.value || 'ms';
        
        if (unit === 's') ts *= 1000;
        else if (unit === 'us') ts /= 1000;

        const date = new Date(ts);
        if (isNaN(date.getTime())) return;

        const tz = timezoneSelect?.value || 'local';
        datetimeInput.value = formatDate(date, tz);
        updateOutput(date);
    }

    function convertFromDatetime() {
        const date = new Date(datetimeInput.value);
        if (isNaN(date.getTime())) return;

        timestampInput.value = date.getTime();
        updateOutput(date);
    }

    function updateOutput(date) {
        if (!output) return;
        
        const ms = date.getTime();
        output.value = `
Timestamp (ms):  ${ms}
Timestamp (s):   ${Math.floor(ms / 1000)}
Timestamp (μs):  ${ms * 1000}

ISO 8601:        ${date.toISOString()}
UTC:             ${date.toUTCString()}
Local:           ${date.toString()}
Date (UTC):      ${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}
Time (UTC):      ${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')}:${String(date.getUTCSeconds()).padStart(2,'0')}
`.trim();
    }

    timestampInput.addEventListener('input', convertFromTimestamp);
    datetimeInput.addEventListener('input', convertFromDatetime);
    unitSelect?.addEventListener('change', convertFromTimestamp);
    timezoneSelect?.addEventListener('change', convertFromTimestamp);

    // Set current timestamp
    const now = Date.now();
    timestampInput.value = now;
    convertFromTimestamp();

    // Current time display
    setInterval(() => {
        document.getElementById('current-timestamp') && 
            (document.getElementById('current-timestamp').textContent = Date.now());
    }, 100);
});
