import { DurableObject } from "cloudflare:workers";
import type { ListMessagesResult } from "../../shared/types";
import { createBoardContainer } from "../container";
import type { BoardService, PostMessageResult } from "../types";
import { TYPES } from "../types";

export class BoardDurableObject extends DurableObject<Env> {
	private readonly boardService: BoardService;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.boardService = createBoardContainer(ctx.storage.sql).get(
			TYPES.BoardService,
		);
	}

	postMessage(content: string, ip: string): PostMessageResult {
		return this.boardService.postMessage(content, ip);
	}

	listMessages(limit: number, cursor: string | null): ListMessagesResult {
		return this.boardService.listMessages(limit, cursor);
	}
}
