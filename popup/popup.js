chrome.storage.sync.get(["id", "email"], (data) => {
  if (data.id && data.email) {
    document.getElementById("login-button").innerText = "Logged In";
    document.getElementById("login-button").disabled = true;
  } else {
    document.getElementById("login-button").innerText = "Login with Google";
  }
});

document.getElementById("login-button").addEventListener("click", () => {
  document.getElementById("login-button").innerText = "Logging In";
  // Send message to background script to start login flow
  chrome.runtime.sendMessage({ action: "login" }, async (response) => {
    if (response.success) {
      console.log("Logged in successfully:", response.token);
      try {
        const { id, email } = await fetchUserProfile(response.token);
        // Save user info db
        const res = await fetch("http://localhost:3001/api/v1/users/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ googleID: id, email }),
        });

        if (!res.ok) {
          alert("Failed to save user info");
          document.getElementById("login-button").innerText =
            "Login with Google";
          return;
        }
        chrome.storage.sync.set({ id, email });
        document.getElementById("login-button").innerText = "Logged In";
        document.getElementById("login-button").disabled = true;
      } catch (error) {
        document.getElementById("login-button").innerText = "Login with Google";
        return alert("Failed to fetch user profile:", error);
      }
    } else {
      document.getElementById("login-button").innerText = "Login with Google";
      return alert("Login failed:", response.error);
    }
  });
});

function fetchUserProfile(token) {
  return fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((userInfo) => userInfo)
    .catch((error) => {
      console.error("Error fetching user info:", error);
    });
}

