
async function diagnostic() {
    const targets = [
        'http://127.0.0.1:11434/api/tags',
        'http://localhost:11434/api/tags',
        'http://[::1]:11434/api/tags'
    ];

    console.log('--- Diagnostic Start ---');
    for (const url of targets) {
        console.log(`Testing: ${url}`);
        try {
            const start = Date.now();
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
            const duration = Date.now() - start;
            console.log(`  Status: ${response.status} (${duration}ms)`);
            const data: any = await response.json();
            console.log(`  Models: ${data.models?.length || 0}`);
        } catch (e: any) {
            console.log(`  FAILED: ${e.message}`);
            if (e.cause) {
                console.log(`  Cause: ${e.cause.message || e.cause}`);
                if (e.cause.code) console.log(`  Code: ${e.cause.code}`);
            }
        }
    }
    console.log('--- Diagnostic End ---');
}

diagnostic();
