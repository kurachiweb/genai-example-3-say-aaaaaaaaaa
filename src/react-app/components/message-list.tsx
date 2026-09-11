import { useEffect, useRef } from "react";
import { MessageItem } from "@/components/message-item";
import type { Message } from "@shared/types";

interface MessageListProps {
	messages: Message[];
	isLoading: boolean;
	hasMore: boolean;
	error: string | null;
	onLoadMore: () => void;
}

export function MessageList({
	messages,
	isLoading,
	hasMore,
	error,
	onLoadMore,
}: MessageListProps) {
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore();
				}
			},
			{ rootMargin: "200px" },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [onLoadMore]);

	return (
		<div>
			<ul>
				{messages.map((message) => (
					<MessageItem key={message.id} message={message} />
				))}
			</ul>

			{error && <p className="py-4 text-primary">{error}</p>}

			{!isLoading && !error && messages.length === 0 && (
				<p className="py-4 text-center text-foreground/60">
					まだ投稿がありません。
				</p>
			)}

			{hasMore && <div ref={sentinelRef} aria-hidden className="h-1" />}

			{isLoading && (
				<p className="py-4 text-center text-foreground/60">読み込み中…</p>
			)}
		</div>
	);
}
