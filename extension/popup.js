document.addEventListener('DOMContentLoaded', function() {
  const wordCountInput = document.getElementById('wordCount');
  const saveButton = document.getElementById('saveButton');

  // Load the saved word count when the popup opens
  chrome.storage.sync.get('summaryWordCount', function(data) {
    if (data.summaryWordCount) {
      wordCountInput.value = data.summaryWordCount;
    }
  });

  // Save the word count when the button is clicked
  saveButton.addEventListener('click', function() {
    const wordCount = wordCountInput.value;
    chrome.storage.sync.set({ 'summaryWordCount': wordCount }, function() {
      console.log('Summary word count saved:', wordCount);
      window.close(); // Close the popup after saving
    });
  });
});