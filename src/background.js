import ytdl from 'ytdl-core';

const getFileExtensionFromInfo = (info) => {
  const url = info.srcUrl;
  if (!url) return ""; // Return empty string if none of the URLs are available
  
  try {
    return (new URL(url).pathname.split('.').pop() || "").toLowerCase();
  } catch (e) {
    console.error("Invalid URL:", url);
    return ""; // Return empty string if URL is invalid
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'getYoutubeUrl') {
    const videoId = message.videoId; // e.g., "dQw4w9WgXcQ"
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const info = await ytdl.getInfo(url);
      console.log(info)
      // Fix this, we're getting the right info, just need to download the video now using ytdl
      const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
      sendResponse({ success: true, directUrl: format.url });
    } catch (error) {
      console.error('Error fetching video URL:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});


// Set up the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToFolder",
    title: "Save to Folder",
    contexts: ["all"]
  });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'showCustomContextMenu') {
    console.log("message received");
    // Create a custom context menu with the video source URL
    chrome.contextMenus.removeAll(); // Remove any previous menus
    chrome.contextMenus.create({
      id: 'saveToFolder',
      title: 'Save Video to Folder',
      contexts: ['all'], // Show in all contexts (video element context)
    });

    // Add custom menu items for different video formats if needed
    chrome.contextMenus.create({
      id: 'saveVideo',
      title: `Save Video: ${message.videoSrc}`,
      contexts: ['all'],
      parentId: 'saveToFolder',
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Check if the request is for a video file
    if (details.url.endsWith('.mp4') || details.url.endsWith('.mp2t')) {
      console.log("Original Video URL:", details.url);
    }
  },
  { urls: ["<all_urls>"] }, // Match all URLs
  ["blocking"]
);


// Update context menu dynamically when the user right-clicks
chrome.contextMenus.onShown.addListener(async (info, tab) => {
  console.log(info);
  // Custom Behavior: Check if right-click is on a <video> element
  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   func: () => {
  //     document.addEventListener("contextmenu", (event) => {
  //       const videoElement = event.target.closest("video"); // Check if the element is a <video>

  //       if (videoElement) {
  //         event.preventDefault(); // Prevent the default context menu
  //         const videoSrc = videoElement.getAttribute("src") || 
  //                          (videoElement.querySelector("source") ? videoElement.querySelector("source").getAttribute("src") : null);

  //         if (videoSrc) {
  //           // Notify the user and copy the video URL to the clipboard
  //           navigator.clipboard.writeText(videoSrc).then(() => {
  //             console.log(`Video URL copied to clipboard: ${videoSrc}`);
  //             alert(`Video URL: ${videoSrc}`);
  //           }).catch(err => {
  //             console.error("Failed to copy video URL:", err);
  //             alert("Failed to copy video URL.");
  //           });
  //         } else {
  //           alert("No video source found.");
  //         }
  //       }
  //     });
  //   }
  // });
  if (!info.menuIds || !info.menuIds.includes("saveToFolder")) return;
  
  // Remove any previous dynamic items
  chrome.contextMenus.removeAll();
  
  // Re-create the base item
  chrome.contextMenus.create({
    id: "saveToFolder",
    title: "Save to Folder",
    contexts: ["all"]
  });
  
  // Load folders and add them as sub-items
  const { folders } = await chrome.storage.sync.get("folders") || { folders: [] };
  
  let fileExtension = getFileExtensionFromInfo(info);
  
  console.log("test");
  console.log("Matching folders:", folders);
  console.log("File extension:", fileExtension);


  folders.forEach((folder) => {
    if (folder.extensions.includes(fileExtension)) {
      chrome.contextMenus.create({
        id: `saveTo-${folder.name}`,
        title: folder.name,
        contexts: ["all"],
        parentId: "saveToFolder"
      });
    }
  });

  chrome.contextMenus.refresh(); // Update the context menu UI
});

// Handle menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log(info);
  if (!info.menuItemId.startsWith("saveTo-")) return;

  const folderName = info.menuItemId.replace("saveTo-", "");
  const url = info.srcUrl;
  //console.log((new URL(url).pathname.split('/').pop() || ""))
  chrome.storage.sync.get("folders", ({ folders }) => {
    const folder = folders.find(f => f.name === folderName);
    if (folder) {
      chrome.downloads.download({
        url,
        filename: `${folder.name}/${(new URL(info.srcUrl).pathname.split('/').pop() || "")}` // Save in subfolder
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Error downloading file:", chrome.runtime.lastError);
        } else {
          console.log("File saved to folder:", folder.name);
        }
      });
    }
  });
});
