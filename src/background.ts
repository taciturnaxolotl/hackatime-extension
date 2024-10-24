import { getPartialHeartbeat } from "./utils/filtering";
import { sendHeartbeat } from "./utils/hackatime";
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

// populate cache
chrome.storage.local.get("token", (data) => {
	cache.cachedToken = data.token;
});

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
		handleTabUpdate(tab.url, cache);
	});
});

// listen to navigation events
chrome.webNavigation.onCompleted.addListener((details) => {
	chrome.tabs.get(details.tabId, (tab) => {
		// ignore the newtab page
		if (tab.url !== "chrome://newtab/") {
			handleTabUpdate(tab.url, cache);
		}
	});
});

let lastTab: { id: number; ts: Date } | null = null;
let startTime = 0;
let lastFocus: { id: number; ts: Date } | null = null;
let focusTime = 0;
const timePerTab = new Map<
	number,
	{ time: number; url: string; title: string }
>();
const heartbeatInterval = 30000; // 3 minutes interval
const inactiveTime = heartbeatInterval / 2; // 2 minutes inactivity threshold

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		if (lastTab) {
			const timeSpent = Date.now() - lastTab.ts.getTime();
			const lastTabFull = timePerTab.get(lastTab.id);
			timePerTab.set(lastTab.id, {
				time: (lastTabFull?.time || 0) + timeSpent,
				url: lastTabFull?.url || "",
				title: lastTabFull?.title || "",
			});
		}

		if (!timePerTab.has(activeInfo.tabId)) {
			timePerTab.set(activeInfo.tabId, {
				time: 0,
				url: tab.url || "",
				title: tab.title || "",
			});
		}

		lastTab = {
			id: activeInfo.tabId,
			ts: new Date(),
		};

		console.log("Tab activated", Array.from(timePerTab.entries()));
	});
});

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) {
		if (lastFocus && lastFocus.id !== chrome.windows.WINDOW_ID_NONE) {
			const timeSpent = Date.now() - lastFocus.ts.getTime();
			focusTime += timeSpent;
		}
	} else {
		lastFocus = {
			id: windowId,
			ts: new Date(),
		};
	}

	console.log("Focus changed", focusTime, lastFocus, windowId);
});

setInterval(() => {
	if (!lastTab) return;
	chrome.tabs.get(lastTab.id, async (tab) => {
		if (tab?.id && lastTab) {
			const timeSpent = Date.now() - lastTab.ts.getTime();
			const lastTabFull = timePerTab.get(lastTab.id);
			timePerTab.set(lastTab.id, {
				time: (lastTabFull?.time || 0) + timeSpent,
				url: lastTabFull?.url || "",
				title: lastTabFull?.title || "",
			});

			lastTab = {
				id: tab.id,
				ts: new Date(),
			};

			// in the case that no focus events have changed make sure that focus time is correct
			if (lastFocus) {
				if (lastFocus.id !== chrome.windows.WINDOW_ID_NONE) {
					const timeSpent = Date.now() - lastFocus.ts.getTime();
					focusTime += timeSpent;
				}

				lastFocus = {
					id: lastFocus.id,
					ts: new Date(),
				};
			} else {
				console.log("Focus not found");
				// check window id and update focus time
				await new Promise((resolve) => {
					chrome.windows.getCurrent((window) => {
						if (window?.id !== chrome.windows.WINDOW_ID_NONE) {
							const timeSpent = Date.now() - startTime;
							focusTime += timeSpent;
						}

						console.log("focustime", focusTime);

						lastFocus = {
							id: window?.id || chrome.windows.WINDOW_ID_NONE,
							ts: new Date(),
						};
						resolve(null);
					});
				});
			}

			// get largest amount of time tab
			const tabId = Array.from(timePerTab.keys()).reduce((a, b) =>
				(timePerTab.get(a)?.time || 0) > (timePerTab.get(b)?.time || 0) ? a : b,
			);

			// check if the user has been inactive for 2 minutes
			if (focusTime > inactiveTime) {
				const partialHB = await getPartialHeartbeat(tabId);
				console.log("Partial heartbeat", partialHB);

				if (partialHB) {
					if (cache.cachedToken) {
						await sendHeartbeat(partialHB, cache.cachedToken);
					} else {
						// get the token
						chrome.storage.local.get("token", async (data) => {
							cache.cachedToken = data.token;
							if (cache.cachedToken) {
								await sendHeartbeat(partialHB, cache.cachedToken);
							} else {
								console.log("Token not found");
							}
						});
					}
				}
			} else {
				console.log("User inactive", focusTime, "<", inactiveTime);
			}

			// Clear the time per tab after heartbeat
			timePerTab.clear();

			// set current tab as last tab and add it to the map
			lastTab = {
				id: tabId,
				ts: new Date(),
			};

			timePerTab.set(tabId, {
				time: 0,
				url: tab.url || "",
				title: tab.title || "",
			});

			startTime = Date.now();
			focusTime = 0;
		}
	});
}, heartbeatInterval);
