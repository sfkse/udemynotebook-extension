// content.js

// Listen storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was: ${JSON.stringify(
        oldValue
      )}, new value is: ${JSON.stringify(newValue)}`
    );
  }
});

// Ensure we are on a Udemy lecture page
if (window.location.href.includes("udemy.com/course/")) {
  // Inject the sidebar UI for the note-taking feature
  const sidebar = document.createElement("div");
  sidebar.id = "udemy-note-taker";
  // sidebar.style.display = "none"; // TODO: Remove this line after testing
  sidebar.style.position = "fixed";
  sidebar.style.right = "0";
  sidebar.style.top = "0";
  sidebar.style.width = "300px";
  sidebar.style.height = "100%";
  sidebar.style.backgroundColor = "#222";
  sidebar.style.zIndex = "1000";
  sidebar.style.color = "white";
  sidebar.style.padding = "10px";
  sidebar.innerHTML = `
      <h2>Lecture Notes</h2>
      <button id="login-btn">Login with Google</button>
      <textarea id="note-input" placeholder="Write your note here..." rows="5" style="width:100%;"></textarea>
      <button id="save-note-btn">Save Note</button>
      <div id="notes-list"></div>
    `;
  document.body.appendChild(sidebar);

  // Save note to Chrome's storage
  document.getElementById("save-note-btn").addEventListener("click", () => {
    const noteContent = document.getElementById("note-input").value;
    const timestamp = new Date().toISOString();

    if (noteContent) {
      chrome.storage.sync.get(["authToken"], (result) => {
        if (result.authToken) {
          const noteKey = `note-${timestamp}`;
          const noteData = { content: noteContent, timestamp };

          // Save note locally
          chrome.storage.sync.set({ [noteKey]: noteData }, () => {
            console.log("Note saved locally:", noteData);
            loadNotes();
          });

          // Optional: Send the note to your backend if public sharing is enabled
          // fetch("https://your-backend-server.com/notes", {
          //   method: "POST",
          //   headers: {
          //     "Authorization": `Bearer ${result.authToken}`,
          //     "Content-Type": "application/json"
          //   },
          //   body: JSON.stringify(noteData)
          // }).then(response => response.json())
          //   .then(data => console.log("Note saved to server:", data));
        } else {
          alert("Please log in to save your notes.");
        }
      });
    } else {
      alert("Please enter a note.");
    }
  });

  // Load saved notes from Chrome's storage
  function loadNotes() {
    chrome.storage.sync.get(null, (items) => {
      const notesList = document.getElementById("notes-list");
      notesList.innerHTML = ""; // Clear the existing list

      for (let [key, value] of Object.entries(items)) {
        if (key.startsWith("note-")) {
          const noteElement = document.createElement("div");
          noteElement.textContent = `${value.timestamp}: ${value.content}`;
          noteElement.style.borderBottom = "1px solid white";
          noteElement.style.marginBottom = "10px";
          notesList.appendChild(noteElement);
        }
      }
    });
  }

  // Initial load of notes
  loadNotes();
}

