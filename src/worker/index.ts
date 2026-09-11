import { Hono } from "hono";
import { messagesRoute } from "./routes/messages";

const app = new Hono<{ Bindings: Env }>().route("/api/messages", messagesRoute);

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "internal_server_error" }, 500);
});

export default app;
export { BoardDurableObject } from "./durable-objects/board-durable-object";
