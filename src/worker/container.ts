import { Container } from "inversify";
import { SqliteMessageRepository } from "./repositories/message-repository";
import { BoardServiceImpl } from "./services/board-service";
import { SqliteRateLimiter } from "./services/rate-limiter";
import type { BoardService, MessageRepository, RateLimiter } from "./types";
import { TYPES } from "./types";

/**
 * Durable Object インスタンスごとに SqlStorage を束縛したコンテナを生成する。
 * Inversify の decorator ベースの DI は esbuild が emitDecoratorMetadata を
 * サポートしないため使わず、toDynamicValue による明示的な依存解決を用いる。
 */
export function createBoardContainer(sql: SqlStorage): Container {
	const container = new Container();

	container
		.bind<MessageRepository>(TYPES.MessageRepository)
		.toDynamicValue(() => new SqliteMessageRepository(sql))
		.inSingletonScope();

	container
		.bind<RateLimiter>(TYPES.RateLimiter)
		.toDynamicValue(() => new SqliteRateLimiter(sql))
		.inSingletonScope();

	container
		.bind<BoardService>(TYPES.BoardService)
		.toDynamicValue(
			(context) =>
				new BoardServiceImpl(
					context.get(TYPES.MessageRepository),
					context.get(TYPES.RateLimiter),
				),
		)
		.inSingletonScope();

	return container;
}
