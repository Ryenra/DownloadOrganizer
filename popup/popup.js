// Load existing folder settings
function loadFolders() {
    chrome.storage.sync.get("folders", (result) => {
      const folders = result.folders || []; // Default to an empty array if no folders exist
      const folderContainer = document.getElementById("folders");
      folderContainer.innerHTML = ""; // Clear the UI
  
      folders.forEach(folder => {
        addFolderEntry(folder.name, folder.path, folder.extensions.join(", "));
      });
    });
  }
  
// Save folder settings
function saveFolders() {
    const folderEntries = document.querySelectorAll(".folder-entry");
    const folders = Array.from(folderEntries).map(entry => {
        const name = entry.querySelector(".folder-name").value.trim();
        const path = entry.querySelector(".folder-path").value.trim();
        const extensions = entry.querySelector(".folder-extensions").value.trim();

        if (name && path) {
            return {
                name,
                path,
                extensions: extensions.split(",").map(ext => ext.trim()) // Split extensions by comma
        };
        }
        return null; // Skip incomplete entries
    }).filter(folder => folder !== null); // Filter out null entries

    chrome.storage.sync.set({ folders }, () => {
        alert("Folders saved successfully!");
    });
}

// Helper to add a folder entry UI
function addFolderEntry(name = "", path = "", extensions = "") {
    const folderContainer = document.getElementById("folders");
    const div = document.createElement("div");
    div.className = "folder-entry";

    div.innerHTML = `
        <input type="text" placeholder="Folder Name" value="${name}" class="folder-name">
        <input type="text" placeholder="Folder Path" value="${path}" class="folder-path" readonly>
        <button class="choose-folder">Select Folder</button>
        <input type="text" placeholder="Extensions (e.g., jpg, png)" value="${extensions}" class="folder-extensions">
        <button class="remove-folder">Remove</button>
    `;

    // Attach event listeners for selecting a folder and removing entries
    div.querySelector(".choose-folder").addEventListener("click", async () => {
        const folderPath = await chooseFolder();
        if (folderPath) {
        div.querySelector(".folder-path").value = folderPath;
        }
    });

    div.querySelector(".remove-folder").addEventListener("click", () => {
        folderContainer.removeChild(div);
    });

    folderContainer.appendChild(div);
}

// Fallback for folder selection (manual input for now)
async function chooseFolder() {
    const folderPath = prompt("Enter the folder path manually (file explorer not supported in extensions):");
    return folderPath || null;
}

// Event listeners
document.getElementById("add-folder").addEventListener("click", () => addFolderEntry());
document.getElementById("save-settings").addEventListener("click", saveFolders);
document.getElementById('getUrl').addEventListener('click', () => {
    const videoId = document.getElementById('videoId').value;
  
    chrome.runtime.sendMessage(
      { action: 'getYoutubeUrl', videoId: videoId },
      (response) => {
        const output = document.getElementById('output');
        if (response.success) {
          output.textContent = `Direct URL: ${response.directUrl}`;
        } else {
          output.textContent = `Error: ${response.error}`;
        }
      }
    );
  });
  
document.addEventListener("DOMContentLoaded", loadFolders);
  