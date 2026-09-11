import type { ListMessagesResult, Message } from "../../shared/types";
import type {
	BoardService,
	MessageRepository,
	PostMessageResult,
	RateLimiter,
} from "../types";

export class BoardServiceImpl implements BoardService {
	constructor(
		private readonly repository: MessageRepository,
		private readonly rateLimiter: RateLimiter,
	) {}

	postMessage(content: string, ip: string): PostMessageResult {
		if (!this.rateLimiter.consume(ip)) {
			return { ok: false, reason: "rate_limited" };
		}

		const message: Message = {
			id: crypto.randomUUID(),
			content,
			createdAt: Date.now(),
		};
		this.repository.insert(message);

		return { ok: true, message };
	}

	listMessages(limit: number, cursor: string | null): ListMessagesResult {
		return this.repository.list({ limit, cursor });
	}
}
