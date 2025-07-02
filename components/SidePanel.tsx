// components/SidePanel.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus, Search, Globe, MessageSquare } from "lucide-react";
import { useSettingsModal } from "@/contexts/SettingsModalContext";
import { useChatHistory } from "@/contexts/ChatHistoryContext"; // 1. Import the hook
import { Avatar } from "./Avatar";
import { User } from "@/app/generated/prisma";

interface SidePanelProps {
  user: User;
}

export function SidePanel({ user }: SidePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useSettingsModal();
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Get all data and loading state from the context
  const { chatHistory, loading } = useChatHistory();

  // 3. REMOVED: All local useState for chatHistory, loading, and the useEffect hook.

  const filteredChats = chatHistory.filter((chat) =>
    (chat.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`h-screen bg-transparent border-r border-dark-border flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? "w-68" : "w-20"
      }`}
    >
      {/* ... rest of the JSX is identical ... */}
      {/* ... it will now automatically re-render when the context data changes ... */}
      {/* Header */}
      <div
        className={`p-4 h-[69px] flex items-center ${
          isExpanded ? "justify-between" : "justify-center"
        }`}
      >
        {isExpanded && (
          <Link
            href="/app"
            className="text-xl font-logo font-bold text-dark-text-default"
          >
            AURA
          </Link>
        )}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-2 hover:bg-dark-surface-hover rounded-lg transition-colors"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <Menu className="text-dark-text-secondary" size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Primary Actions & Navigation */}
        <div className="p-2">
          {isExpanded ? (
            // Expanded View
            <div className="space-y-2">
              <Link
                href="/characters/create"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium transition-colors bg-primary-default hover:bg-primary-dark text-primary-foreground"
              >
                <Plus size={20} />
                Create
              </Link>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 pl-10 bg-dark-surface-hover text-dark-text-default placeholder-dark-text-secondary rounded-lg border border-dark-border focus:outline-none focus:border-primary-default transition-colors"
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-secondary"
                  size={20}
                />
              </div>
              <nav className="pt-2 space-y-1">
                <Link
                  href="/discover"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface-hover text-dark-text-default transition-colors"
                >
                  <Globe size={20} />
                  <span className="truncate">Discover</span>
                </Link>
                <Link
                  href="/assistant"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface-hover text-dark-text-default transition-colors"
                >
                  <MessageSquare size={20} />
                  <span className="truncate">Assistant</span>
                </Link>
              </nav>
            </div>
          ) : (
            // Collapsed View
            <div className="flex flex-col items-center space-y-2">
              <Link
                href="/characters/create"
                title="Create"
                className="h-10 w-10 flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-default hover:bg-primary-dark text-primary-foreground"
              >
                <Plus size={20} />
              </Link>
              <button
                onClick={() => setIsExpanded(true)}
                className="h-10 w-10 flex items-center justify-center hover:bg-dark-surface-hover rounded-lg text-dark-text-secondary"
                aria-label="Search"
                title="Search"
              >
                <Search size={20} />
              </button>
              <Link
                href="/discover"
                title="Discover"
                className="h-10 w-10 flex items-center justify-center hover:bg-dark-surface-hover rounded-lg text-dark-text-default transition-colors"
              >
                <Globe size={20} />
              </Link>
              <Link
                href="/assistant"
                title="Assistant"
                className="h-10 w-10 flex items-center justify-center hover:bg-dark-surface-hover rounded-lg text-dark-text-default transition-colors"
              >
                <MessageSquare size={20} />
              </Link>
            </div>
          )}
        </div>

        {/* Chat History (Visible only when expanded) */}
        <nav className="flex-grow">
          {isExpanded && (
            <div className="mt-4 px-2">
              <h3 className="px-2 mb-2 text-sm font-medium text-dark-text-secondary">
                Chat History
              </h3>
              <div className="space-y-1">
                {loading ? (
                  <div className="px-2 text-xs text-dark-text-secondary">
                    Loading...
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="px-2 text-xs text-dark-text-secondary">
                    No chats found.
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                      className="block w-full text-left p-2 rounded-lg hover:bg-dark-surface-hover text-dark-text-default transition-colors text-sm truncate"
                      title={chat.title ?? "Untitled Chat"}
                    >
                      {chat.title ?? "Untitled Chat"}
                      {chat.character && (
                        <span className="ml-2 text-xs text-dark-text-secondary">
                          ({chat.character.name})
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {isExpanded && (
        <div className="text-xs text-dark-text-secondary flex flex-row items-stretch justify-center">
          <Link
            href={"/privacy-policy"}
            className="hover:text-dark-text-default"
          >
            Privacy Policy
          </Link>
          <p className="px-2">•</p>
          <Link
            href={"/terms-of-service"}
            className="hover:text-dark-text-default"
          >
            Terms of Service
          </Link>
        </div>
      )}

      <div className="flex flex-row justify-center items-center mt-2">
        <hr className="text-dark-border w-[80%]" />
      </div>

      {/* Footer Section */}
      <div className="m-2 flex justify-center">
        {/* User Profile */}
        <div
          className={`hover:cursor-pointer flex items-center gap-3 p-4 justify-center w-full py-2.5 px-4 rounded-lg ${
            isExpanded && "hover:bg-dark-surface-hover"
          }`}
          onClick={() => openModal("identity")}
        >
          <Avatar
            size={32}
            avatarName={user.name || "Guest"}
            avatarSrc={user.image}
          />
          {isExpanded && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-dark-text-default truncate">
                {user.name || "Guest"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
