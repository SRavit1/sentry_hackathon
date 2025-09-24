// A function to create and show the tooltip
/*async function showTooltip(event, summaryText) {
  // If a tooltip already exists, remove it to avoid duplicates
  const existingTooltip = document.getElementById('hover-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const tooltip = document.createElement('div');
  tooltip.id = 'hover-tooltip';
  tooltip.textContent = summaryText;

  // Position the tooltip near the mouse cursor
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  tooltip.style.left = `${mouseX + 15}px`;
  tooltip.style.top = `${mouseY + 15}px`;

  document.body.appendChild(tooltip);
}
*/
async function showTooltip(event, contentText, titleText) {
  titleText = ''
  // If a tooltip already exists, remove it to avoid duplicates
  const existingTooltip = document.getElementById('hover-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const tooltip = document.createElement('div');
  tooltip.id = 'hover-tooltip';

  // Create a title element and a content element
  const title = document.createElement('div');
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '5px';
  title.textContent = titleText;

  const content = document.createElement('div');
  content.textContent = contentText;

  // Append title and content to the tooltip
  if (titleText && titleText.trim() !== '') {
    tooltip.appendChild(title);
  }
  tooltip.appendChild(content);

  // Position the tooltip near the mouse cursor
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  tooltip.style.left = `${mouseX + 15}px`;
  tooltip.style.top = `${mouseY + 15}px`;

  document.body.appendChild(tooltip);
}

// A function to remove the tooltip
function hideTooltip() {
  const tooltip = document.getElementById('hover-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Function to handle the mouseenter event
async function handleMouseEnter(event) {
  event.preventDefault(); // Prevents default link behavior

  // Get the URL of the link being hovered over
  const url = event.target.href;

  // The endpoint of your summarization service
  const summaryApiEndpoint = 'http://127.0.0.1:3000/getSummary';

  try {
    // Show a "Loading..." message immediately
    showTooltip(event, 'Loading summary...', '');

    chrome.storage.sync.get('summaryWordCount', async function(data) {
      const wordCount = data.summaryWordCount || 30;
      
      // Make the POST request to your summary API
      const response = await fetch(summaryApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url, wordCount: wordCount })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data_ = await response.json();
      const summary = data_.summary; // Assuming the API returns a JSON object with a 'summary' key
      const title = data_.title; 

      // Update the tooltip with the actual summary
      showTooltip(event, summary, title);
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    showTooltip(event, 'Failed to get summary.', 'Error');
  }
}

// Add event listeners to all links on the page
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', handleMouseEnter);
  link.addEventListener('mouseleave', hideTooltip);
});