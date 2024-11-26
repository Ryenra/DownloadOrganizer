// content.js

document.addEventListener('contextmenu', async function (event) {
    // Find the closest video element
    const videoElement = event.target.closest('video');
    
    // If it's inside a video element (Fluid Player or any video player)
    if (videoElement) {
        // Prevent Fluid Player from hijacking the context menu
        event.stopImmediatePropagation(); // Stop other listeners from firing
        // Optionally, prevent Fluid Player from stopping the default menu
        //event.preventDefault();  // Allow the default context menu

        // Hide Fluid Player's context menu (if it's displayed)
        // const fluidPlayerMenu = document.querySelector('ul'); // Check for Fluid Player's custom menu
        // if (fluidPlayerMenu) {
        //     fluidPlayerMenu.style.display = 'none'; // Hide the custom menu
        // }

        // Optionally, you could also handle the video URL or trigger your own menu here
        const videoSrc = videoElement.src || videoElement.currentSrc;
        chrome.runtime.sendMessage({ action: 'showCustomContextMenu', videoSrc: videoSrc });
    }
}, true); // The "true" makes the event listener fire during the capturing phase
