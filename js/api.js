/**
 * Brainly API Service
 * Handles all communication with the Brainly backend API
 */

const API_BASE_URL = 'https://brainly-backend.rahban-ghani2001.workers.dev/api/v1';

/**
 * Authenticate a user with the Brainly backend
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Response with token if successful
 */
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Save content to the Brainly backend
 * @param {Object} contentData - The content to save
 * @param {string} token - User's authentication token
 * @returns {Promise<Object>} - Response from the API
 */
async function saveContent(contentData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to save content');
    }
    
    return data;
  } catch (error) {
    console.error('Save content error:', error);
    throw error;
  }
}

/**
 * Get recent content for the current user
 * @param {string} token - User's authentication token
 * @returns {Promise<Array>} - Array of content items
 */
async function getRecentContent(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to get content');
    }
    
    return data.content;
  } catch (error) {
    console.error('Get content error:', error);
    throw error;
  }
}

/**
 * Determine the content type based on the URL
 * @param {string} url - The URL to analyze
 * @returns {string} - Content type (youtube, twitter, doc, or other)
 */
function determineContentType(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  } else if (hostname.includes('leetcode.com')) {
    return 'doc';
  } else {
    return 'doc'; // Default for other types
  }
}

// Export all functions
window.brainlyApi = {
  login,
  saveContent,
  getRecentContent,
  determineContentType
};

/**
 * Brainly API Service
 * Handles all communication with the Brainly backend API
 */


/**
 * Authenticate a user with the Brainly backend
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Response with token if successful
 */
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Save content to the Brainly backend
 * @param {Object} contentData - The content to save
 * @param {string} token - User's authentication token
 * @returns {Promise<Object>} - Response from the API
 */
async function saveContent(contentData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to save content');
    }
    
    return data;
  } catch (error) {
    console.error('Save content error:', error);
    throw error;
  }
}

/**
 * Get recent content for the current user
 * @param {string} token - User's authentication token
 * @returns {Promise<Array>} - Array of content items
 */
async function getRecentContent(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to get content');
    }
    
    return data.content;
  } catch (error) {
    console.error('Get content error:', error);
    throw error;
  }
}

/**
 * Determine the content type based on the URL
 * @param {string} url - The URL to analyze
 * @returns {string} - Content type (youtube, twitter, doc, or other)
 */
function determineContentType(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  } else if (hostname.includes('leetcode.com')) {
    return 'doc';
  } else {
    return 'doc'; // Default for other types
  }
}

// Export all functions
window.brainlyApi = {
  login,
  saveContent,
  getRecentContent,
  determineContentType
};