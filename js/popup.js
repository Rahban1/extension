/**
 * Popup script for the Brainly Link Saver extension
 * Handles the UI interactions in the popup window
 */

// DOM elements
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const usernameSpan = document.getElementById('username');
const userInitials = document.getElementById('user-initials');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-btn');
const titleInput = document.getElementById('title');
const notesInput = document.getElementById('notes');
const typeSelect = document.getElementById('type');
const recentLinksContainer = document.getElementById('recent-links');
const siteBadge = document.getElementById('site-badge');
const refreshBtn = document.getElementById('refresh-btn');
const themeToggle = document.getElementById('theme-toggle');
const toastContainer = document.getElementById('toast-container');

// Animation constants using Framer Motion
const fadeIn = {
  opacity: [0, 1],
  transition: { duration: 0.3 }
};

const slideUp = {
  opacity: [0, 1],
  y: [20, 0],
  transition: { duration: 0.3 }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme
  initTheme();
  
  // Check authentication status
  checkAuthState();

  // Set up event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  saveBtn.addEventListener('click', handleSave);
  refreshBtn.addEventListener('click', loadRecentLinks);
  themeToggle.addEventListener('click', toggleTheme);

  // Fill the form with current page data
  await populateFormWithCurrentPageData();
  
  // Add animation to all buttons
  addButtonAnimations();
});

/**
 * Initialize theme based on user preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Add animation to theme toggle
  const motion = window.motion;
  if (motion) {
    motion.animate(themeToggle, { scale: [0.9, 1], rotate: [0, 360] }, { duration: 0.5 });
  }
}

/**
 * Add animation effects to buttons
 */
function addButtonAnimations() {
  const motion = window.motion;
  if (!motion) return;
  
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      motion.animate(button, { scale: 1.05 }, { duration: 0.2 });
    });
    
    button.addEventListener('mouseleave', () => {
      motion.animate(button, { scale: 1 }, { duration: 0.2 });
    });
    
    button.addEventListener('mousedown', () => {
      motion.animate(button, { scale: 0.95 }, { duration: 0.1 });
    });
    
    button.addEventListener('mouseup', () => {
      motion.animate(button, { scale: 1.05 }, { duration: 0.1 });
    });
  });
}

/**
 * Check authentication state and update UI accordingly
 */
function checkAuthState() {
  chrome.runtime.sendMessage({ action: 'check-auth' }, (response) => {
    if (response.isAuthenticated) {
      showMainSection(response.username);
      loadRecentLinks();
    } else {
      showLoginSection();
    }
  });
}

/**
 * Show the login section and hide the main section
 */
function showLoginSection() {
  loginSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
  
  // Add animation
  const motion = window.motion;
  if (motion) {
    motion.animate(loginSection, fadeIn);
  }
}

/**
 * Show the main section and hide the login section
 * @param {string} username - The username to display
 */
function showMainSection(username) {
  loginSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  usernameSpan.textContent = username;
  
  // Set user initials in avatar
  if (username) {
    const initials = username.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    userInitials.textContent = initials;
  }
  
  // Add animation
  const motion = window.motion;
  if (motion) {
    motion.animate(mainSection, fadeIn);
  }
}

/**
 * Handle login button click
 */
