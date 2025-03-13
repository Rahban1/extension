/**
 * Content script for the Brainly Link Saver extension
 * Handles extraction of metadata from web pages and adds UI elements
 */

// Create stylesheet for custom UI elements
const createStylesheet = () => {
  const style = document.createElement('style');
  style.textContent = `
    .brainly-save-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      cursor: pointer;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      animation: brainly-fade-in 0.5s forwards 0.5s;
    }
    
    .brainly-save-btn:hover {
      background-color: #1d4ed8;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }
    
    .brainly-save-btn:active {
      transform: translateY(0px);
    }
    
    .brainly-save-btn .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .brainly-message {
      position: fixed;
      bottom: 80px;
      right: 24px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transform: translateY(20px);
      animation: brainly-fade-in 0.3s forwards;
    }
    
    .brainly-message-success {
      background-color: #f0fdf4;
      color: #166534;
      border-left: 4px solid #22c55e;
    }
    
    .brainly-message-error {
      background-color: #fef2f2;
      color: #b91c1c;
      border-left: 4px solid #ef4444;
    }
    
    .brainly-message .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    @keyframes brainly-fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes brainly-fade-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .brainly-save-btn {
        background-color: #3b82f6;
      }
      
      .brainly-save-btn:hover {
        background-color: #2563eb;
      }
      
      .brainly-message-success {
        background-color: #022c22;
        color: #4ade80;
      }
      
      .brainly-message-error {
        background-color: #2c0d0e;
        color: #f87171;
      }
    }
  `;
  document.head.appendChild(style);
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-metadata') {
    const metadata = extractMetadata();
    sendResponse(metadata);
  }
  return true;
});

/**
 * Extract metadata from the current page
 * @returns {Object} - The extracted metadata
 */
function extractMetadata() {
  const metadata = {
    title: '',
    description: '',
    url: window.location.href,
    domain: window.location.hostname
  };

  // Try to extract metadata based on the current domain
  const domain = window.location.hostname.toLowerCase();
  
  // First, try to get common Open Graph meta tags (used by many sites)
  metadata.title = getMetaContent('og:title') || 
                   getMetaContent('twitter:title') || 
                   document.title || '';
                   
  metadata.description = getMetaContent('og:description') || 
                        getMetaContent('twitter:description') || 
                        getMetaContent('description') || '';

  // Then apply site-specific extraction for better results
  if (domain.includes('youtube.com')) {
    extractYouTubeMetadata(metadata);
  } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
    extractTwitterMetadata(metadata);
  } else if (domain.includes('instagram.com')) {
    extractInstagramMetadata(metadata);
  } else if (domain.includes('pinterest.com')) {
    extractPinterestMetadata(metadata);
  } else if (domain.includes('geeksforgeeks.org')) {
    extractGeeksforGeeksMetadata(metadata);
  } else if (domain.includes('stackoverflow.com')) {
    extractStackOverflowMetadata(metadata);
  } else if (domain.includes('github.com')) {
    extractGitHubMetadata(metadata);
  } else if (domain.includes('leetcode.com')) {
    extractLeetCodeMetadata(metadata);
  }

  return metadata;
}

/**
 * Get content from a meta tag
 * @param {string} name - The name or property of the meta tag
 * @returns {string|null} - The content of the meta tag, or null if not found
 */
function getMetaContent(name) {
  const meta = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
  return meta ? meta.getAttribute('content') : null;
}

/**
 * Extract metadata specific to YouTube
 * @param {Object} metadata - The metadata object to populate
 */
function extractYouTubeMetadata(metadata) {
  // If no title was found via meta tags, try YouTube-specific elements
  if (!metadata.title) {
    const titleElement = document.querySelector('h1.title');
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
    }
  }

  // Try to get video description
  if (!metadata.description) {
    // Various selectors to try to get the description
    const descriptionSelectors = [
      '#description-text', // Modern YouTube
      '#description', // Alternative
      'div[itemprop="description"]' // Older YouTube
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.description = element.textContent.trim();
        break;
      }
    }
  }

  // Try to get the channel name for additional context
  const channelElement = document.querySelector('#owner-name a, #channel-name a');
  if (channelElement) {
    const channelName = channelElement.textContent.trim();
    if (channelName && !metadata.description.includes(channelName)) {
      metadata.description = `Channel: ${channelName}` + 
                            (metadata.description ? `\n\n${metadata.description}` : '');
    }
  }
}

/**
 * Extract metadata specific to Twitter/X
 * @param {Object} metadata - The metadata object to populate
 */
function extractTwitterMetadata(metadata) {
  // If no title, try to get the tweet author
  if (!metadata.title) {
    const authorElement = document.querySelector('[data-testid="User-Name"] a, .UserName');
    if (authorElement) {
      metadata.title = `Tweet by ${authorElement.textContent.trim()}`;
    }
  }

  // Try to get the tweet text
  if (!metadata.description) {
    const tweetTextElement = document.querySelector('[data-testid="tweetText"], .TweetTextSize');
    if (tweetTextElement) {
      metadata.description = tweetTextElement.textContent.trim();
    }
  }
}

