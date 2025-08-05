// app/(app)/chats/page.tsx

import { getPaginatedChats } from "@/app/actions/chat-actions";
import { AllChatsList } from "@/components/AllChatsList";
import { getUserIdFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const CHAT_PAGE_SIZE = 20;

export default async function AllChatsPage() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    redirect("/login");
  }

  const initialChats = await getPaginatedChats(1, CHAT_PAGE_SIZE);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-light-text-default dark:text-dark-text-default">
          All Chats
        </h1>
        <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
          Browse through your complete conversation history.
        </p>
      </header>

      <AllChatsList initialChats={initialChats} pageSize={CHAT_PAGE_SIZE} />
    </div>
  );
}
