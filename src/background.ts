// open the options page on install
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.tabs.create({
			url: "options/index.html",
		});
	}
});

const whitelist = [
	"https://sprig.hackclub.com/editor",
	"https://blot.hackclub.com/editor",
];
let cachedToken: string | null = null;
let cachedIconPath: string | null = null;

// Invalidate the cache every 30 seconds
setInterval(() => {
	cachedToken = null;
}, 30000);

// invalidate the icon cache every 5 minutes
setInterval(() => {
	cachedIconPath = null;
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
		handleTabUpdate(tab.url);
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
			handleTabUpdate(tab.url);
		}
	});
});

function handleTabUpdate(url: string | undefined) {
	if (cachedToken === null) {
		chrome.storage.local.get("token", (result) => {
			console.log(result);
			cachedToken = result.token || null;
			updateIcon(url, false);
		});
	} else {
		updateIcon(url);
	}
}

function updateIcon(url: string | undefined, override?: boolean) {
	const isWhitelisted = whitelist.some((whitelistUrl) =>
		url?.startsWith(whitelistUrl),
	);
	const iconPath = cachedToken
		? isWhitelisted
			? "icons/128.png"
			: "icons/gray.png"
		: "icons/gray.png";

	if (iconPath !== cachedIconPath || override) {
		chrome.action.setIcon({ path: iconPath });
		cachedIconPath = iconPath;
		updateHoverText(isWhitelisted);
	}
}

function updateHoverText(isWhitelisted: boolean) {
	if (cachedToken === null) {
		chrome.storage.local.set({
			status: {
				message: "Please enter your token in options",
				status: false,
			},
		});
	} else {
		if (isWhitelisted) {
			chrome.storage.local.set({
				status: {
					message: "This is an allowed website! Tracking your time",
					status: true,
				},
			});
		} else {
			chrome.storage.local.set({
				status: {
					message: "This is not an allowed website! Not tracking your time",
					status: false,
				},
			});
		}
	}
}
