# Link Summarizer Chrome Extension 🔗✨

Note: This project is (almost) entirely "vibe coded" using Gemini with some minor edits, feel free to check the conversation here: https://g.co/gemini/share/70fdee27559a.

A simple and powerful Chrome extension that leverages the power of Large Language Models (LLMs)—**Google Gemini** or **OpenAI's ChatGPT**—to generate instant summaries when you hover over any hyperlink on a webpage.

## About 💡

This extension provides on-demand summarization to save you time and help you quickly determine if a link is worth clicking.

### Key Features:

* **Dual LLM Support:** Easily switch between using your **Gemini API Key** or **OpenAI API Key** in the popup settings.
* **On-Hover Activation:** Simply place your cursor over a link to see a summary appear next to the pointer.
* **Customizable Length:** Use a slider in the extension popup to set your desired summary length, from **10 to 200 words**.
* **Power Toggle:** A single power button in the popup allows you to quickly **disable** the summarization feature without fully removing the extension.
* **Secure:** All API keys and settings are stored locally using Chrome's secure storage.

***

## How to Use 🛠️

### 0. Generate API Keys

1. Generate API keys for Gemini and/or OpenAI to use to summarize links. Link to generate Gemini key: https://aistudio.google.com/app/api-keys. Link to generate OpenAI key: https://platform.openai.com/api-keys.

### 1. Installation

Since this is a custom-built extension, you must install it via **Developer Mode** in Chrome.

1.  **Save the files:** Ensure you have all the necessary files (`manifest.json`, `content.js`, `background.js`, `popup.html`, `popup.js`, and any icons) saved into a single folder (e.g., `link-summarizer`).
2.  **Open Extensions:** Navigate to `chrome://extensions/` in your Chrome browser.
3.  **Enable Developer Mode:** Toggle the **Developer mode** switch (usually found in the top right corner).
4.  **Load Unpacked:** Click the **Load unpacked** button and select the folder containing your extension files (`link-summarizer`).
5.  **Pin the Icon:** Click the puzzle piece icon (Extensions) in your toolbar, then pin the **Link Summarizer** icon for easy access.

---

### 2. Configuration (First Time Setup)

Before the extension can summarize links, you must provide an API key.

1.  Click the **Link Summarizer** icon in your Chrome toolbar to open the popup.
2.  Click the **Power Button** (if it is currently OFF).
3.  In the **Choose LLM** dropdown, select either **Google Gemini** or **OpenAI**.
4.  Enter your corresponding **API Key** in the dedicated text field.
    * *(Note: The extension will only validate the key for the selected LLM.)*
5.  Use the **slider** to set your desired summary length (e.g., 100 words).
6.  Click **Save Settings**.

---

### 3. Basic Operation

1.  Navigate to any webpage that contains hyperlinks (e.g., a news site, Wikipedia).
2.  Simply **hover your mouse** over any link that starts with `http` or `https`.
3.  After a brief moment, a small, dark box will appear next to your cursor displaying the LLM-generated summary.
4.  When you move your mouse off the link, the summary box will automatically disappear.

---

### 4. Disabling the Feature

If you need to temporarily stop the summaries (e.g., while using a demanding web application):

1.  Click the **Link Summarizer** icon to open the popup.
2.  Click the **Power Button** (labeled "ON") to toggle the feature **OFF**.
3.  Click **Save Settings** (or the power toggle handles the save automatically).

The content script will stop monitoring for link hovers immediately.