/**
 * Extract metadata specific to LeetCode
 * @param {Object} metadata - The metadata object to populate
 */
function extractLeetCodeMetadata(metadata) {
  // For problem pages
  const problemTitle = document.querySelector('.mr-2.text-lg, .question-title, [data-cy="question-title"]');
  if (problemTitle) {
    metadata.title = problemTitle.textContent.trim();
  }

  // Try to get difficulty - multiple selectors for different LeetCode UI versions
  const difficultyElement = document.querySelector(
    '.mt-3 span:nth-child(1), ' + 
    '.difficulty-label, ' + 
    '[data-cy="question-difficulty"], ' +
    '.css-10o4wqw' // Newer LeetCode UI class
  );
  
  if (difficultyElement) {
    const difficultyText = difficultyElement.textContent.trim();
    let difficulty = '';
    
    // Normalize the difficulty text
    if (difficultyText.toLowerCase().includes('easy')) {
      difficulty = 'Easy';
    } else if (difficultyText.toLowerCase().includes('medium')) {
      difficulty = 'Medium';
    } else if (difficultyText.toLowerCase().includes('hard')) {
      difficulty = 'Hard';
    } else {
      difficulty = difficultyText;
    }
    
    if (difficulty) {
      metadata.description = `Difficulty: ${difficulty}` + 
                            (metadata.description ? `\n\n${metadata.description}` : '');
    }
  }

  // Try to get problem number
  const problemNumber = document.querySelector('.mr-2.text-lg, .question-title, [data-cy="question-title"]');
  if (problemNumber) {
    const numberMatch = problemNumber.textContent.match(/^(\d+)\./);
    if (numberMatch && numberMatch[1]) {
      metadata.title = `#${numberMatch[1]} ${metadata.title}`;
    }
  }

  // Try to get tags/topics
  const tags = [];
  const tagElements = document.querySelectorAll('.topic-tag, .tag-label, [data-cy="tag"]');
  tagElements.forEach(tag => {
    tags.push(tag.textContent.trim());
  });

  if (tags.length > 0) {
    metadata.description += `\n\nTags: ${tags.join(', ')}`;
  }
  
  // Try to get the problem description
  const descriptionElement = document.querySelector(
    '.question-content, ' +
    '[data-cy="question-content"], ' +
    '.content__u3I1'
  );
  
  if (descriptionElement && !metadata.description.includes(descriptionElement.textContent.substring(0, 100))) {
    const descText = descriptionElement.textContent.trim();
    // Get just the first paragraph or a short summary
    const firstPara = descText.split('\n')[0];
    if (firstPara && firstPara.length > 0) {
      metadata.description += `\n\n${firstPara.substring(0, 200)}${firstPara.length > 200 ? '...' : ''}`;
    }
  }
}

/**
 * Extract metadata specific to Instagram
 * @param {Object} metadata - The metadata object to populate
 */
function extractInstagramMetadata(metadata) {
  // Try to get the post author
  if (!metadata.title) {
    const usernameElement = document.querySelector('a.notranslate, header h2');
    if (usernameElement) {
      metadata.title = `Instagram post by ${usernameElement.textContent.trim()}`;
    }
  }

  // Try to get the post caption
  if (!metadata.description) {
    const captionElements = document.querySelectorAll('div[data-testid="post-comment-root"], .C4VMK span');
    if (captionElements.length > 0) {
      metadata.description = captionElements[0].textContent.trim();
    }
  }
}

/**
 * Extract metadata specific to Pinterest
 * @param {Object} metadata - The metadata object to populate
 */
function extractPinterestMetadata(metadata) {
  // Try to get the pin title
  if (!metadata.title) {
    const titleElement = document.querySelector('h1[data-test-id="pin-title"], .richPinInformation .pinTitle');
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
    }
  }

  // Try to get the pin description
  if (!metadata.description) {
    const descElement = document.querySelector('div[data-test-id="pin-description"], .pinDescription');
    if (descElement) {
      metadata.description = descElement.textContent.trim();
    }
  }

  // Try to get the creator name
  const creatorElement = document.querySelector('[data-test-id="pin-creator-name"], .creatorName');
  if (creatorElement) {
    const creatorName = creatorElement.textContent.trim();
    if (creatorName && !metadata.description.includes(creatorName)) {
      metadata.description = `Created by: ${creatorName}` + 
                          (metadata.description ? `\n\n${metadata.description}` : '');
    }
  }
}

/**
 * Extract metadata specific to GeeksforGeeks
 * @param {Object} metadata - The metadata object to populate
 */
