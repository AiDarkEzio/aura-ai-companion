// app/(app)/chat/[chatId]/page.tsx

import { Chat } from "@/components/Chat";
import { getChatForUser } from "@/app/actions/chat-actions";
import { notFound } from "next/navigation";
import { Message as ClientMessage } from "@/lib/types";
import { MessageRating } from "@/app/generated/prisma";
import { ChatHeader } from "@/components/Header";
import { getUserIdFromSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const chatWithDetails = await getChatForUser(chatId);
  const user = await prisma.user.findUnique({ where: { id: (await getUserIdFromSession()) } })

  if (!chatWithDetails || !user) {
    notFound();
  }
  
  const { character, messages } = chatWithDetails;

  const initialMessages: ClientMessage[] = messages.map(
    (message) => ({
      id: message.id.toString(),
      role: message.role === "USER" ? "user" : "model",
      parts: [{ text: message.content }],
      rating: message.rating as MessageRating | null,
    })
  );

  return (
    <main className="flex max-h-screen h-screen flex-col">
      <ChatHeader character={character} chat={chatWithDetails} />
      <Chat
        character={character}
        currentUser={user}
        chatId={chatId}
        initialMessages={initialMessages}
      />
    </main>
  );
}