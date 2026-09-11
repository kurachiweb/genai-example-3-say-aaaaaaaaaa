import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postMessage } from "@/lib/api";
import { createMessageSchema, MAX_MESSAGE_LENGTH } from "@shared/schema";
import type { Message } from "@shared/types";

interface MessageFormProps {
	onPosted: (message: Message) => void;
}

export function MessageForm({ onPosted }: MessageFormProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const validation = createMessageSchema.safeParse({ content });
	const charCount = Array.from(content).length;
	const canSubmit = validation.success && !isSubmitting;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) {
			return;
		}

		setIsSubmitting(true);
		setErrorMessage(null);

		const outcome = await postMessage(content);
		setIsSubmitting(false);

		if (outcome.ok) {
			setContent("");
			onPosted(outcome.message);
			return;
		}

		setErrorMessage(
			outcome.reason === "rate_limited"
				? "投稿が多すぎます。しばらくしてからもう一度お試しください。"
				: "投稿に失敗しました。内容を確認してもう一度お試しください。",
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-2">
			<Textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				placeholder="同じ文字を10文字以上連続で入力してください（例: aaaaaaaaaa）"
				aria-label="投稿するメッセージ"
				maxLength={MAX_MESSAGE_LENGTH}
				rows={3}
			/>
			<Button type="submit" disabled={!canSubmit}>
				{isSubmitting ? "送信中…" : "送信"}
			</Button>
			<p className="text-sm text-foreground/60">
				{charCount} / {MAX_MESSAGE_LENGTH}
				{content.length > 0 && !validation.success && (
					<span className="ml-2 text-primary">
						{validation.error.issues[0]?.message}
					</span>
				)}
			</p>
			{errorMessage && <p className="text-sm text-primary">{errorMessage}</p>}
		</form>
	);
}
