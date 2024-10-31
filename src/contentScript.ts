chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "sprig") {
		const lineCount = document.querySelector(
			"div.cm-gutter.cm-lineNumbers > div.cm-gutterElement:last-child",
		);
		const name = document.querySelector(
			"body > astro-island > div > nav > ul > li:nth-child(2) > div > span",
		);

		if (lineCount?.textContent && name?.textContent) {
			// respond with line count of active line
			sendResponse({
				lineCount: Number.parseInt(lineCount.textContent),
				projectName: name.textContent,
			});
		}
	} else if (message.action === "blot") {
		const lineCount = document.querySelector(
			"body > main > div.Editor_root > div.Editor_inner > div:nth-child(1) > div:nth-child(1) > div > div > div.cm-scroller > div.cm-gutters > div.cm-gutter.cm-lineNumbers > div:last-child",
		);

		if (lineCount?.textContent) {
			// respond with line count of active line
			sendResponse({
				lineCount: Number.parseInt(lineCount.textContent),
				projectName: "blot",
			});
		}
	}
});

let inactivityTimeout: ReturnType<typeof setTimeout>; // Timeout ID
const INACTIVITY_LIMIT = 10 * 1000; // 30 seconds in milliseconds

// Function to notify background script about inactivity
function onInactivity() {
	chrome.runtime.sendMessage({ action: "setInactive", inactive: true });
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
	clearTimeout(inactivityTimeout); // Clear the existing timer
	inactivityTimeout = setTimeout(onInactivity, INACTIVITY_LIMIT); // Start a new timer

	// Notify background script that the user is active
	chrome.runtime.sendMessage({ action: "setInactive", inactive: false });
}

// Listen for keystrokes
document.addEventListener("keydown", () => {
	resetInactivityTimer(); // Reset inactivity timer on keypress
});

// Listen for mouse movements
document.addEventListener("mousemove", () => {
	resetInactivityTimer(); // Reset inactivity timer on mouse move
});

// Start the timer initially
resetInactivityTimer();
