import { MessageForm } from "@/components/message-form";
import { MessageList } from "@/components/message-list";
import { TextExplosionLayer } from "@/components/text-explosion";
import { useMessages } from "@/hooks/use-messages";

function App() {
	const { messages, isLoading, hasMore, error, loadMore, refresh } =
		useMessages();

	return (
		<div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 px-4 py-4">
			<header className="flex flex-wrap justify-start items-baseline gap-x-1.5">
				<h1 className="text-2xl font-bold">Say aaaaaaaaaa</h1>
				<p className="text-xl">
					by{" "}
					<a
						href="https://kurachiweb.com"
						target="_blank"
						className="hover:underline"
					>
						KurachiWeb
					</a>
				</p>
			</header>

			<MessageForm onPosted={refresh} />

			<MessageList
				messages={messages}
				isLoading={isLoading}
				hasMore={hasMore}
				error={error}
				onLoadMore={loadMore}
			/>

			<TextExplosionLayer />
		</div>
	);
}

export default App;
