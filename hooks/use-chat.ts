// hooks/use-chat.ts
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Character } from "@/app/generated/prisma";
import { sendMessageAction } from "@/app/actions/chat-actions";
import { useAppContext } from "@/contexts/AppContext";
import { Message } from "@/lib/types";

interface UseChatProps {
  character: Character;
  chatId: string;
  initialMessages?: Message[];
}

export const useChat = ({
  character,
  chatId,
  initialMessages = [],
}: UseChatProps) => {
  const initialGreeting: Message = {
    id: "initial-greeting",
    role: "model",
    parts: [{ text: character.greeting }],
  };
  const { refreshChatHistory } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [initialGreeting]
  );
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  // Updated to accept HTMLTextAreaElement as well
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || status === "loading") return;

    setStatus("loading");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ text: input }],
    };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");

    try {
      const result = await sendMessageAction({
        history: newMessages,
        message: currentInput,
        character: character,
        chatId: chatId,
      });

      if (result.isNewChat) {
        await refreshChatHistory();
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.text) {
        throw new Error("Received an invalid response from the server.");
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        parts: [{ text: result.text }],
      };

      setMessages((prev) => [...prev, modelMessage]);
      setStatus("idle");
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        parts: [{ text: `Sorry, an error occurred: ${errorMessage}` }],
        error: true,
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
      setInput(currentInput);
      setStatus("idle");
    }
  };

  return {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status,
    setInput,
  };
};
