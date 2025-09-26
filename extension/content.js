// --- UTILITY FUNCTIONS (NO CHANGE) ---

// A simple debounce function to limit how often the LLM request is sent
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        let context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Function to inject and display the summary box
function showSummary(text, x, y) {
    let existingBox = document.getElementById('llm-summary-box');
    if (existingBox) {
        existingBox.remove();
    }
    const summaryBox = document.createElement('div');
    summaryBox.id = 'llm-summary-box';
    summaryBox.style.cssText = `
        position: fixed;
        top: ${y + 10}px;
        left: ${x + 10}px;
        max-width: 300px;
        padding: 10px;
        background-color: #333;
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        font-size: 14px;
        pointer-events: none;
        word-wrap: break-word; /* Ensure text fits */
    `;
    summaryBox.textContent = text;
    document.body.appendChild(summaryBox);
}

// Function to remove the summary box
function hideSummary() {
    const summaryBox = document.getElementById('llm-summary-box');
    if (summaryBox) {
        summaryBox.remove();
    }
}

// Debounced function to request the summary from the background script
const requestSummary = debounce((url, x, y) => {
    // Show a "Loading..." message immediately
    showSummary("Loading summary...", x, y);

    // Send the link URL to the background service worker
    chrome.runtime.sendMessage({
        action: "summarizeLink",
        url: url,
        x: x,
        y: y
    }, (response) => {
        // Check for runtime error (e.g., API key missing)
        if (chrome.runtime.lastError) {
             console.error("Runtime error:", chrome.runtime.lastError.message);
             // Show a generic error or silent fail
             hideSummary();
             return;
        }

        if (response && response.summary) {
            // Redisplay the summary with the content
            showSummary(response.summary, response.x, response.y);
        } else if (response && response.error) {
            // Display the specific error from the background script
            showSummary(`Error: ${response.error}`, response.x, response.y);
        }
    });
}, 500); // 500ms delay before triggering the request

// --- EVENT HANDLERS ---

let mouseOverListener;
let mouseOutListener;

// Main logic to register/unregister listeners based on state
function initializeLinkSummarizer(isEnabled) {
    // Always clean up existing listeners first
    if (mouseOverListener) {
        document.removeEventListener('mouseover', mouseOverListener);
    }
    if (mouseOutListener) {
        document.removeEventListener('mouseout', mouseOutListener);
    }
    
    // Hide any visible summary box if the feature is being disabled
    hideSummary();

    if (isEnabled) {
        // Register new listeners only if the feature is enabled
        mouseOverListener = (event) => {
            const target = event.target.closest('a');
            if (target && target.href && target.href.startsWith('http')) {
                requestSummary(target.href, event.clientX, event.clientY);
            }
        };

        mouseOutListener = (event) => {
            if (event.target.closest('a')) {
                // A slight delay prevents flickering when moving between adjacent links
                setTimeout(hideSummary, 100);
            }
        };

        document.addEventListener('mouseover', mouseOverListener);
        document.addEventListener('mouseout', mouseOutListener);
    }
}

// Initial check when the content script loads
chrome.storage.local.get(['isFeatureEnabled'], (items) => {
    // Default the feature to ON (true) if it's not set
    const isEnabled = items.isFeatureEnabled !== false; 
    initializeLinkSummarizer(isEnabled);
});

// Listener to re-initialize the feature when settings are changed in the popup
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isFeatureEnabled) {
        // Re-run the initialization with the new state
        initializeLinkSummarizer(changes.isFeatureEnabled.newValue);
    }
});