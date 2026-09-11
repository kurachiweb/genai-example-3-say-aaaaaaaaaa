import type { ListMessagesResult, Message } from "../shared/types";

export const TYPES = {
	MessageRepository: Symbol.for("MessageRepository"),
	RateLimiter: Symbol.for("RateLimiter"),
	BoardService: Symbol.for("BoardService"),
} as const;

export interface MessageRepository {
	insert(message: Message): void;
	list(params: { limit: number; cursor: string | null }): ListMessagesResult;
}

export interface RateLimiter {
	/** 利用可能であれば true を返し、内部で利用回数を記録する */
	consume(key: string): boolean;
}

export interface PostMessageSuccess {
	ok: true;
	message: Message;
}

export interface PostMessageFailure {
	ok: false;
	reason: "rate_limited";
}

export type PostMessageResult = PostMessageSuccess | PostMessageFailure;

export interface BoardService {
	postMessage(content: string, ip: string): PostMessageResult;
	listMessages(limit: number, cursor: string | null): ListMessagesResult;
}
