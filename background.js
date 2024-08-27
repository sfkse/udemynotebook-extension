// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("Udemy Note Taker Extension installed.");
});

chrome.action.onClicked.addListener(() => {
  // Open the extension popup when the action icon is clicked
  chrome.action.openPopup();
});

// Handle authentication flow with Google
function authenticateWithGoogle(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

// Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "login") {
    authenticateWithGoogle()
      .then((token) => {
        // Store the token securely
        chrome.storage.sync.set({ authToken: token }, () => {
          sendResponse({ success: true, token });
        });
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        sendResponse({ success: false, error });
      });
    return true; // Keep the message channel open for async response
  }
});

// Refresh token logic can be added here if required (e.g., token expiration management).

