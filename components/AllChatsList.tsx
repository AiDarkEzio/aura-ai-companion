// components/AllChatsList.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2, ServerCrash } from "lucide-react";
import { toast } from "sonner";
import {
  getPaginatedChats,
  deleteChatAction,
} from "@/app/actions/chat-actions";
import { Avatar } from "./Avatar";
import { useAppContext } from "@/contexts/AppContext";
import { timeAgo } from "@/lib/utils";

type ChatWithCharacter = Awaited<ReturnType<typeof getPaginatedChats>>[number];

interface AllChatsListProps {
  initialChats: ChatWithCharacter[];
  pageSize: number;
}

export function AllChatsList({ initialChats, pageSize }: AllChatsListProps) {
  const [chats, setChats] = useState<ChatWithCharacter[]>(initialChats);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialChats.length === pageSize);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const { refreshChatHistory } = useAppContext();

  const handleDelete = (
    chatIdToDelete: string,
    characterIdToDelete: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this chat and all its messages? This cannot be undone."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const originalChats = chats;
      // Optimistic update
      setChats((currentChats) =>
        currentChats.filter((chat) => chat.id !== chatIdToDelete)
      );

      const result = await deleteChatAction(
        chatIdToDelete,
        characterIdToDelete
      );

      if (result?.error) {
        toast.error(result.error);
        // Revert on error
        setChats(originalChats);
      } else {
        toast.success("Chat deleted successfully.");
        // Refresh the sidebar history
        await refreshChatHistory();
      }
    });
  };

  const loadMoreChats = useCallback(async () => {
    // Prevent loading more while a delete is pending
    if (isLoading || !hasMore || isPending) return;
    setIsLoading(true);

    try {
      const newChats = await getPaginatedChats(page, pageSize);
      if (newChats.length > 0) {
        setChats((prev) => [...prev, ...newChats]);
        setPage((prev) => prev + 1);
        if (newChats.length < pageSize) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more chats:", error);
      toast.error("Failed to load more chats.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, pageSize, isPending]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreChats();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMoreChats]);

  if (initialChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-border dark:border-dark-border p-12 text-center">
        <ServerCrash className="mx-auto h-12 w-12 text-light-text-secondary dark:text-dark-text-secondary" />
        <h3 className="mt-4 text-lg font-medium text-light-text-default dark:text-dark-text-default">
          No chats yet
        </h3>
        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Start a new conversation to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="group flex items-center justify-between gap-4 rounded-lg bg-light-surface p-4 transition-all duration-200 hover:bg-light-surface-hover hover:shadow-md dark:bg-dark-surface dark:hover:bg-dark-surface-hover"
          >
            <Link
              href={`/chat/${chat.id}`}
              className="flex flex-grow items-center gap-4 overflow-hidden"
            >
              <Avatar
                avatarName={chat.character.name}
                avatarSrc={chat.character.image}
                iconName={chat.character.icon}
                size={48}
              />
              <div className="flex-grow overflow-hidden">
                <p className="truncate font-semibold text-light-text-default dark:text-dark-text-default">
                  {chat.title || `Chat with ${chat.character.name}`}
                </p>
                <p className="mt-1 truncate text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Chatting with{" "}
                  <span className="font-medium text-light-text-default dark:text-dark-text-default">
                    {chat.character.name}
                  </span>{" "}
                  · {chat._count.messages} messages
                </p>
              </div>
            </Link>

            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="hidden text-right text-sm text-light-text-secondary sm:block dark:text-dark-text-secondary">
                <p>{timeAgo(chat.lastMessageAt)}</p>
              </div>
              {
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(chat.id, chat.character.id);
                  }}
                  disabled={isPending}
                  className="rounded-full p-2 text-light-text-secondary transition-opacity hover:bg-light-bg hover:text-error-fg disabled:cursor-not-allowed disabled:opacity-50 dark:text-dark-text-secondary dark:hover:bg-dark-bg"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              }
            </div>
          </li>
        ))}
      </ul>

      {/* Loader and End-of-List Indicator */}
      <div ref={loaderRef} className="flex h-20 items-center justify-center">
        {(isLoading || isPending) && (
          <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              {isPending ? "Deleting chat..." : "Loading more chats..."}
            </span>
          </div>
        )}
        {!isLoading && !isPending && !hasMore && chats.length > 0 && (
          <div className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <p>You've reached the end of your chat history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
