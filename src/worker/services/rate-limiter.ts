import type { RateLimiter } from "../types";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

interface CountRow {
	count: number;
}

export class SqliteRateLimiter implements RateLimiter {
	constructor(private readonly sql: SqlStorage) {
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS rate_limit_events (
				key TEXT NOT NULL,
				created_at INTEGER NOT NULL
			)
		`);
		this.sql.exec(
			`CREATE INDEX IF NOT EXISTS idx_rate_limit_key_created_at ON rate_limit_events (key, created_at)`,
		);
	}

	consume(key: string): boolean {
		const now = Date.now();

		this.sql.exec(
			"DELETE FROM rate_limit_events WHERE created_at < ?",
			now - WINDOW_MS,
		);

		const { count } = this.sql
			.exec(
				"SELECT COUNT(*) AS count FROM rate_limit_events WHERE key = ?",
				key,
			)
			.one() as unknown as CountRow;

		if (count >= MAX_REQUESTS_PER_WINDOW) {
			return false;
		}

		this.sql.exec(
			"INSERT INTO rate_limit_events (key, created_at) VALUES (?, ?)",
			key,
			now,
		);
		return true;
	}
}
