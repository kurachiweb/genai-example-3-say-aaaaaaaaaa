import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	createMessageSchema,
	listMessagesQuerySchema,
} from "../../shared/schema";

const MESSAGES_PAGE_SIZE = 20;

export const messagesRoute = new Hono<{ Bindings: Env }>()
	.get("/", zValidator("query", listMessagesQuerySchema), async (c) => {
		const { cursor } = c.req.valid("query");
		const stub = getBoardStub(c.env);
		const result = await stub.listMessages(MESSAGES_PAGE_SIZE, cursor ?? null);
		return c.json(result);
	})
	.post("/", zValidator("json", createMessageSchema), async (c) => {
		const { content } = c.req.valid("json");
		const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
		const stub = getBoardStub(c.env);
		const result = await stub.postMessage(content, ip);

		if (!result.ok) {
			return c.json({ error: result.reason }, 429);
		}
		return c.json({ message: result.message }, 201);
	});

function getBoardStub(env: Env) {
	const id = env.BOARD.idFromName("global");
	return env.BOARD.get(id);
}
