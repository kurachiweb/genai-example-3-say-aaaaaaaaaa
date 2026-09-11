import { findRepeatedRuns } from "@shared/repeated-run";
import type { Message } from "@shared/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
	timeZone: "Asia/Tokyo",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});

interface MessageItemProps {
	message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
	const segments = buildSegments(message.content);

	return (
		<li className="border-b border-border py-4">
			<p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
				{segments.map((segment, index) =>
					segment.bold ? (
						<strong key={index} className="text-[32px] leading-tight font-bold">
							{segment.text}
						</strong>
					) : (
						<span key={index}>{segment.text}</span>
					),
				)}
			</p>
			<time
				dateTime={new Date(message.createdAt).toISOString()}
				className="mt-1 block text-sm text-foreground/60"
			>
				{dateFormatter.format(message.createdAt)}
			</time>
		</li>
	);
}

interface Segment {
	text: string;
	bold: boolean;
}

function buildSegments(content: string): Segment[] {
	const chars = Array.from(content);
	const runs = findRepeatedRuns(content);
	const segments: Segment[] = [];

	let cursor = 0;
	for (const run of runs) {
		if (run.start > cursor) {
			segments.push({
				text: chars.slice(cursor, run.start).join(""),
				bold: false,
			});
		}
		segments.push({
			text: chars.slice(run.start, run.end).join(""),
			bold: true,
		});
		cursor = run.end;
	}
	if (cursor < chars.length) {
		segments.push({ text: chars.slice(cursor).join(""), bold: false });
	}

	return segments;
}
