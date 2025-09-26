// Constants for the slider and token conversion
const MIN_WORDS = 10;
const MAX_WORDS = 200;
const WORD_TO_TOKEN_FACTOR = 1.5; 

// Model definitions
const MODELS = {
    gemini: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast, Recommended)' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Powerful, Higher Cost)' },
        { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Cheapest)' }
    ],
    openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o mini (Fast, Recommended)' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Standard, Low Cost)' },
        { id: 'gpt-4o', name: 'GPT-4o (Most Powerful, Higher Cost)' }
    ]
};

const slider = document.getElementById('wordCountSlider');
const display = document.getElementById('wordCountDisplay');
const geminiGroup = document.getElementById('gemini-settings');
const openaiGroup = document.getElementById('openai-settings');
const llmChoice = document.getElementById('llmChoice');
const modelChoice = document.getElementById('modelChoice'); // <-- New element
const powerButton = document.getElementById('powerButton');

// Helper to update the display text next to the slider
function updateWordCountDisplay() {
    display.textContent = `${slider.value} words`;
}

// Function to populate the model dropdown
function populateModelDropdown(llmType, selectedModelId) {
    modelChoice.innerHTML = ''; // Clear existing options
    const modelsList = MODELS[llmType] || [];
    
    modelsList.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        if (model.id === selectedModelId) {
            option.selected = true;
        }
        modelChoice.appendChild(option);
    });
    // If no specific model was selected, use the first one as default
    if (!selectedModelId && modelsList.length > 0) {
        modelChoice.value = modelsList[0].id;
    }
}

// Function to toggle API key visibility and update model dropdown
function toggleLLMPlatform() {
    const selectedLLM = llmChoice.value;
    
    // Toggle Key Visibility
    if (selectedLLM === 'gemini') {
        geminiGroup.style.display = 'block';
        openaiGroup.style.display = 'none';
    } else {
        geminiGroup.style.display = 'none';
        openaiGroup.style.display = 'block';
    }

    // Populate model options based on platform
    // We pass a dummy ID for initial population, actual selected model will be loaded in loadSettings
    populateModelDropdown(selectedLLM, null); 
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
    chrome.storage.local.get(['geminiApiKey', 'openaiApiKey', 'wordCount', 'llmChoice', 'modelId', 'isFeatureEnabled'], (items) => {
        
        // 1. Load Power Status
        const isEnabled = items.isFeatureEnabled !== false;
        updatePowerButton(isEnabled);
        
        // 2. Load LLM choice and Model ID
        const selectedLLM = items.llmChoice || 'gemini';
        llmChoice.value = selectedLLM;
        
        // Populate and select the model
        const selectedModelId = items.modelId || MODELS[selectedLLM][0].id;
        populateModelDropdown(selectedLLM, selectedModelId);
        
        // Toggle key visibility based on final LLM choice
        toggleLLMPlatform();

        // 3. Load API Keys
        document.getElementById('geminiApiKey').value = items.geminiApiKey || '';
        document.getElementById('openaiApiKey').value = items.openaiApiKey || '';

        // 4. Load Word Count
        slider.value = items.wordCount || 100; 
        updateWordCountDisplay();
    });
}

// Save the settings when the button is clicked
function saveSettings() {
    const selectedLLM = llmChoice.value;
    const selectedModel = modelChoice.value; // <-- New value
    const wordCount = parseInt(slider.value);
    const tokenCount = Math.ceil(wordCount * WORD_TO_TOKEN_FACTOR);
    
    const geminiKey = document.getElementById('geminiApiKey').value.trim();
    const openaiKey = document.getElementById('openaiApiKey').value.trim();
    
    const status = document.getElementById('status');
    const isEnabled = powerButton.textContent === 'ON';

    let apiKey = (selectedLLM === 'gemini') ? geminiKey : openaiKey;
    let errorPrefix = (selectedLLM === 'gemini') ? 'Gemini' : 'OpenAI';

    if (isEnabled && !apiKey) {
        status.textContent = `Please enter your ${errorPrefix} API key to enable the feature!`;
        status.style.color = 'red';
        return;
    }

    // Save ALL data to Chrome's local storage
    chrome.storage.local.set({
        llmChoice: selectedLLM,
        modelId: selectedModel, // <-- Saved model ID
        geminiApiKey: geminiKey,
        openaiApiKey: openaiKey,
        wordCount: wordCount,
        maxTokens: tokenCount,
        isFeatureEnabled: isEnabled 
    }, () => {
        status.textContent = 'Settings saved successfully!';
        status.style.color = 'green';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

// Toggle function for the power button
function togglePower() {
    const isEnabled = powerButton.textContent === 'ON';
    updatePowerButton(!isEnabled);
    saveSettings(); 
}


// Attach event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('saveButton').addEventListener('click', saveSettings);
powerButton.addEventListener('click', togglePower);
slider.addEventListener('input', updateWordCountDisplay);
llmChoice.addEventListener('change', toggleLLMPlatform); // <-- LLM change now triggers model dropdown update

// Initial calls
updateWordCountDisplay();
// toggleLLMPlatform() is called within loadSettings to ensure model dropdown is correct