import { handleTabUpdate } from "./utils/icon";

// open the options page on install
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.tabs.create({
			url: "options/index.html",
		});
	}
});

const cache: {
	cachedIconPath: string | null;
	cachedToken: string | null;
} = {
	cachedIconPath: null,
	cachedToken: null,
};

// Invalidate the cache every 30 seconds
setInterval(() => {
	cache.cachedToken = null;
}, 30000);

// invalidate the icon cache every 5 minutes
setInterval(() => {
	cache.cachedIconPath = null;
}, 300000);

// listen to the current tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		console.log({
			trigger: "activate",
			status: tab.status,
			title: tab.title,
			url: tab.url,
		});
		handleTabUpdate(tab.url, cache);
	});
});

// listen to navigation events
chrome.webNavigation.onCompleted.addListener((details) => {
	chrome.tabs.get(details.tabId, (tab) => {
		// ignore the newtab page
		if (tab.url !== "chrome://newtab/") {
			console.log({
				trigger: "navigate",
				status: tab.status,
				title: tab.title,
				url: tab.url,
			});
			handleTabUpdate(tab.url, cache);
		}
	});
});
