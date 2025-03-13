# Publishing Your Chrome Extension

This guide walks you through the process of packaging and publishing your Brainly Link Saver Chrome extension to the Chrome Web Store.

## Prerequisites

1. A Google Developer account (requires a one-time $5 registration fee)
2. All extension files completed, including icons and proper API endpoint configuration
3. A ZIP file of your extension

## Step 1: Prepare Your Extension

1. **Finalize Code**: Make sure all code is working correctly
2. **Update Manifest**: Ensure your `manifest.json` has all required fields
3. **Create Icons**: Make sure you have all required icons (16x16, 48x48, 128x128)
4. **Test Thoroughly**: Test all features of your extension

## Step 2: Package Your Extension

1. Create a ZIP file containing all extension files:
   ```
   zip -r brainly-extension.zip brainly-extension/* -x "*.git*" -x "*.DS_Store"
   ```
2. Make sure the ZIP file includes:
   - manifest.json
   - All HTML, CSS, and JavaScript files
   - Icons and any other assets
   - Do NOT include unnecessary files like .git, node_modules, etc.

## Step 3: Create a Developer Account

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee if you haven't already

## Step 4: Create a New Item

1. In the Developer Dashboard, click "New Item"
2. Upload your ZIP file
3. Fill out the store listing:
   - Detailed description (4,000 characters max)
   - At least 3 screenshots (1280x800 or 640x400)
   - Promotional images (optional but recommended)
   - Select appropriate category (Productivity)
   - Choose relevant languages

## Step 5: Configure Extension Details

1. Provide privacy information:
   - Explain data usage
   - Link to your privacy policy
2. Set distribution options:
   - Select countries where your extension will be available
   - Choose between public or private (for testing)
3. Complete the Developer Program Policies form

## Step 6: Submit for Review

1. Click "Submit for Review"
2. Your extension will go through the Chrome Web Store review process
3. This typically takes a few business days
4. You may receive feedback requiring changes

## Step 7: Post-Publication

1. **Manage Updates**: When you need to update your extension:
   - Update the version number in `manifest.json`
   - Package the updated extension
   - Upload the new ZIP to the Developer Dashboard
   - Submit for review again
   
2. **Monitor Usage**: Use the Chrome Web Store analytics to track installs

3. **Collect Feedback**: Pay attention to user reviews and ratings

## Tips for Fast Approval

1. Clearly explain what your extension does
2. Be transparent about data usage
3. Ensure your extension follows all Chrome Web Store policies
4. Provide a clear privacy policy
5. Test thoroughly before submitting

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Development Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program_policies/) 