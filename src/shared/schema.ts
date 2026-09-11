import { z } from "zod";
import { hasRepeatedRun, MIN_RUN_LENGTH } from "./repeated-run";

export const MAX_MESSAGE_LENGTH = 500;

export const createMessageSchema = z.object({
	content: z
		.string()
		.min(1, "Please enter a message")
		.refine(
			(value) => Array.from(value).length <= MAX_MESSAGE_LENGTH,
			`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
		)
		.refine(
			(value) => hasRepeatedRun(value),
			`Enter the same character (letters, kanji, hiragana, katakana, or hangul) ${MIN_RUN_LENGTH} or more times in a row`,
		),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const listMessagesQuerySchema = z.object({
	cursor: z.string().optional(),
});
