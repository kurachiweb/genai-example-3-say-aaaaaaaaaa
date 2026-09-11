import { z } from "zod";
import { hasRepeatedRun, MIN_RUN_LENGTH } from "./repeated-run";

export const MAX_MESSAGE_LENGTH = 500;

export const createMessageSchema = z.object({
	content: z
		.string()
		.min(1, "メッセージを入力してください")
		.refine(
			(value) => Array.from(value).length <= MAX_MESSAGE_LENGTH,
			`メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`,
		)
		.refine(
			(value) => hasRepeatedRun(value),
			`同じ文字（アルファベット・漢字・ひらがな・カタカナ・ハングル）を${MIN_RUN_LENGTH}文字以上連続で入力してください`,
		),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const listMessagesQuerySchema = z.object({
	cursor: z.string().optional(),
});
