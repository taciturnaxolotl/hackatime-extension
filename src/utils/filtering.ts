import type { Heartbeat } from "./hackatime";

type Editors = "sprig" | "blot";

export const whitelist: {
	name: Editors;
	url: string;
}[] = [
	{ name: "sprig", url: "https://sprig.hackclub.com/editor" },
	{ name: "sprig", url: "https://sprig.hackclub.com/~/" },
	{ name: "blot", url: "https://blot.hackclub.com/editor" },
];

export async function getPartialHeartbeat(
	tabID: number,
): Promise<Omit<Heartbeat, "time" | "user_agent"> | undefined> {
	return new Promise((resolve, reject) => {
		chrome.tabs.get(tabID, async (tab) => {
			if (!tab) {
				resolve(undefined);
				return;
			}

			// find editor
			const editor =
				whitelist.find((item) => tab.url?.startsWith(item.url))?.name ||
				"unknown";

			let res: { lineCount: number; projectName: string };

			try {
				switch (editor) {
					case "sprig":
						res = await chrome.tabs.sendMessage(tabID, { action: "sprig" });
						console.log(res);
						break;
					case "blot":
						res = await chrome.tabs.sendMessage(tabID, { action: "blot" });
						break;
					default:
						console.log("Editor not found");
						res = { lineCount: 0, projectName: "unknown" };
				}

				const browserType = navigator.userAgent.includes("Firefox")
					? "firefox"
					: navigator.userAgent.includes("Edg")
						? "edge"
						: navigator.userAgent.includes("Vivaldi")
							? "vivaldi"
							: "chrome";

				resolve({
					branch: "web",
					category: "coding",
					editor: browserType,
					language: editor,
					is_write: true,
					cursorpos: 0,
					entity: tab.url || "",
					type: "domain",
					lineno: 0,
					lines: res.lineCount,
					project: res.projectName,
				});
			} catch (error) {
				reject(error);
			}
		});
	});
}
