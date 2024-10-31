import { getPartialHeartbeat, whitelist } from "./utils/filtering";
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

const timePerTab = new Map<
	number,
	{ time: number; url: string; title: string }
>();
const heartbeatInterval = 1 * 60 * 1000; // 1 minute in milliseconds
const inactiveTabTime = 50 * 1000; // 2 minutes inactivity threshold

let isInactive = true; // Initial state
// store the state so we can figure out what percentage of time the user was active
const activityChangeMap = new Map<number, boolean>();

// Listener to handle messages from content script
chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.action === "setInactive" && isInactive !== request.inactive) {
		// Check if the message is coming from the focused window
		chrome.windows.getLastFocused((window) => {
			if (sender.tab?.windowId === window.id) {
				isInactive = request.inactive;

				// Store the state change with a timestamp
				activityChangeMap.set(Date.now(), isInactive);

				// You can also take action if the user goes inactive or becomes active again
				if (isInactive) {
					console.log("User is now inactive.");
				} else {
					console.log("User is active.");
				}
			}
		});
	}
});

// listen to window focus changing and get currentely active tab in that window
chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) {
		return;
	}

	chrome.tabs.query({ active: true, windowId }, (tabs) => {
		if (tabs[0].id) {
			handleTabUpdate(tabs[0].url, cache);
			if (lastTab) {
				if (lastTab.id !== tabs[0].id) {
					const timeSpent = Date.now() - lastTab.ts.getTime();
					const lastTabFull = timePerTab.get(lastTab.id);
					timePerTab.set(lastTab.id, {
						time: (lastTabFull?.time || 0) + timeSpent,
						url: lastTabFull?.url || "",
						title: lastTabFull?.title || "",
					});
				}
			} else {
				lastTab = {
					id: tabs[0].id,
					ts: new Date(),
				};
			}

			console.log(
				"Tab switched via window switch",
				Array.from(timePerTab.entries()),
			);
		}
	});
});

// Function to calculate the percentage of inactive time
function calculateInactivePercentage() {
	const entries = Array.from(activityChangeMap.entries());
	if (entries.length === 0) return 100;

	let inactiveTime = 0;
	let lastTimestamp = entries[0][0];
	let lastState = entries[0][1];

	for (let i = 1; i < entries.length; i++) {
		const [timestamp, state] = entries[i];
		if (lastState) {
			inactiveTime += timestamp - lastTimestamp;
		}
		lastTimestamp = timestamp;
		lastState = state;
	}

	// If the last state is inactive, add the time until now
	if (lastState) {
		inactiveTime += Date.now() - lastTimestamp;
	}

	const totalTime = Date.now() - entries[0][0];
	return (inactiveTime / totalTime) * 100;
}

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

// listen to navigation events
chrome.webNavigation.onCompleted.addListener((details) => {
	chrome.tabs.get(details.tabId, (tab) => {
		// ignore the newtab page
		if (tab.url !== "chrome://newtab/") {
			if (lastTab) {
				const timeSpent = Date.now() - lastTab.ts.getTime();
				const lastTabFull = timePerTab.get(lastTab.id);
				timePerTab.set(lastTab.id, {
					time: (lastTabFull?.time || 0) + timeSpent,
					url: lastTabFull?.url || "",
					title: lastTabFull?.title || "",
				});

				lastTab = {
					id: details.tabId,
					ts: lastTab.ts,
				};
			} else {
				lastTab = {
					id: details.tabId,
					ts: new Date(),
				};
			}

			if (!timePerTab.has(details.tabId)) {
				timePerTab.set(details.tabId, {
					time: 0,
					url: tab.url || "",
					title: tab.title || "",
				});
			}

			// check if its in the map and if it is update it
			const tabData = timePerTab.get(details.tabId);
			if (tabData) {
				timePerTab.set(details.tabId, {
					time: tabData.time,
					url: tab.url || "",
					title: tab.title || "",
				});
			}
		}
	});
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

			// filter to be only whitelisted tabs
			const filteredTabs = Array.from(timePerTab.entries()).filter(([_, tab]) =>
				whitelist.some((item) => tab.url.startsWith(item.url)),
			);

			console.log("Filtered tabs", filteredTabs);
			console.log("Time per tab", Array.from(timePerTab.entries()));

			const inactivePercentage = calculateInactivePercentage();

			if (filteredTabs.length !== 0) {
				// get largest amount of time tab
				const [tabId, tabData] = Array.from(filteredTabs).reduce((a, b) =>
					a[1].time > b[1].time ? a : b,
				);

				// check if the user has been inactive for 2 minutes
				if (tabData.time > inactiveTabTime) {
					if (inactivePercentage < 50) {
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
						console.log("User inactive for too long", inactivePercentage, "%");
					}
				} else {
					console.log(
						"Tab inactive",
						tabData.time,
						"< inactiveTime",
						inactiveTabTime,
					);
				}
			} else {
				console.log("No allowed tabs");
			}

			// Clear the time per tab after heartbeat
			timePerTab.clear();

			// set current tab as last tab and add it to the map
			lastTab = {
				id: tab.id,
				ts: new Date(),
			};

			activityChangeMap.clear();
			if (isInactive) {
				activityChangeMap.set(Date.now(), true);
			}

			timePerTab.set(tab.id, {
				time: 0,
				url: tab.url || "",
				title: tab.title || "",
			});

			activityChangeMap.set(Date.now(), false);
		}
	});
}, heartbeatInterval);
