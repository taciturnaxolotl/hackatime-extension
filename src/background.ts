// open the options page on install
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.tabs.create({
			url: "options/index.html",
		});
	}
});

// listen to the current tab
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		console.log({ status: tab.status, title: tab.title, url: tab.url });
	});

	chrome.storage.local.get("token", (result) => {
		// if token.token doesn't exist then gray the icon
		console.log(result);
		if (!result.token) {
			chrome.action.setIcon({
				path: "icons/gray.png",
			});
		} else {
			chrome.action.setIcon({
				path: "icons/128.png",
			});
		}
	});
});
