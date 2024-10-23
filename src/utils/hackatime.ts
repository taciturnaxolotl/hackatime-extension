export interface Heartbeat {
	branch: string;
	category: string;
	editor: string;
	language: string;
	is_write: boolean;
	cursorpos: number;
	entity: string;
	type: string;
	lineno: number;
	lines: number;
	project: string;
	time: number;
	user_agent: string;
}

export async function sendHeartbeat(
	heartbeatPart: Omit<Heartbeat, "time" | "user_agent">,
	token: string,
) {
	// Add the current timestamp and user agent to the heartbeat
	const heartbeat: Heartbeat = {
		...heartbeatPart,
		time: getNanosecondTimestamp(),
		user_agent: navigator.userAgent,
	};

	const response = await fetch("https://waka.hackclub.com/api/heartbeat", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(heartbeat),
	});

	if (!response.ok) {
		console.error("Failed to send heartbeat", await response.text());
	} else {
		console.log("Heartbeat sent successfully");
	}
}

function getNanosecondTimestamp(): number {
	const nowSeconds = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
	const highResTime = performance.now(); // High precision time in milliseconds
	const milliseconds = Math.floor(highResTime % 1000);
	const nanoseconds = Math.floor((highResTime % 1) * 1e9); // Convert fractional milliseconds to nanoseconds
	const nanoStr = String(nanoseconds).padStart(9, "0"); // Ensure nanoseconds are 9 digits

	// Combine Unix timestamp with high-res nanosecond part
	return Number(`${nowSeconds}.${milliseconds}${nanoStr}`);
}
