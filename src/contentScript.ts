chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "sprig") {
		const lineCount = document.querySelector(
			"div.cm-gutter.cm-lineNumbers > div.cm-gutterElement:last-child",
		);
		const name = document.querySelector(
			"body > astro-island > div > nav > ul > li:nth-child(2) > div > span",
		);

		if (lineCount?.textContent && name?.textContent) {
			console.log(lineCount.textContent);
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
			console.log(lineCount.textContent);
			// respond with line count of active line
			sendResponse({
				lineCount: Number.parseInt(lineCount.textContent),
				projectName: "blot",
			});
		}
	}
});
