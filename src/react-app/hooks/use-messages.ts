import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessages } from "@/lib/api";
import type { Message } from "@shared/types";

export function useMessages() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const initialized = useRef(false);

	const loadMore = useCallback(async () => {
		if (isLoading || !hasMore) {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await fetchMessages(cursor);
			setMessages((prev) => [...prev, ...result.messages]);
			setCursor(result.nextCursor);
			setHasMore(result.nextCursor !== null);
		} catch {
			setError("Failed to load messages.");
		} finally {
			setIsLoading(false);
		}
	}, [cursor, hasMore, isLoading]);

	useEffect(() => {
		if (initialized.current) {
			return;
		}
		initialized.current = true;
		void loadMore();
		// 初回マウント時にのみ最初のページを読み込む
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await fetchMessages(null);
			setMessages(result.messages);
			setCursor(result.nextCursor);
			setHasMore(result.nextCursor !== null);
		} catch {
			setError("Failed to load messages.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { messages, isLoading, hasMore, error, loadMore, refresh };
}
