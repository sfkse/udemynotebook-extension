// background.js

// Handle authentication flow with Google
export function authenticateWithGoogle(interactive = true) {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

// Function to revoke the token and clear storage
function logout() {
  return new Promise<void>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (!token) {
        resolve(); // No token to revoke, consider it a successful logout
        return;
      }

      // Revoke the token
      const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
      fetch(revokeUrl)
        .then(() => {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            // Clear user data from storage
            chrome.storage.sync.remove(
              ["userID", "email", "authToken", "googleID"],
              () => {
                resolve();
              }
            );
          });
        })
        .catch((error) => {
          console.error("Error revoking token:", error);
          reject(error);
        });
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
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  } else if (message.action === "logout") {
    logout()
      .then(() => {
        sendResponse({ success: true });
        // Notify all tabs about the logout
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { message: "logout" });
            }
          });
        });
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Optional: Add listener for chrome.identity.onSignInChanged
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (!signedIn) {
    // User signed out from Google account, perform logout
    logout().catch((error) => {
      console.error("Error during sign-out cleanup:", error);
    });
  }
});

