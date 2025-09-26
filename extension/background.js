// Constants for API endpoints and default settings
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-3.5-turbo";

const DEFAULT_MAX_WORDS = 100;
const DEFAULT_MAX_TOKENS = 150; // Corresponds to the default 100 words
const DEFAULT_LLM = 'gemini';

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizeLink") {
        fetchSummary(request.url, request.x, request.y, sendResponse);
        return true; 
    }
});

async function fetchSummary(url, x, y, sendResponse) {
    // 1. Retrieve all necessary settings from Chrome storage
    const settings = await chrome.storage.local.get(['llmChoice', 'geminiApiKey', 'openaiApiKey', 'maxTokens', 'wordCount']);
    
    const llmChoice = settings.llmChoice || DEFAULT_LLM;
    //const maxTokens = settings.maxTokens || DEFAULT_MAX_TOKENS;
    const wordCount = settings.wordCount || DEFAULT_MAX_WORDS;
    
    let apiKey = '';
    let errorPrefix = '';

    if (llmChoice === 'gemini') {
        apiKey = settings.geminiApiKey;
        errorPrefix = 'Gemini';
    } else if (llmChoice === 'openai') {
        apiKey = settings.openaiApiKey;
        errorPrefix = 'OpenAI';
    }

    if (!apiKey) {
        console.error(`${errorPrefix} API Key not found in storage.`);
        sendResponse({ error: `Please enter your ${errorPrefix} API key in the extension popup.`, x: x, y: y });
        return;
    }

    // 2. Prepare the prompt (same for both models)
    const prompt = `Provide a summary of the content found at this URL. The summary should be approximately ${wordCount} words long. URL: ${url}`;
    
    try {
        let fetchConfig = {};
        let summaryText = "Could not generate a summary.";

        if (llmChoice === 'gemini') {
            // GEMINI API Configuration
            const GEMINI_API_ENDPOINT = GEMINI_API_BASE + apiKey;
            fetchConfig = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: prompt }] }
                    ],
                    // config: {
                    //     maxOutputTokens: maxTokens, // Uses converted token count
                    //     temperature: 0.1 
                    // }
                })
            };

            const response = await fetch(GEMINI_API_ENDPOINT, fetchConfig);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini Error: ${response.status} - ${errorData.error?.message || 'Server error'}`);
            }
            const data = await response.json();
            summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        } else if (llmChoice === 'openai') {
            // OPENAI API Configuration
            fetchConfig = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}` 
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages: [
                        { "role": "system", "content": "You are a helpful assistant that summarizes links." },
                        { "role": "user", "content": prompt }
                    ],
                    max_tokens: maxTokens, // Uses converted token count
                    temperature: 0.1
                })
            };

            const response = await fetch(OPENAI_API_ENDPOINT, fetchConfig);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI Error: ${response.status} - ${errorData.error?.message || 'Server error'}`);
            }
            const data = await response.json();
            summaryText = data.choices?.[0]?.message?.content?.trim();
        }

        // 3. Send the summary back to the content script
        if (summaryText) {
            sendResponse({ summary: summaryText, x: x, y: y });
        } else {
            throw new Error("API returned an empty summary.");
        }

    } catch (error) {
        console.error(`${errorPrefix} API Error:`, error);
        sendResponse({ error: error.message || "Unknown error occurred.", x: x, y: y });
    }
}