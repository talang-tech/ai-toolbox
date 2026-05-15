// Regex Tester
document.addEventListener('DOMContentLoaded', () => {
    const patternInput = document.getElementById('pattern-input');
    const flagsInput = document.getElementById('flags-input');
    const testInput = document.getElementById('test-input');
    const matchOutput = document.getElementById('match-output');
    const groupsOutput = document.getElementById('groups-output');
    
    if (!patternInput || !testInput) return;

    function testRegex() {
        const pattern = patternInput.value;
        const flags = flagsInput?.value || 'g';
        const text = testInput.value;

        if (!pattern || !text) {
            matchOutput.value = '';
            groupsOutput.value = '';
            return;
        }

        try {
            const regex = new RegExp(pattern, flags);
            const matches = [];
            const groups = [];
            let match;
            let count = 0;

            if (flags.includes('g')) {
                while ((match = regex.exec(text)) !== null && count < 100) {
                    matches.push(match[0]);
                    if (match.length > 1) {
                        groups.push(`Match ${count + 1} groups:\n${match.slice(1).map((g, i) => `  $${i+1}: ${g || '(empty)'}`).join('\n')}`);
                    }
                    count++;
                }
            } else {
                match = regex.exec(text);
                if (match) {
                    matches.push(match[0]);
                    if (match.length > 1) {
                        groups.push(`Groups:\n${match.slice(1).map((g, i) => `  $${i+1}: ${g || '(empty)'}`).join('\n')}`);
                    }
                }
            }

            matchOutput.value = matches.length > 0 
                ? `Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:\n\n` + matches.map((m, i) => `[${i+1}] ${m}`).join('\n')
                : 'No matches found';
            groupsOutput.value = groups.length > 0 ? groups.join('\n\n') : 'No capture groups';

            // Highlight matches in test input (visual feedback)
            highlightMatches(text, regex);
        } catch (e) {
            matchOutput.value = `Error: ${e.message}`;
            groupsOutput.value = '';
        }
    }

    function highlightMatches(text, regex) {
        // Simple highlight logic - for demo
        const highlighted = text.replace(regex, (m) => `[[${m}]]`);
        // Could update a preview element here
    }

    patternInput.addEventListener('input', testRegex);
    flagsInput?.addEventListener('input', testRegex);
    testInput.addEventListener('input', testRegex);

    // Sample data
    patternInput.value = '\\b\\w+@\\w+\\.\\w+\\b';
    flagsInput.value = 'g';
    testInput.value = 'Contact us at support@example.com or sales@company.org. For urgent matters, email admin@test.net';
    
    testRegex();
});
