import { whitelist } from "./filtering";

export function updateIcon(
	url: string | undefined,
	cache: {
		cachedIconPath: string | null;
		cachedToken: string | null;
	},
	override?: boolean,
) {
	const isWhitelisted = whitelist.some((item) => url?.startsWith(item.url));
	const iconPath = cache.cachedToken
		? isWhitelisted
			? "icons/128.png"
			: "icons/gray.png"
		: "icons/gray.png";

	if (iconPath !== cache.cachedIconPath || override) {
		chrome.action.setIcon({ path: iconPath });
		cache.cachedIconPath = iconPath;
		updateHoverText(isWhitelisted, cache.cachedToken);
	}
}

export function updateHoverText(
	isWhitelisted: boolean,
	cachedToken: string | null,
) {
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

export function handleTabUpdate(
	url: string | undefined,
	cache: {
		cachedIconPath: string | null;
		cachedToken: string | null;
	},
) {
	if (cache.cachedToken === null) {
		chrome.storage.local.get("token", (result) => {
			cache.cachedToken = result.token || null;
			updateIcon(url, cache, true);
		});
	} else {
		updateIcon(url, cache);
	}
}
