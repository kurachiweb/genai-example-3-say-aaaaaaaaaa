import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postMessage } from "@/lib/api";
import { createMessageSchema, MAX_MESSAGE_LENGTH } from "@shared/schema";

interface MessageFormProps {
	onPosted: () => void | Promise<void>;
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
			await onPosted();
			return;
		}

		setErrorMessage(
			outcome.reason === "rate_limited"
				? "Too many posts. Please try again later."
				: "Failed to post. Please check your message and try again.",
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-2">
			<p>Enter the same character 10 or more times in a row.</p>
			<Textarea
				value={content}
				onChange={(event) => setContent(event.target.value)}
				placeholder="e.g. Hellooooooooooooooooo!"
				aria-label="Message to post"
				maxLength={MAX_MESSAGE_LENGTH}
				rows={3}
			/>
			<Button type="submit" disabled={!canSubmit}>
				{isSubmitting ? "Sending…" : "Scream!!!"}
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
