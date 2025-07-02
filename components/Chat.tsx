// components/Chat.tsx

"use client";

import {
  ChevronDown,
  SendHorizonal,
  Copy,
  MessageSquareQuote,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Character, User } from "@/app/generated/prisma";
import { MessageRating } from "@/app/generated/prisma";
import {
  rateMessageAction,
  submitFeedbackAction,
} from "@/app/actions/chat-actions";
import { Message } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageFeedbackModal } from "./FeedbackModal";
import { Avatar } from "./Avatar";

const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-light-surface-hover dark:bg-dark-surface-hover">
        <div className="flex items-center justify-center space-x-1">
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export const Chat = ({
  character,
  currentUser,
  chatId,
  initialMessages,
}: {
  character: Character;
  chatId: string;
  currentUser: User;
  initialMessages: Message[];
}) => {
  const router = useRouter();
  const isNewChatRef = useRef(initialMessages.length === 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const { messages, input, handleSubmit, handleInputChange, status } = useChat({
    character,
    chatId,
    initialMessages,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isNewChatRef.current && status !== "loading" && messages.length > 0) {
      router.refresh();

      isNewChatRef.current = false;
    }
  }, [status, messages.length, router]);

  useEffect(() => {
    scrollToBottom();
    if (status !== "loading" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [messages, status]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 128; // 8rem, adjust as needed (e.g., 5-6 lines of text)

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && status !== "loading" && formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden relative">
      <div className="flex-grow overflow-y-auto py-4 space-y-4 px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 2xl:px-40">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            character={character}
            currentUser={currentUser}
          />
        ))}
        {status === "loading" && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Container for Form and Footer, with consistent horizontal padding */}
      <div className="flex-none px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 2xl:px-40">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="pb-1" // Reduced bottom padding before footer
        >
          {/* This div is now the styled input container */}
          <div className="relative flex items-end w-full bg-light-surface-hover dark:bg-dark-surface-hover border border-light-border dark:border-dark-border rounded-3xl focus-within:ring-2 focus-within:ring-primary-default/50 dark:focus-within:ring-primary-light/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message..." // Your existing placeholder
              disabled={status === "loading"}
              rows={1}
              className="flex-1 w-full bg-transparent border-none px-4 py-3 resize-none overflow-y-hidden leading-relaxed focus:outline-none focus:ring-0 pr-12 text-sm sm:text-base text-light-text-default dark:text-dark-text-default placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={status === "loading" || !input.trim()}
              aria-label="Send message"
              // Fixed positioning and alignment
              className="absolute right-1.5 bottom-1/2 transform translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-primary-default text-gray-700 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <SendHorizonal className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Footer Text - matching image */}
        <div className="text-center py-2.5">
          <button
            onClick={() => setIsFooterExpanded(!isFooterExpanded)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center transition-colors"
            aria-expanded={isFooterExpanded}
          >
            This is A.I. and not a real person. Treat everything it says as
            fiction
            <ChevronDown
              className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${
                isFooterExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {isFooterExpanded && (
            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              What is said should not be relied upon as fact or advice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// No changes needed for MessageBubble
const MessageBubble = ({
  message,
  character,
  currentUser,
}: {
  message: Message;
  character: Character;
  currentUser: User;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rating, setRating] = useState<MessageRating | null>(
    message.rating || null
  );
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isUser = message.role === "user";
  const messageContent = message.parts[0].text;
  const preWrapStyle = { whiteSpace: "pre-wrap" as const };

  const senderName = isUser ? currentUser.name || "You" : character.name;

  // Determine avatar source, preferring user image, then character image, then character icon
  const avatarSrc = isUser ? currentUser.image : character.image;
  const iconName = !isUser ? character.icon : null;

  const handleRateMessage = async (newRating: MessageRating) => {
    const finalRating = rating === newRating ? null : newRating;
    const oldRating = rating;
    setRating(finalRating);

    try {
      const result = await rateMessageAction({
        messageId: message.id,
        rating: finalRating,
      });

      if (result.error) {
        console.error("Failed to rate message:", result.error);
        setRating(oldRating);
      }
    } catch (error) {
      console.error("Error rating message:", error);
      setRating(oldRating);
      toast.error("Failed to rate message. Please try again.");
    }
  };

  // Handlers for actions
  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setMenuOpen(false); // Close menu after action
  };

  const handleSubmitFeedback = async (tags: string[], details?: string) => {
    try {
      const result = await submitFeedbackAction({
        messageId: message.id,
        tags,
        details: details || tags.join(", "),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Feedback submitted. Thank you!");
        setIsFeedbackModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleFeedback = () => {
    setMenuOpen(false); // Close the dropdown menu
    setIsFeedbackModalOpen(true); // Open the modal
  };

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate menu position to prevent clipping
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");

  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 80; // Approximate menu height

      // If there's not enough space below, show menu above
      if (buttonRect.bottom + menuHeight > viewportHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [menuOpen]);

  return (
    <>
      <div
        className={`group w-full flex items-start gap-3 relative ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <Avatar
          avatarSrc={avatarSrc}
          avatarName={senderName}
          iconName={iconName}
          size={30}
          focus="image"
        />

        {/* Message Content and Actions */}
        <div
          className={`flex flex-col w-full max-w-[85%] ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {/* Sender Name */}
          <p className="text-sm font-semibold mb-1 dark:text-dark-text-default text-light-text-default">
            {senderName}
          </p>

          {/* Bubble */}
          <div
            className={`relative rounded-2xl px-4 py-2 ${
              isUser
                ? "bg-primary-default/80 text-white rounded-tr-lg"
                : message.error
                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 rounded-tl-lg"
                : "bg-light-surface-hover dark:bg-dark-surface-hover rounded-tl-lg"
            }`}
          >
            {isUser ? (
              <div style={preWrapStyle}>{messageContent}</div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-2 prose-li:my-0">
                <ReactMarkdown>{messageContent}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Rating Actions - Only show for model responses */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleRateMessage("GOOD")}
                className={`p-1 rounded-full ${
                  rating === "GOOD"
                    ? "text-primary-default bg-primary-default/10"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-500/10"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRateMessage("BAD")}
                className={`p-1 rounded-full ${
                  rating === "BAD"
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-500/10"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* More Options Menu Button */}
        <div
          className={`relative opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isUser ? "mr-12" : "ml-12"
          }`}
        >
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-500/10"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              ref={menuRef}
              className={`absolute mt-1 w-40 bg-white dark:bg-dark-surface-hover shadow-lg rounded-lg border border-light-border dark:border-dark-border z-50 ${
                isUser ? "left-0" : "right-0"
              } ${menuPosition === "top" ? "bottom-full mb-1" : "top-full"}`}
            >
              <ul className="py-1 text-sm dark:text-dark-text-secondary text-light-text-secondary">
                <li>
                  <button
                    onClick={handleCopy}
                    className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </li>
                {!isUser && (
                  <li>
                    <button
                      onClick={handleFeedback}
                      className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <MessageSquareQuote className="w-4 h-4" /> Feedback
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* RENDER THE MODAL (it will only be visible when isOpen is true) */}
      {!isUser && (
        <MessageFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </>
  );
};
