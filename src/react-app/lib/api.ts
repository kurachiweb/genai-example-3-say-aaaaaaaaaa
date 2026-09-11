import type { ListMessagesResult, Message } from "@shared/types";

export async function fetchMessages(
	cursor: string | null,
): Promise<ListMessagesResult> {
	const url = new URL("/api/messages", window.location.origin);
	if (cursor) {
		url.searchParams.set("cursor", cursor);
	}

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error("Failed to retrieve the message");
	}
	return (await res.json()) as ListMessagesResult;
}

export type PostMessageOutcome =
	| { ok: true; message: Message }
	| { ok: false; reason: "rate_limited" | "invalid" | "unknown" };

export async function postMessage(
	content: string,
): Promise<PostMessageOutcome> {
	const res = await fetch("/api/messages", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});

	if (res.ok) {
		const body = (await res.json()) as { message: Message };
		return { ok: true, message: body.message };
	}
	if (res.status === 429) {
		return { ok: false, reason: "rate_limited" };
	}
	if (res.status === 400) {
		return { ok: false, reason: "invalid" };
	}
	return { ok: false, reason: "unknown" };
}
