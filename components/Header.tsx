// components/Header.tsx
"use client";

import Link from "next/link";
// Combined and added necessary lucide-react imports
import {
  Moon,
  Sun,
  Laptop,
  MoreVertical,
} from "lucide-react";
import { useTheme } from "./ThemeProvider"; // Assuming this path is correct relative to Header.tsx
import { useEffect, useState } from "react";
import { Theme } from "@/app/generated/prisma"; // Assuming this path is correct
import { Character } from "@/app/generated/prisma"; // Assuming this path is correct
import { ChatWithDetails } from "@/app/actions/chat-actions";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { Avatar } from "./Avatar";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const cycleTheme = () => {
    const newTheme: Theme =
      theme === "LIGHT" ? "DARK" : theme === "DARK" ? "SYSTEM" : "LIGHT";
    setTheme(newTheme);
  };

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[4rem] max-h-[4rem] overflow-hidden ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b dark:border-dark-text-default border-light-text-default/20 shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="container mx-auto px-5 h-full flex justify-between items-center">
        <Link href="/" className="text-2xl font-logo font-bold">
          AURA
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/features"
            className="text-lg font-semibold hover:text-primary-dark dark:hover:text-primary-light transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-lg font-semibold hover:text-primary-dark dark:hover:text-primary-light transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-lg font-semibold hover:text-primary-dark dark:hover:text-primary-light transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-lg font-semibold p-1 px-3 rounded-full bg-primary-default/80 text-light-text-default dark:text-dark-text-default hover:bg-primary-default/10 transition-transform duration-300 ease-in-out hover:scale-105 relative overflow-hidden border border-transparent hover:border-primary-default"
          >
            Log In
          </Link>
          <button
            onClick={cycleTheme}
            className="p-2 rounded-full bg-light-surface hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover transition-colors"
            aria-label="Toggle theme"
          >
            {isMounted &&
              (theme === "DARK" ? (
                <Laptop className="dark:text-primary-light text-primary-dark" />
              ) : theme === "LIGHT" ? (
                <Moon className="w-5 h-5 text-primary-dark" />
              ) : (
                <Sun className="w-5 h-5 dark:text-primary-light" />
              ))}
          </button>
        </div>
      </nav>
    </header>
  );
};

export const AppHeader = () => {
  return (
    <header className={`h-[4rem] max-h-[4rem] w-full bg-transparent py-3 `}>
      {/* Corrected typo dar: to dark: below */}
      <p className="h-full w-full">
        <span className="text-2xl mr-1 dark:text-dark-text-secondary text-light-text-secondary font-bold">
          Welcome,
        </span>{" "}
        <span className="text-lg dark:text-dark-text-default text-light-text-default font-semibold">
          Subhadra Poshitha
        </span>
      </p>
    </header>
  );
};

export const ChatHeader = ({ character, chat }: { character: Character, chat: ChatWithDetails }) => {
  const [title, setTitle] = useState<string>(chat?.title || character.description || character.characterType);

    const { chatHistory } = useChatHistory();
  
    useEffect(() => {
      const matchingChatInHistory = chatHistory.find((c) => c.id === chat.id);
      if (!matchingChatInHistory) return;
      setTitle((prevTitle) => matchingChatInHistory.title || prevTitle);
    }, [chatHistory, chat]);

  return (
    <header className="h-[4rem] max-h-[4rem] w-full bg-background/70 backdrop-blur-md py-3 px-4 flex items-center justify-between border-b dark:border-dark-border/50 border-light-border/50">
      <Link
        href={"/characters/"+character.id}
        className="flex items-center space-x-3 hover:cursor-pointer"
      >
        <div className="flex-shrink-0">
          <Avatar avatarName={character.name} avatarSrc={character.image} iconName={character.icon} size={36} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-md font-semibold leading-tight dark:text-dark-text-default text-light-text-default">
            {character.name}
          </h1>
          {/* Display character description as a short tagline. Tailwind's 'truncate' handles overflow. */}
            <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px] leading-tight">
              {title}
            </p>
        </div>
      </Link>

      {/* Optional: Placeholder for action buttons (e.g., settings, character info modal) */}

      <div className="flex items-center">
        <button
          aria-label="More options"
          className="p-2 rounded-full hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
        >
          <MoreVertical className="w-5 h-5 dark:text-dark-text-secondary text-light-text-secondary" />
        </button>
      </div>
    </header>
  );
};
