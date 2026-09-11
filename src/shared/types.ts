export interface Message {
	id: string;
	content: string;
	/** 投稿日時（epoch milliseconds） */
	createdAt: number;
}

export interface ListMessagesResult {
	messages: Message[];
	nextCursor: string | null;
}
