// components/AppLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  // CirclePlusIcon,
  Search,
  BrainCircuit,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  // BotIcon,
  InboxIcon,
  HomeIcon,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar } from "./Avatar";
import { usePathname } from "next/navigation";
import { AppHeader } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // New state to manage the visibility of the chat history search input
  const [isSearching, setIsSearching] = useState(false);
  const { user, chatHistory, loadingHistory, openSettingsModal } =
    useAppContext();

  const filteredChats = chatHistory.filter((chat) =>
    (chat.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans flex h-screen bg-light-bg dark:bg-dark-bg">
      <aside
        className={`h-screen bg-transparent border-r border-light-border dark:border-dark-border flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "w-68" : "w-20"
        }`}
      >
        <div
          className={`p-4 h-[69px] flex items-center ${
            isExpanded ? "justify-between" : "justify-center"
          }`}
        >
          {isExpanded && (
            <Link
              href="/app"
              className="text-xl font-logo font-bold text-light-text-default dark:text-dark-text-default"
            >
              AURA
            </Link>
          )}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-2 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <PanelLeftCloseIcon
                className="text-light-text-default dark:text-dark-text-default"
                size={20}
              />
            ) : (
              <PanelLeftOpenIcon
                className="text-light-text-default dark:text-dark-text-default"
                size={20}
              />
            )}
          </button>
        </div>

        <div className="flex flex-row justify-center items-center mt-2">
          <hr className="border-light-border dark:border-dark-border w-[80%]" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Primary Actions & Navigation */}
          <div className="p-2">
            {isExpanded ? (
              // Expanded View
              <div className="space-y-2">
                <nav className="pt-2 space-y-1">
                  {/* <Link
                    href="/characters/create"
                    title="Create Characters"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors"
                  >
                    <CirclePlusIcon size={20} />
                    <span className="truncate">Create</span>
                  </Link> */}
                  <Link
                    href="/memories"
                    title="Memories"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors"
                  >
                    <BrainCircuit size={20} />
                    <span className="truncate">Memories</span>
                  </Link>
                  {/* <Link
                    href="/assistant"
                    title="Assistant"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors"
                  >
                    <BotIcon size={20} />
                    <span className="truncate">Assistant</span>
                  </Link> */}
                  <Link
                    href="/dashboard/billing"
                    title="Transactions"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors"
                  >
                    <Wallet size={20} />
                    <span className="truncate">Billing & Usage</span>
                  </Link>
                  {user.role === 'ADMIN' && (<Link
                    href="/admin/contacts"
                    title="Contacts (admin)"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors"
                  >
                    <InboxIcon size={20} />
                    <span className="truncate">Contacts</span>
                  </Link>)}
                </nav>
              </div>
            ) : (
              // Collapsed View
              <div className="flex flex-col items-center space-y-2">
                <Link
                  href="/app"
                  title="Home Page (app)"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <HomeIcon size={20} />
                </Link>
                {/* <Link
                  href="/characters/create"
                  title="Create"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <CirclePlusIcon size={20} />
                </Link> */}
                <Link
                  href="/memories"
                  title="Memories"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <BrainCircuit size={20} />
                </Link>
                {/* <Link
                  href="/assistant"
                  title="Assistant"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <BotIcon size={20} />
                </Link> */}
                <Link
                  href="/chats"
                  title="View all chats"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <MessagesSquare size={20} />
                </Link>
                <Link
                  href="/dashboard/billing"
                  title="Transactions"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <Wallet size={20} />
                </Link>
                {user.role === 'ADMIN' && (<Link
                  href="/admin/contacts"
                  title="Contacts (admin)"
                  className="h-10 w-10 flex items-center justify-center hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg text-light-text-default dark:text-dark-text-default transition-colors"
                >
                  <InboxIcon size={20} />
                </Link>)}
              </div>
            )}
          </div>

          <nav className="flex-grow">
            {isExpanded && chatHistory.length > 0 && (
              <div className="mt-4 px-2">
                <div className="flex items-center justify-between px-2 mb-2 h-8">
                  {isSearching ? (
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search chats..."
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => setIsSearching(false)}
                        className="w-full py-1 pl-8 text-sm bg-light-surface dark:bg-dark-surface text-light-text-default dark:text-dark-text-default placeholder-light-text-secondary dark:placeholder-dark-text-secondary rounded-lg border border-light-border dark:border-dark-border focus:outline-none focus:border-primary-default transition-colors"
                      />
                      <Search
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary"
                        size={16}
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Chat History
                      </h3>
                      <button
                        onClick={() => setIsSearching(true)}
                        className="p-1 rounded-md hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
                        title="Search chats"
                      >
                        <Search
                          size={16}
                          className="text-light-text-secondary dark:text-dark-text-secondary"
                        />
                      </button>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  {loadingHistory ? (
                    <div className="px-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      Loading...
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="px-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {searchQuery ? "No chats found." : "No recent chats."}
                    </div>
                  ) : (
                    filteredChats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className="block w-full text-left p-2 rounded-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover text-light-text-default dark:text-dark-text-default transition-colors text-sm truncate"
                        title={chat.title ?? "Untitled Chat"}
                      >
                        {chat.title ?? "Untitled Chat"}
                        {chat.character && (
                          <span className="ml-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            ({chat.character.name})
                          </span>
                        )}
                      </Link>
                    ))
                  )}
                </div>
                {!loadingHistory && chatHistory.length > 0 && (
                  <Link
                    href="/chats"
                    className="block w-full text-center p-2 mt-2 rounded-lg text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover hover:text-light-text-default dark:hover:text-dark-text-default transition-colors"
                  >
                    View all chats
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>

        <div className="px-2 mb-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex flex-row items-center justify-center">
          <p className="text-accent-default border border-accent-default text-center rounded-full bg-accent-default/10 hover:bg-accent-default/20 hover:cursor-pointer p-1 px-2">
            {isExpanded ? "Available Credits: " + user.credits : user.credits}
          </p>
        </div>

        {isExpanded && (
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex flex-row items-stretch justify-center">
            <Link
              href={"/privacy-policy"}
              className="hover:text-light-text-default dark:hover:text-dark-text-default"
            >
              Privacy Policy
            </Link>
            <p className="px-2">•</p>
            <Link
              href={"/terms-of-service"}
              className="hover:text-light-text-default dark:hover:text-dark-text-default"
            >
              Terms of Service
            </Link>
          </div>
        )}

        <div className="flex flex-row justify-center items-center mt-2">
          <hr className="border-light-border dark:border-dark-border w-[80%]" />
        </div>

        {/* Footer Section */}
        <div className="m-2 flex justify-center">
          <div
            className={`hover:cursor-pointer flex items-center gap-3 p-4 justify-center w-full py-2.5 px-4 rounded-lg ${
              isExpanded &&
              "hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
            }`}
            onClick={() => openSettingsModal("identity")}
          >
            <Avatar
              size={32}
              avatarName={user.name || "Guest"}
              avatarSrc={user.image}
            />
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-light-text-default dark:text-dark-text-default truncate">
                  {user.name || "Guest"}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 max-h-screen overflow-y-scroll bg-light-bg dark:bg-dark-bg">
        {pathname.startsWith("/app") ? <AppHeader /> : ""}
        {children}
      </main>
    </div>
  );
}
