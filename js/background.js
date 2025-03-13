/**
 * Background script for the Brainly Link Saver extension
 * Handles events such as:
 * - Context menu creation
 * - Keyboard shortcuts
 * - Browser action clicks
 * - Authentication management
 */

// Initialize context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item for links
  chrome.contextMenus.create({
    id: "saveToBrainly",
    title: "Save to Brainly",
    contexts: ["link", "page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveToBrainly") {
    const url = info.linkUrl || info.pageUrl || tab.url;
    saveLink(url, tab);
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-link') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        saveLink(tabs[0].url, tabs[0]);
      }
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle different message types
  switch (message.action) {
    case 'save-link':
      saveLink(message.url, sender.tab, message.metadata, sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'check-auth':
      checkAuthentication(sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'logout':
      logout(sendResponse);
      return true; // Keep the message channel open for async response
  }
});

/**
 * Save a link to the Brainly backend
 * @param {string} url - The URL to save
 * @param {Object} tab - The tab object
 * @param {Object} metadata - Optional metadata about the link
 * @param {function} sendResponse - Function to send response back to sender
 */
async function saveLink(url, tab, metadata = null, sendResponse = null) {
  try {
    // Check if user is authenticated
    const authData = await getAuthData();
    if (!authData || !authData.token) {
      showNotification('Please log in to save links', 'error');
      if (sendResponse) sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // If we don't have metadata, try to get it from the page
    if (!metadata) {
      // Request metadata from the content script
      chrome.tabs.sendMessage(tab.id, { action: 'get-metadata' }, async (response) => {
        if (chrome.runtime.lastError) {
          // Content script not available, use basic metadata
          const contentType = determineContentType(url);
          const title = tab.title || url;
          
          await saveContentToBackend(url, title, contentType, '', authData.token, sendResponse);
        } else {
          // Got metadata from content script
          const contentType = determineContentType(url);
          const title = response.title || tab.title || url;
          const content = response.description || '';
          
          await saveContentToBackend(url, title, contentType, content, authData.token, sendResponse);
        }
      });
    } else {
      // Use provided metadata
      const contentType = determineContentType(url);
      const title = metadata.title || tab.title || url;
      const content = metadata.description || '';
      
      await saveContentToBackend(url, title, contentType, content, authData.token, sendResponse);
    }
  } catch (error) {
    console.error('Error saving link:', error);
    showNotification('Failed to save link', 'error');
    if (sendResponse) sendResponse({ success: false, error: error.message });
  }
}

/**
 * Save content to the backend
 * @param {string} link - The URL to save
 * @param {string} title - The title of the page
 * @param {string} type - The content type
 * @param {string} content - Additional content/notes
 * @param {string} token - Authentication token
 * @param {function} sendResponse - Function to send response back
 */
async function saveContentToBackend(link, title, type, content, token, sendResponse) {
  try {
    const contentData = {
      link,
      title,
      type,
      content
    };
    
    // Make API call
    const response = await fetch('https://api.recollectify.me/api/v1/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contentData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to save content');
    }
    
    // Show success notification
    showNotification('Link saved successfully');
    
    // Send response if callback provided
    if (sendResponse) sendResponse({ success: true });
    
    // Update badge to indicate success
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    
    // Clear badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
    
  } catch (error) {
    console.error('Error saving to backend:', error);
    showNotification(`Error: ${error.message}`, 'error');
    if (sendResponse) sendResponse({ success: false, error: error.message });
    
    // Update badge to indicate error
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
    
    // Clear badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  }
}

/**
 * Determine content type based on URL
 * @param {string} url - The URL to analyze
 * @returns {string} - The content type
 */
function determineContentType(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    } else if (hostname.includes('instagram.com')) {
      return 'instagram';
    } else if (hostname.includes('pinterest.com')) {
      return 'pinterest';
    } else if (hostname.includes('geeksforgeeks.org')) {
      return 'geeksforgeeks';
    } else if (hostname.includes('stackoverflow.com')) {
      return 'stackoverflow';
    } else if (hostname.includes('github.com')) {
      return 'github';
    } else if (hostname.includes('leetcode.com')) {
      return 'doc';
    } else {
      return 'website'; // Default for other types
    }
  } catch (error) {
    console.error('Error determining content type:', error);
    return 'website'; // Default fallback
  }
}

/**
 * Get authentication data from storage
 * @returns {Promise<Object>} - The authentication data
 */
function getAuthData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'username'], (data) => {
      resolve(data);
    });
  });
}

/**
 * Check if user is authenticated
 * @param {function} sendResponse - Function to send response back
 */
async function checkAuthentication(sendResponse) {
  const authData = await getAuthData();
  sendResponse({
    isAuthenticated: Boolean(authData.token),
    username: authData.username || ''
  });
}

/**
 * Logout the current user
 * @param {function} sendResponse - Function to send response back
 */
function logout(sendResponse) {
  chrome.storage.local.remove(['token', 'username'], () => {
    sendResponse({ success: true });
  });
}

/**
 * Show a notification to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success/error)
 */
function showNotification(message, type = 'success') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Brainly Link Saver',
    message: message
  });
} 