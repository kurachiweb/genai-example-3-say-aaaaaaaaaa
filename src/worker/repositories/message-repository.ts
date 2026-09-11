import type { ListMessagesResult, Message } from "../../shared/types";
import type { MessageRepository } from "../types";

interface MessageRow {
	id: string;
	content: string;
	createdAt: number;
}

export class SqliteMessageRepository implements MessageRepository {
	constructor(private readonly sql: SqlStorage) {
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS messages (
				id TEXT PRIMARY KEY,
				content TEXT NOT NULL,
				created_at INTEGER NOT NULL
			)
		`);
		this.sql.exec(
			`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC, id DESC)`,
		);
	}

	insert(message: Message): void {
		this.sql.exec(
			"INSERT INTO messages (id, content, created_at) VALUES (?, ?, ?)",
			message.id,
			message.content,
			message.createdAt,
		);
	}

	list({
		limit,
		cursor,
	}: {
		limit: number;
		cursor: string | null;
	}): ListMessagesResult {
		const fetchLimit = limit + 1;
		const rows = cursor
			? this.listBefore(cursor, fetchLimit)
			: this.listLatest(fetchLimit);

		const hasMore = rows.length > limit;
		const messages: Message[] = (hasMore ? rows.slice(0, limit) : rows).map(
			(row) => ({
				id: row.id,
				content: row.content,
				createdAt: row.createdAt,
			}),
		);

		const last = messages.at(-1);
		const nextCursor = hasMore && last ? encodeCursor(last) : null;

		return { messages, nextCursor };
	}

	private listLatest(limit: number): MessageRow[] {
		return this.sql
			.exec(
				`SELECT id, content, created_at AS createdAt FROM messages
				 ORDER BY created_at DESC, id DESC LIMIT ?`,
				limit,
			)
			.toArray() as unknown as MessageRow[];
	}

	private listBefore(cursor: string, limit: number): MessageRow[] {
		const { createdAt, id } = decodeCursor(cursor);
		return this.sql
			.exec(
				`SELECT id, content, created_at AS createdAt FROM messages
				 WHERE created_at < ?1 OR (created_at = ?1 AND id < ?2)
				 ORDER BY created_at DESC, id DESC LIMIT ?3`,
				createdAt,
				id,
				limit,
			)
			.toArray() as unknown as MessageRow[];
	}
}

function encodeCursor(message: Message): string {
	return `${message.createdAt}_${message.id}`;
}

function decodeCursor(cursor: string): { createdAt: number; id: string } {
	const separatorIndex = cursor.indexOf("_");
	return {
		createdAt: Number(cursor.slice(0, separatorIndex)),
		id: cursor.slice(separatorIndex + 1),
	};
}
