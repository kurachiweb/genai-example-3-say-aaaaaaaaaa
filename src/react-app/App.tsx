import { MessageForm } from "@/components/message-form";
import { MessageList } from "@/components/message-list";
import { useMessages } from "@/hooks/use-messages";

function App() {
	const { messages, isLoading, hasMore, error, loadMore, prepend } =
		useMessages();

	return (
		<div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-4">
			<header>
				<h1 className="text-2xl font-bold">Say aaaaaaaaaa</h1>
			</header>

			<MessageForm onPosted={prepend} />

			<MessageList
				messages={messages}
				isLoading={isLoading}
				hasMore={hasMore}
				error={error}
				onLoadMore={loadMore}
			/>
		</div>
	);
}

export default App;
