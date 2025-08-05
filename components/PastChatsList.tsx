// components/PastChatsList.tsx

"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare, Trash2 } from "lucide-react";
import { deleteChatAction } from "@/app/actions/chat-actions";
import Link from "next/link";
import { useAppContext } from "@/contexts/AppContext";

type ChatItem = {
  id: string;
  title: string | null;
  lastMessage: string;
  lastMessageAt: Date | null;
};

export const PastChatsList = ({
  initialChats,
  characterId,
}: {
  initialChats: ChatItem[];
  characterId: string;
}) => {
  const [chats, setChats] = useState(initialChats);
  const [isPending, startTransition] = useTransition();
  const { refreshChatHistory } = useAppContext();

  const handleDelete = (chatIdToDelete: string) => {
    if (
      !confirm("Are you sure you want to permanently delete this chat history?")
    ) {
      return;
    }

    startTransition(async () => {
      const originalChats = chats;
      setChats((currentChats) =>
        currentChats.filter((chat) => chat.id !== chatIdToDelete)
      );

      const result = await deleteChatAction(chatIdToDelete, characterId);

      if (result?.error) {
        toast.error(result.error);
        setChats(originalChats);
      } else {
        toast.success("Chat deleted successfully.");
        await refreshChatHistory();
      }
    });
  };

  if (chats.length === 0) {
    return null;
  }

  return (
    <ul className="mt-4 space-y-3">
      {chats.map((chat) => (
        <li
          key={chat.id}
          className="group flex items-center gap-4 rounded-lg bg-light-surface p-4 transition-colors hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-light-bg dark:bg-dark-bg">
            <MessageSquare className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
          </div>
          <Link href={`/chat/${chat.id}`} className="flex-grow overflow-hidden">
            <p className="truncate font-semibold text-light-text-default dark:text-dark-text-default">
              {chat.title ||
                `Conversation from ${chat.lastMessageAt?.toLocaleDateString()}`}
            </p>
            <p className="mt-1 truncate text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <span className="font-medium">Last message:</span>{" "}
              {chat.lastMessage}
            </p>
          </Link>
          <button
            onClick={() => handleDelete(chat.id)}
            disabled={isPending}
            className="rounded-full p-2 text-light-text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-light-surface-hover hover:text-error-fg disabled:opacity-50 dark:text-dark-text-secondary dark:hover:bg-dark-bg"
            aria-label="Delete chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  );
};
