// Constants for the slider and token conversion
const MIN_WORDS = 10;
const MAX_WORDS = 200;
const WORD_TO_TOKEN_FACTOR = 1.5; 

const slider = document.getElementById('wordCountSlider');
const display = document.getElementById('wordCountDisplay');
const geminiGroup = document.getElementById('gemini-settings');
const openaiGroup = document.getElementById('openai-settings');
const llmChoice = document.getElementById('llmChoice');
const powerButton = document.getElementById('powerButton'); // <-- New element

// Helper to update the display text next to the slider
function updateWordCountDisplay() {
    display.textContent = `${slider.value} words`;
}

// Function to toggle API key visibility based on LLM choice
function toggleAPIKeyVisibility() {
    if (llmChoice.value === 'gemini') {
        geminiGroup.style.display = 'block';
        openaiGroup.style.display = 'none';
    } else {
        geminiGroup.style.display = 'none';
        openaiGroup.style.display = 'block';
    }
}

// Function to update the power button appearance and state
function updatePowerButton(isEnabled) {
    if (isEnabled) {
        powerButton.textContent = 'ON';
        powerButton.classList.remove('disabled');
        powerButton.classList.add('enabled');
    } else {
        powerButton.textContent = 'OFF';
        powerButton.classList.remove('enabled');
        powerButton.classList.add('disabled');
    }
}

// Load the current settings when the popup is opened
function loadSettings() {
    chrome.storage.local.get(['geminiApiKey', 'openaiApiKey', 'wordCount', 'llmChoice', 'isFeatureEnabled'], (items) => {
        // Load Power Status (default to true/enabled)
        const isEnabled = items.isFeatureEnabled !== false; // <-- New logic
        updatePowerButton(isEnabled);
        
        // Load LLM choice
        llmChoice.value = items.llmChoice || 'gemini';
        toggleAPIKeyVisibility();

        // Load API Keys
        document.getElementById('geminiApiKey').value = items.geminiApiKey || '';
        document.getElementById('openaiApiKey').value = items.openaiApiKey || '';

        // Load and set the slider value, default to 100 words
        slider.value = items.wordCount || 100; 
        updateWordCountDisplay();
    });
}

// Save the settings when the button is clicked
function saveSettings() {
    const selectedLLM = llmChoice.value;
    const wordCount = parseInt(slider.value);
    const tokenCount = Math.ceil(wordCount * WORD_TO_TOKEN_FACTOR);
    
    const geminiKey = document.getElementById('geminiApiKey').value.trim();
    const openaiKey = document.getElementById('openaiApiKey').value.trim();
    
    const status = document.getElementById('status');
    const isEnabled = powerButton.textContent === 'ON'; // Get current state from button

    let apiKey = '';
    if (selectedLLM === 'gemini') {
        apiKey = geminiKey;
    } else {
        apiKey = openaiKey;
    }
    
    // Simple validation for API key if the feature is ON
    if (isEnabled && !apiKey) {
        status.textContent = `Please enter your ${selectedLLM.toUpperCase()} API key to enable the feature!`;
        status.style.color = 'red';
        return;
    }

    // Save ALL data to Chrome's local storage
    chrome.storage.local.set({
        llmChoice: selectedLLM,
        geminiApiKey: geminiKey,
        openaiApiKey: openaiKey,
        wordCount: wordCount,
        maxTokens: tokenCount,
        isFeatureEnabled: isEnabled // <-- New state saved
    }, () => {
        status.textContent = 'Settings saved successfully!';
        status.style.color = 'green';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

// Toggle function for the power button
function togglePower() {
    const isEnabled = powerButton.textContent === 'ON';
    // Toggle the state and update the button appearance
    updatePowerButton(!isEnabled);
    // Automatically save the new state without relying on the main save button
    saveSettings(); 
}


// Attach event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('saveButton').addEventListener('click', saveSettings);
powerButton.addEventListener('click', togglePower); // <-- New listener
slider.addEventListener('input', updateWordCountDisplay);
llmChoice.addEventListener('change', toggleAPIKeyVisibility);

// Initial calls
updateWordCountDisplay();
toggleAPIKeyVisibility();