function handleLogin() {
  // Create a modal for login
  const modal = document.createElement('div');
  modal.className = 'login-modal';
  modal.innerHTML = `
    <div class="login-modal-content card">
      <h2 class="card-title">Log In to Brainly</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <div class="input-container">
          <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <input type="text" id="username-input" class="input" placeholder="Enter your username">
        </div>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-container">
          <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <input type="password" id="password-input" class="input" placeholder="Enter your password">
        </div>
      </div>
      <div class="login-actions" style="display: flex; gap: 8px; margin-top: 16px;">
        <button id="cancel-login" class="btn">Cancel</button>
        <button id="submit-login" class="btn primary-btn">Log In</button>
      </div>
      <div id="login-status" class="status" style="margin-top: 12px;"></div>
    </div>
  `;

  // Style the modal
  modal.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  document.body.appendChild(modal);
  
  // Animate the modal
  const motion = window.motion;
  if (motion) {
    const modalContent = modal.querySelector('.login-modal-content');
    motion.animate(modalContent, { opacity: [0, 1], y: [10, 0], scale: [0.95, 1] }, { duration: 0.3 });
  }

  // Set up event listeners for the modal
  document.getElementById('cancel-login').addEventListener('click', () => {
    if (motion) {
      const modalContent = modal.querySelector('.login-modal-content');
      motion.animate(modalContent, { opacity: [1, 0], y: [0, 10], scale: [1, 0.95] }, { duration: 0.2 })
        .finished.then(() => modal.remove());
    } else {
      modal.remove();
    }
  });

  document.getElementById('submit-login').addEventListener('click', async () => {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const loginStatus = document.getElementById('login-status');

    if (!username || !password) {
      loginStatus.textContent = 'Please enter both username and password';
      loginStatus.className = 'status error';
      shakeElement(document.getElementById('username-input').parentNode);
      shakeElement(document.getElementById('password-input').parentNode);
      return;
    }

    try {
      // Authenticate with the backend
      const response = await fetch('https://brainly-backend.rahban-ghani2001.workers.dev/api/v1/user/signin', {
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

      // Store authentication data
      chrome.storage.local.set({
        token: data.token,
        username: username
      }, () => {
        if (motion) {
          const modalContent = modal.querySelector('.login-modal-content');
          motion.animate(modalContent, { opacity: [1, 0], y: [0, -10], scale: [1, 0.95] }, { duration: 0.2 })
            .finished.then(() => {
              modal.remove();
              showMainSection(username);
              loadRecentLinks();
              showToast('Login successful', 'You are now logged in to Brainly', 'success');
            });
        } else {
          modal.remove();
          showMainSection(username);
          loadRecentLinks();
          showToast('Login successful', 'You are now logged in to Brainly', 'success');
        }
      });
    } catch (error) {
      loginStatus.textContent = error.message;
      loginStatus.className = 'status error';
      shakeElement(document.getElementById('username-input').parentNode);
      shakeElement(document.getElementById('password-input').parentNode);
    }
  });
}

/**
 * Shake an element to indicate error
 * @param {HTMLElement} element - The element to shake
 */
function shakeElement(element) {
  const motion = window.motion;
  if (motion) {
    motion.animate(element, { x: [0, -5, 5, -5, 5, 0] }, { duration: 0.4 });
  }
}

/**
 * Handle logout button click
 */
function handleLogout() {
  chrome.runtime.sendMessage({ action: 'logout' }, () => {
    showLoginSection();
    showToast('Logged out', 'You have been successfully logged out', 'info');
  });
}

/**
 * Handle save button click
 */
async function handleSave() {
  const title = titleInput.value;
  if (!title) {
    showToast('Error', 'Please enter a title', 'error');
    shakeElement(titleInput.parentNode);
    return;
  }

  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs.length === 0) {
      showToast('Error', 'No active tab found', 'error');
      return;
    }

    const currentTab = tabs[0];
    const token = await getToken();

    if (!token) {
      showToast('Not logged in', 'Please log in to save links', 'error');
      return;
    }

    try {
      const contentData = {
        title: title,
        link: currentTab.url,
        type: typeSelect.value,
        content: notesInput.value
      };

      // Animate the save button
      const motion = window.motion;
      if (motion) {
        motion.animate(saveBtn, { scale: [1, 0.95, 1] }, { duration: 0.3 });
      }

      // Make API call
      const response = await fetch('https://brainly-backend.rahban-ghani2001.workers.dev/api/v1/content', {
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

      showToast('Success', 'Link saved successfully', 'success');
      
      // Clear the form with animation
      if (motion) {
        motion.animate(titleInput, { opacity: [1, 0, 1] }, { duration: 0.3 })
          .finished.then(() => {
            titleInput.value = '';
          });
          
        motion.animate(notesInput, { opacity: [1, 0, 1] }, { duration: 0.3 })
          .finished.then(() => {
            notesInput.value = '';
          });
      } else {
        titleInput.value = '';
        notesInput.value = '';
      }
      
      // Reload recent links
      loadRecentLinks();
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  });
}

/**
 * Populate the form with data from the current page
 */
async function populateFormWithCurrentPageData() {
  try {
    // Get the current tab
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    
    if (tabs.length === 0) {
      return;
    }
    
    const currentTab = tabs[0];
    
    // Set title
    titleInput.value = currentTab.title || '';
    
    // Set type based on URL
    const url = currentTab.url;
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    let siteType = 'Other Website';
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      typeSelect.value = 'youtube';
      siteType = 'YouTube';
      siteBadge.style.backgroundColor = '#FF0000';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      typeSelect.value = 'twitter';
      siteType = 'Twitter';
      siteBadge.style.backgroundColor = '#1DA1F2';
    } else if (hostname.includes('instagram.com')) {
      typeSelect.value = 'instagram';
      siteType = 'Instagram';
      siteBadge.style.backgroundColor = '#E1306C';
    } else if (hostname.includes('pinterest.com')) {
      typeSelect.value = 'pinterest';
      siteType = 'Pinterest';
      siteBadge.style.backgroundColor = '#E60023';
    } else if (hostname.includes('geeksforgeeks.org')) {
      typeSelect.value = 'geeksforgeeks';
      siteType = 'GeeksForGeeks';
      siteBadge.style.backgroundColor = '#2F8D46';
    } else if (hostname.includes('stackoverflow.com')) {
      typeSelect.value = 'stackoverflow';
      siteType = 'Stack Overflow';
      siteBadge.style.backgroundColor = '#F48024';
    } else if (hostname.includes('github.com')) {
      typeSelect.value = 'github';
      siteType = 'GitHub';
      siteBadge.style.backgroundColor = '#6e5494';
    } else if (hostname.includes('leetcode.com')) {
      typeSelect.value = 'doc';
      siteType = 'LeetCode';
      siteBadge.style.backgroundColor = '#FFA116';
      siteBadge.style.color = 'white';
      siteBadge.style.fontWeight = '500';
      
      // Add LeetCode logo to the badge
      const leetCodeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>`;
      
      siteBadge.innerHTML = leetCodeIcon + siteType;
    } else {
      typeSelect.value = 'website';
      siteBadge.style.backgroundColor = '#4F45E4';
    }
    
    siteBadge.textContent = siteType;
    
    // Try to get additional metadata from the content script
    try {
      chrome.tabs.sendMessage(currentTab.id, { action: 'get-metadata' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not available or other error
          return;
        }
        
        if (response && response.description) {
          notesInput.value = response.description;
        }
      });
    } catch (error) {
      console.error('Error getting metadata from content script:', error);
    }
  } catch (error) {
    console.error('Error populating form:', error);
  }
}

/**
 * Load recent links from the backend
 */
async function loadRecentLinks() {
  try {
    // Animate refresh button
    const motion = window.motion;
    if (motion) {
      motion.animate(refreshBtn, { rotate: [0, 360] }, { duration: 0.5 });
    }
    
    const token = await getToken();
    
    if (!token) {
      return;
    }
    
    const response = await fetch('https://brainly-backend.rahban-ghani2001.workers.dev/api/v1/content', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to get content');
    }
    
    displayRecentLinks(data.content);
  } catch (error) {
    console.error('Error loading recent links:', error);
    recentLinksContainer.innerHTML = '<p class="empty-message">Failed to load recent links</p>';
  }
}

/**
 * Display recent links in the UI
 * @param {Array} links - Array of link objects
 */
function displayRecentLinks(links) {
  if (!links || links.length === 0) {
    recentLinksContainer.innerHTML = '<p class="empty-message">No saved links yet</p>';
    return;
  }
  
  // Sort links by most recent first (assuming they have a createdAt field, or using the _id which contains a timestamp)
  links.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return b._id.localeCompare(a._id);
  });
  
  // Take only the 5 most recent links
  const recentLinks = links.slice(0, 5);
  
  // Clear container
  recentLinksContainer.innerHTML = '';
  
  // Add links with animation
  const motion = window.motion;
  const delay = 0.05;
  
  // Add links
  recentLinks.forEach((link, index) => {
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    
    // Create a URL object to extract the domain
    let domain = '';
    let icon = '';
    try {
      const urlObj = new URL(link.link);
      domain = urlObj.hostname.replace('www.', '');
      
      // Set icon based on domain
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19c-2.3 0-6.4-.2-8.1-.6-.7-.2-1.2-.7-1.4-1.4-.3-1.1-.5-3.4-.5-5s.2-3.9.5-5c.2-.7.7-1.2 1.4-1.4C5.6 5.2 9.7 5 12 5s6.4.2 8.1.6c.7.2 1.2.7 1.4 1.4.3 1.1.5 3.4.5 5s-.2 3.9-.5 5c-.2.7-.7 1.2-1.4 1.4-1.7.4-5.8.6-8.1.6 0 0 0 0 0 0z"></path><polygon points="10 15 15 12 10 9"></polygon></svg>';
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>';
      } else if (domain.includes('instagram.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>';
      } else if (domain.includes('pinterest.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E60023" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h8"></path><path d="M12 8v8"></path><circle cx="12" cy="12" r="10"></circle></svg>';
      } else if (domain.includes('geeksforgeeks.org')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2F8D46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      } else if (domain.includes('stackoverflow.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F48024" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>';
      } else if (domain.includes('github.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e5494" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>';
      } else if (domain.includes('leetcode.com')) {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFA116" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
      } else {
        icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F45E4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
      }
      
    } catch (e) {
      domain = 'unknown';
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    
    linkItem.innerHTML = `
      <a href="${link.link}" class="link-title" target="_blank">${link.title}</a>
      <span class="link-domain">
        ${icon}
        ${domain}
      </span>
    `;
    
    recentLinksContainer.appendChild(linkItem);
    
    // Add animation
    if (motion) {
      motion.animate(linkItem, { opacity: [0, 1], x: [-20, 0] }, { delay: index * delay, duration: 0.3 });
    }
  });
}

/**
 * Show a toast notification
 * @param {string} title - The title of the toast
 * @param {string} message - The message to show
 * @param {string} type - The type of toast (success/error/info)
 */
function showToast(title, message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Choose icon based on type
  let icon = '';
  if (type === 'success') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  } else if (type === 'error') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  toast.innerHTML = `
    <div class="toast-icon">
      ${icon}
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Animate the toast
  const motion = window.motion;
  if (motion) {
    motion.animate(toast, slideUp);
  }
  
  // Add close button functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    if (motion) {
      motion.animate(toast, { opacity: [1, 0], height: [toast.offsetHeight, 0] }, { duration: 0.3 })
        .finished.then(() => {
          toast.remove();
        });
    } else {
      toast.remove();
    }
  });
  
  // Automatically remove after 4 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      if (motion) {
        motion.animate(toast, { opacity: [1, 0], height: [toast.offsetHeight, 0] }, { duration: 0.3 })
          .finished.then(() => {
            if (document.body.contains(toast)) {
              toast.remove();
            }
          });
      } else {
        toast.remove();
      }
    }
  }, 4000);
}

/**
 * Get the authentication token from storage
 * @returns {Promise<string|null>} - The token or null if not found
 */
function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get('token', (data) => {
      resolve(data.token || null);
    });
  });
}