import OpenAI from 'openai'; // OpenAI SDK is often compatible with Local Local/Groq

export const generateTestCase = async (requirement: string, config: any) => {
    const { provider } = config;

    switch (provider) {
        case 'ollama':
            return await generateWithOllama(requirement, config);
        case 'groq':
            return await generateWithGroq(requirement, config);
        case 'openai':
            return await generateWithOpenAI(requirement, config);
        default:
            throw new Error(`Unsupported provider configured: ${provider}`);
    }
};

const jiraFormatPrompt = `
Based on the following requirement, generate functional and non-functional test cases.
Please format the output in a structure that is easy to copy-paste into Jira (using Markdown tables or bolded sections).
Must Include:
- Summary
- Preconditions
- Steps
- Expected Results

Requirement:
`;

async function generateWithOllama(requirement: string, config: any) {
    const baseUrls = [
        config.ollamaUrl || 'http://localhost:11434',
        'http://127.0.0.1:11434'
    ];
    
    // Remove duplicates and normalize
    const uniqueUrls = Array.from(new Set(baseUrls.map(u => u.replace(/\/$/, ''))));
    const model = config.ollamaModel || 'phi3:mini';
    
    let lastError: any = null;

    for (const url of uniqueUrls) {
        try {
            console.log(`Attempting Ollama generation at ${url}...`);
            const response = await fetch(`${url}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt: `${jiraFormatPrompt}\n${requirement}`,
                    stream: false
                }),
                signal: AbortSignal.timeout(300000) // 5 minute timeout
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Ollama HTTP ${response.status}: ${err}`);
            }
            const data = await response.json();
            return data.response || "No response generated from Ollama.";
        } catch (e: any) {
            lastError = e;
            const causeInfo = e.cause ? ` (Cause: ${e.cause.message || e.cause})` : '';
            console.warn(`Ollama attempt failed for ${url}: ${e.message}${causeInfo}`);
            // Continue to next URL fallback
        }
    }

    const finalMessage = lastError.cause 
        ? `${lastError.message} (Cause: ${lastError.cause.message || lastError.cause})` 
        : lastError.message;
    
    console.error(`All Ollama connection attempts failed. Last error:`, finalMessage);
    throw new Error(`Ollama API error: ${finalMessage}`);
}

async function generateWithGroq(requirement: string, config: any) {
    if (!config.groqKey) throw new Error("Groq API key is missing");
    const groq = new OpenAI({
        apiKey: config.groqKey,
        baseURL: "https://api.groq.com/openai/v1"
    });

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: jiraFormatPrompt },
            { role: "user", content: requirement }
        ],
        model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "No response from Groq.";
}

async function generateWithOpenAI(requirement: string, config: any) {
    if (!config.openaiKey) throw new Error("OpenAI API key is missing");
    const openai = new OpenAI({
        apiKey: config.openaiKey
    });

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: jiraFormatPrompt },
            { role: "user", content: requirement }
        ],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message?.content || "No response from OpenAI.";
}
