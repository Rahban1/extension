# Brainly Link Saver Chrome Extension

A Chrome extension that allows you to save links from YouTube, X/Twitter, and LeetCode directly to your Brainly account.

## Features

- **One-Click Saving**: Save the current page with a single click
- **Site-Specific Support**: Enhanced support for YouTube, X/Twitter, and LeetCode links
- **Context Menu Integration**: Right-click on links from supported platforms to save them
- **Keyboard Shortcut**: Quickly save links using Ctrl+Shift+S (Command+Shift+S on Mac)
- **Recent Links**: View your recently saved links directly in the extension popup
- **Notes & Organization**: Add notes to your saved links

## Installation

### Development Installation

1. Clone this repository or download the ZIP file and extract it
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer Mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the `brainly-extension` folder
5. The extension should now be installed and visible in your toolbar

### Production Installation (Coming Soon)

Once published to the Chrome Web Store, you'll be able to install directly from there.

## Usage

1. **Login**: Click the extension icon and log in with your Brainly account credentials
2. **Save Links**: When on YouTube, X/Twitter, or LeetCode:
   - Click the extension icon in the toolbar
   - Use the keyboard shortcut (Ctrl+Shift+S / Command+Shift+S)
   - Right-click on a link and select "Save to Brainly"
   - Click the floating "Save to Brainly" button on supported sites
3. **Add Notes**: Add optional notes or edit the title before saving
4. **View Recent Links**: See your 5 most recently saved links in the popup

## Development

### Project Structure

```
brainly-extension/
├── images/               # Extension icons and images
├── js/                   # JavaScript files
│   ├── api.js            # API service for backend communication
│   ├── background.js     # Extension background script
│   ├── content.js        # Content script for page interaction
│   └── popup.js          # Script for the extension popup
├── popup/                # Extension popup UI
│   └── popup.html        # Popup HTML
├── styles/               # CSS stylesheets
│   └── popup.css         # Styles for the popup
└── manifest.json         # Extension manifest file
```

### Building for Production

To create a production package:

1. Make sure all URLs point to production endpoints
2. Generate appropriate sized icons if needed
3. Create a ZIP file of the entire directory:
   ```
   zip -r brainly-extension.zip brainly-extension/*
   ```
4. Submit to the Chrome Web Store Developer Dashboard

## Integration with Backend

The extension integrates with your existing Brainly backend using the following endpoints:

- `POST /api/v1/user/signin` - Authentication
- `POST /api/v1/content` - Saving content
- `GET /api/v1/content` - Retrieving content

## Future Enhancements

- Add support for more platforms
- Implement tag management
- Add offline mode for saving links when disconnected
- Implement search functionality for saved links

## License

[MIT License](LICENSE)

## Support

For support, please open an issue on GitHub or contact us through the main Brainly application. 