function extractGeeksforGeeksMetadata(metadata) {
  // Try to get the article title
  if (!metadata.title) {
    const titleElement = document.querySelector('h1.article-title, h1.entry-title');
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
    }
  }

  // Try to get the article content
  if (!metadata.description) {
    // Try to get the first paragraph or the article summary
    const summaryElement = document.querySelector('.article-summary, .entry-content p');
    if (summaryElement) {
      metadata.description = summaryElement.textContent.trim();
    }
  }

  // Try to get difficulty level if it's a problem
  const difficultyElement = document.querySelector('.problems_difficulty_level');
  if (difficultyElement) {
    const difficulty = difficultyElement.textContent.trim();
    if (difficulty && !metadata.description.includes(difficulty)) {
      metadata.description = `Difficulty: ${difficulty}` + 
                            (metadata.description ? `\n\n${metadata.description}` : '');
    }
  }
}

/**
 * Extract metadata specific to Stack Overflow
 * @param {Object} metadata - The metadata object to populate
 */
function extractStackOverflowMetadata(metadata) {
  // Try to get the question title
  if (!metadata.title) {
    const titleElement = document.querySelector('h1.question-hyperlink, h1[itemprop="name"]');
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
    }
  }

  // Try to get the question body
  if (!metadata.description) {
    const questionElement = document.querySelector('.js-post-body, .post-text');
    if (questionElement) {
      // Get only the first paragraph or a summary
      const text = questionElement.textContent.trim();
      metadata.description = text.substring(0, 280) + (text.length > 280 ? '...' : '');
    }
  }

  // Try to get tags
  const tagElements = document.querySelectorAll('a.post-tag');
  if (tagElements.length > 0) {
    const tags = Array.from(tagElements).map(tag => tag.textContent.trim());
    if (tags.length > 0) {
      const tagsString = `Tags: ${tags.join(', ')}`;
      metadata.description = tagsString + 
                            (metadata.description ? `\n\n${metadata.description}` : '');
    }
  }
}

/**
 * Extract metadata specific to GitHub
 * @param {Object} metadata - The metadata object to populate
 */
function extractGitHubMetadata(metadata) {
  // Try to get the repository name
  if (!metadata.title) {
    const titleElement = document.querySelector('h1 strong[itemprop="name"], h1.d-flex .mr-2');
    if (titleElement) {
      metadata.title = titleElement.textContent.trim();
    }
  }

  // Try to get the repository description
  if (!metadata.description) {
    const descElement = document.querySelector('p[itemprop="description"], .f4.mt-3');
    if (descElement) {
      metadata.description = descElement.textContent.trim();
    }
  }

  // Try to get additional information (stars, forks, programming language)
  const starsElement = document.querySelector('a[href$="stargazers"]');
  const forksElement = document.querySelector('a[href$="network/members"]');
  const languageElement = document.querySelector('span[itemprop="programmingLanguage"], .repo-language-color + span');

  let additionalInfo = [];
  
  if (starsElement) {
    const stars = starsElement.textContent.trim();
    additionalInfo.push(`Stars: ${stars}`);
  }
  
  if (forksElement) {
    const forks = forksElement.textContent.trim();
    additionalInfo.push(`Forks: ${forks}`);
  }
  
  if (languageElement) {
    const language = languageElement.textContent.trim();
    additionalInfo.push(`Language: ${language}`);
  }
  
  if (additionalInfo.length > 0) {
    const infoString = additionalInfo.join(' | ');
    metadata.description = infoString + 
                        (metadata.description ? `\n\n${metadata.description}` : '');
  }
}

/**
 * Show a status message that automatically disappears
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success/error)
 */
function showMessage(message, type = 'success') {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.brainly-message');
  existingMessages.forEach(msg => {
    msg.style.animation = 'brainly-fade-out 0.3s forwards';
    setTimeout(() => {
      if (document.body.contains(msg)) {
        msg.remove();
      }
    }, 300);
  });
  
  // Create icon based on message type
  let icon = '';
  if (type === 'success') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  } else {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  }
  
  // Create and add the message element
  const messageElement = document.createElement('div');
  messageElement.className = `brainly-message brainly-message-${type}`;
  messageElement.innerHTML = `
    <div class="icon">${icon}</div>
    <div class="content">${message}</div>
  `;
  
  document.body.appendChild(messageElement);
  
  // Remove the message after 3 seconds
  setTimeout(() => {
    messageElement.style.animation = 'brainly-fade-out 0.3s forwards';
    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        messageElement.remove();
      }
    }, 300);
  }, 3000);
}

// Add keyboard shortcut support - Ctrl+Shift+B or Cmd+Shift+B
function addKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    // Check if it's Ctrl+Shift+B (Windows/Linux) or Cmd+Shift+B (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'b') {
      const saveButton = document.getElementById('brainly-save-btn');
      if (saveButton) {
        // Simulate button click with animation
        saveButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
          saveButton.style.transform = '';
          saveButton.click();
        }, 200);
      }
    }
  });
}

// Call the functions when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addKeyboardShortcut();
  });
} else {
  addKeyboardShortcut();
} 