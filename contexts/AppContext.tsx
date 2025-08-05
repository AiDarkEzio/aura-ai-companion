// contexts/AppContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getLastXChatsWithCharacters } from "@/app/actions/chat-actions";
import { getCurrentUser } from "@/app/actions/userActions";
import { Chat, Character, User } from "@/app/generated/prisma";

type ChatWithCharacter = Chat & {
  character: Character | null;
};

export type SettingsTab =
  | "identity"
  | "account"
  | "personalization"
  | "preferences"
  | "billing";

interface AppContextType {
  user: User;
  loadingUser: boolean;
  refreshUser: () => Promise<void>;

  chatHistory: ChatWithCharacter[];
  loadingHistory: boolean;
  refreshChatHistory: () => Promise<void>;

  isSettingsModalOpen: boolean;
  activeSettingsTab: SettingsTab;
  openSettingsModal: (tab?: SettingsTab) => void;
  closeSettingsModal: () => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialUser: User;
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [loadingUser, setLoadingUser] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatWithCharacter[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("identity");

  const refreshUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        console.warn("Could not refresh user, session may be invalid.");
      }
    } catch (error) {
      console.error("Failed to refresh user data in context:", error);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (chatHistory.length === 0) {
      setLoadingHistory(true);
    }
    try {
      const chats =
        (await getLastXChatsWithCharacters(20)) as ChatWithCharacter[];
      setChatHistory(chats || []);
    } catch (error) {
      console.error("Failed to fetch chat history in context:", error);
      setChatHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [chatHistory.length]);

  const openSettingsModal = useCallback((tab: SettingsTab = "identity") => {
    setActiveSettingsTab(tab);
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const value: AppContextType = {
    user,
    loadingUser,
    refreshUser,
    chatHistory,
    loadingHistory,
    refreshChatHistory: fetchHistory,
    isSettingsModalOpen,
    activeSettingsTab,
    openSettingsModal,
    closeSettingsModal,
    setActiveSettingsTab, 
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
