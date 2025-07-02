// contexts/ChatHistoryContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getLast10ChatsWithCharacters } from "@/app/actions/chat-actions";
import { Chat, Character } from "@/app/generated/prisma";

type ChatWithCharacter = Chat & {
  character: Character | null;
};

interface ChatHistoryContextType {
  chatHistory: ChatWithCharacter[];
  loading: boolean;
  refreshChatHistory: () => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined
);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatWithCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    // Don't show a full loader on refresh, only on initial load.
    if (chatHistory.length === 0) {
      setLoading(true);
    }
    try {
      const chats =
        (await getLast10ChatsWithCharacters()) as ChatWithCharacter[];
      setChatHistory(chats || []);
    } catch (error) {
      console.error("Failed to fetch chat history in context:", error);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  }, [chatHistory.length]); // Depends on length to only show full loader once.

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount.

  const value = {
    chatHistory,
    loading,
    refreshChatHistory: fetchHistory,
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}
