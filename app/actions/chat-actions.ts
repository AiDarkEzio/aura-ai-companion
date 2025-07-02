// app/actions/chat-actions.ts

"use server";

import { Character, MessageRating, Prisma } from "@/app/generated/prisma";
import { getUserIdFromSession } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { Message, StartNewChatParams } from "@/lib/types";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { feedbackSchema } from "@/lib/zodSchemas";
import { GEMINI_15_FLASH_MODEL_NAME, generateGeminiSafetyConfig, GetGeminiApiKey } from "@/lib/llm";
import { generateSceneOpeningMessage } from "@/lib/utils";
import { extractUserCharacterMemories } from "./characterActions";

interface SendMessageActionProps {
  history: Message[];
  message: string;
  character: Character;
  chatId: string;
}

export type ChatWithDetails = Prisma.ChatGetPayload<{
  include: {
    character: true;
    messages: {
      orderBy: {
        sentAt: "asc";
      };
    };
  };
}>;

// This is the return type of our action. It's either a success or an error object.
type SendMessageActionResult =
  | { text?: string; error?: never, isNewChat: boolean }
  | { text?: never; error: string; isRateLimit?: boolean, isNewChat: boolean };

export const sendMessageAction = async ({
  history,
  message,
  character,
  chatId,
}: SendMessageActionProps): Promise<SendMessageActionResult> => {
  const userId = await getUserIdFromSession();

  if (!userId || !chatId) {
    return { error: "User not authenticated", isNewChat: false };
  }
  let isNewChat = false;

  try {
    const messageCount = await prisma.message.count({ where: { chatId } });
    isNewChat = messageCount <= 1;

    const chatWithDetails = await prisma.chat.findUnique({
        where: { id: chatId, userId },
        include: {
            messages: {
                orderBy: {
                    sentAt: 'asc'
                }
            }
        }
    });

    if (!chatWithDetails || !chatWithDetails.chatInstruction) {
      throw new Error("Chat not found or instruction is missing.");
    }

    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });
    
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
    
    const actualHistory = history.slice(0, -1);

    const chat = genAI.chats.create({
      model: GEMINI_15_FLASH_MODEL_NAME,
      config: { safetySettings: generateGeminiSafetyConfig(character.nsfwTendency), ...generationConfig, systemInstruction: chatWithDetails.chatInstruction },
      history: actualHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts.map((p) => p.text).join(" ") }],
      })),
    });

    const result = await chat.sendMessage({ message });
    const responseText = result.text;

    if (!responseText) {
      throw new Error("No response text received from AI");
    }

    await prisma.$transaction([
      prisma.message.createMany({
        data: [
          {
            chatId: chatId,
            content: message,
            role: "USER",
          },
          {
            chatId: chatId,
            content: responseText,
            role: "ASSISTANT",
          },
        ],
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: {
          lastMessageAt: new Date(),
        },
      }),
    ]);

    if (isNewChat) {
      try {
        await resumeChat(chatId);
      } catch (error: unknown) {
        console.log("Error while resumeChat:", error);
      }
    }

    // After 10-15 messages, trigger summarization and memory extraction
    if (chatWithDetails.messages.length % 12 === 0) {
        summarizeChat(chatId);
        extractUserCharacterMemories({chatId, userId, characterId: character.id});
    }

    return { text: responseText, isNewChat };
  } catch (error: unknown) {
    console.error("Error in sendMessageAction:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return {
        error: "Rate limit exceeded. Please try again in a minute.",
        isRateLimit: true,
        isNewChat,
      };
    }

    return {
      error: "An error occurred while processing your request.",
      isNewChat,
    };
  }
};

export async function summarizeChat(chatId: string) {
    const userId = await getUserIdFromSession(); 
    if (!userId) {
        console.error("SummarizeChat: Unauthorized");
        return;
    }

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: {
                        sentAt: 'asc'
                    }
                }
            }
        });

        if (!chat) {
            console.error("SummarizeChat: Chat not found");
            return;
        }

        const conversation = chat.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        const existingSummary = chat.memorySummary;

        const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });

        const prompt = `\nYou are a conversation summarizer.\n${existingSummary ? `The conversation had a previous summary, which is: "${existingSummary}"` : ''}\nBased on the previous summary (if any) and the latest messages, create a new, concise, and neutral summary of the entire conversation.\nThis summary will be used as long-term memory for an AI, so focus on factual information and significant conversational turns.\n\nConversation:\n${conversation}`;

        const result = await genAI.models.generateContent({
            model: GEMINI_15_FLASH_MODEL_NAME,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const summary = result.text;

        if (summary) {
            await prisma.chat.update({
                where: { id: chatId },
                data: { memorySummary: summary },
            });
            console.log(`Chat ${chatId} summarized successfully.`);
        }
    } catch (error) {
        console.error(`Error summarizing chat ${chatId}:`, error);
    }
}

export const resumeChat = async (chatId: string) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: userId,
    },
    include: {
      character: true,
      messages: {
        orderBy: {
          sentAt: "asc",
        },
      },
    },
  });
  if (!chat) {
    throw new Error("Chat not found or you don't have permission to access it");
  }
  try {
    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });

    const generationConfig = {
      temperature: 1.1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 80,
    };
    
    const systemInstruction = `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`;

    const res = await genAI.models.generateContent({
      model: GEMINI_15_FLASH_MODEL_NAME,
      contents: `chat: ${JSON.stringify(
        chat.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      )}`,
      config: { safetySettings: generateGeminiSafetyConfig(chat.character.nsfwTendency), ...generationConfig, systemInstruction },
    });
    if (!res.text) {
      throw new Error("No title generated by AI");
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: { title: res.text.trim().slice(0, 80) },
    });

    revalidatePath(`/chat/${chatId}`);

    return { title: res.text.trim().slice(0, 80) };
  } catch (error: unknown) {
    console.error("Error in resumeChat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { error: `Failed to generate chat title: ${errorMessage}` };
  }
};

export const startNewChat = async ({ characterId, sceneId }: StartNewChatParams) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { persona: true, profile: true },
  });

  const character = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
  });

  // Fetch existing memories for this user-character pair
  const userCharacterMemory = await prisma.userCharacterMemory.findUnique({
      where: {
          userId_characterId: {
              userId,
              characterId,
          },
      },
  });
  const longTermMemories = userCharacterMemory ? userCharacterMemory.memories : [];

  // Fetch the summary of the last chat session, if any
  const lastChat = await prisma.chat.findFirst({
      where: {
          userId,
          characterId,
      },
      orderBy: {
          lastMessageAt: 'desc',
      },
      select: {
          memorySummary: true,
      }
  });
  const lastChatSummary = lastChat?.memorySummary;


  const scene = sceneId
    ? await prisma.scene.findUniqueOrThrow({ where: { id: sceneId } })
    : null;

  const chatInstruction = `
# Core Identity
You are an AI companion. Your primary goal is to engage the user in a compelling, immersive, and entertaining conversation.

# Character Persona
You must act as the character "${character.name}".
- Character's Core Instructions: ${character.systemInstruction}
${character.aiTone ? `- Character's Tone: ${character.aiTone}` : ''}
- Content Style (NSFW Tendency): ${
  (() => {
    switch (character.nsfwTendency) {
      case 'HIGH':
        return 'You are permitted to engage in explicit and graphic mature themes, following the user\'s lead.';
      case 'MEDIUM':
        return 'You can be direct with mature themes and use suggestive language, but avoid being overly graphic.';
      case 'LOW':
        return 'You can subtly hint at mature or romantic themes but must avoid explicit content.';
      default:
        return 'Strictly avoid all NSFW, mature, or suggestive topics.';
    }
  })()
}

# Long-Term Memory
You have remembered the following key facts about the user. Weave them into the conversation naturally.
- Facts: ${longTermMemories.length > 0 ? longTermMemories.join(', ') : 'None yet.'}

${lastChatSummary ? `
# Previous Conversation Summary
Here is a summary of your last conversation with the user. Use it to maintain context.
- Summary: ${lastChatSummary}
` : ''}

# User Profile & Preferences
Tailor your conversation to the following user preferences. This is about *how* you interact with them as your character.
${user.profile?.preferredName || user.profile?.fullName ? `- User's Preferred Name: ${user.profile.preferredName ? user.profile.preferredName : user.profile.fullName}` : ''}
${user.persona?.interests ? `- User's Interests (Incorporate these naturally): ${user.persona.interests}` : ''}
${user.persona?.userGoals ? `- User's Goal for this chat: ${user.persona.userGoals}` : ''}
${user.persona?.communicationStyle ? `- User's Preferred Communication Style: ${user.persona.communicationStyle}` : ''}
${user.persona?.aiTone ? `- User's Preferred Tone to be spoken to in: ${user.persona.aiTone}` : ''}
${user.persona?.excludedTopics ? `- CRITICAL: Absolutely avoid discussing these topics: ${user.persona.excludedTopics}. This is a strict boundary.` : ''}

${scene ? `
# Current Scene Context
You and the user are currently in the following scene. Your responses must be grounded in this context.
- Scene Title: ${scene.title}
- Your Role & Instructions for this Scene: ${scene.sceneInstruction}
` : `
# Scene Context
There is no specific scene. The conversation is open-ended.
`}

# Final Rules
- NEVER break character. Do not reveal that you are an AI or language model.
- Your responses should be natural and conversational, consistent with the persona of "${character.name}".
`.trim();

  const openingMessage = scene
    ? await generateSceneOpeningMessage({character, scene, userName: user.profile?.preferredName || user.profile?.fullName || user.name || "User"})
    : character.greeting;

  const newChat = await prisma.$transaction(async (tx) => {
    const chat = await tx.chat.create({
      data: {
        userId,
        characterId,
        sceneId,
        chatInstruction,
        openingMessage,
        lastMessageAt: new Date(),
      },
    });

    await tx.message.create({
      data: {
        chatId: chat.id,
        content: openingMessage,
        role: "ASSISTANT",
      },
    });

    // Increment the character's chat count
    await tx.character.update({
      where: { id: characterId },
      data: { chatCount: { increment: 1 } },
    });

    return chat;
  });

  revalidatePath(`/characters/${characterId}`);
  if (sceneId) {
    revalidatePath(`/scene/${sceneId}`);
  }
  redirect(`/chat/${newChat.id}`);
};

export const getChatForUser = async (
  chatId: string
): Promise<ChatWithDetails | null> => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return null;
  }

  return await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: userId,
    },
    include: {
      character: true,
      messages: {
        orderBy: {
          sentAt: "asc",
        },
      },
    },
  });
};

export const getChatsForCharacter = async (characterId: string) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return [];
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId,
      characterId,
      messages: {
        some: {}, // Only return chats that have at least one message
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    select: {
      id: true,
      title: true,
      messages: {
        orderBy: {
          sentAt: "desc",
        },
        take: 1,
        select: {
          content: true,
          sentAt: true,
        },
      },
    },
    take: 30,
  });

  // Map to the structure needed by the PastChatsList component
  return chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    lastMessage: chat.messages[0]?.content ?? "No message content found.",
    lastMessageAt: chat.messages[0]?.sentAt ?? null,
  }));
};

export async function deleteChatAction(chatId: string, characterId: string) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // First, verify the chat belongs to the user to prevent unauthorized deletion
      const chat = await tx.chat.findUnique({
        where: { id: chatId, userId: userId },
      });

      if (!chat) {
        throw new Error(
          "Chat not found or you don't have permission to delete it."
        );
      }

      // Delete the chat itself
      await tx.chat.delete({
        where: { id: chatId },
      });

      // Decrement the character's chat count
      await tx.character.update({
        where: { id: characterId },
        data: {
          chatCount: {
            decrement: 1,
          },
        },
      });
    });

    revalidatePath(`/characters/${characterId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    if (error instanceof Error && error.message.includes("Chat not found")) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred." };
  }
}

export async function updateChatTitleAction(
  chatId: string,
  characterId: string,
  title: string
) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { error: "Title cannot be empty." };
  }
  if (trimmedTitle.length > 150) {
    return { error: "Title cannot be longer than 150 characters." };
  }

  try {
    const updateResult = await prisma.chat.updateMany({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        title: trimmedTitle,
      },
    });

    if (updateResult.count === 0) {
      return {
        error: "Chat not found or you don't have permission to update it.",
      };
    }

    revalidatePath(`/characters/${characterId}`);

    return { success: true, newTitle: trimmedTitle };
  } catch (error) {
    console.error("Error updating chat title:", error);
    return { error: "An unexpected error occurred while updating the title." };
  }
}

export async function rateMessageAction({
  messageId,
  rating,
}: {
  messageId: string;
  rating: MessageRating | null;
}) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        chat: {
          userId: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!message) {
      return {
        error: "Message not found or you don't have permission to rate it.",
      };
    }

    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        rating: rating,
      },
    });

    // Optionally, revalidate the path if you ever display ratings on a different page
    // For this live-chat UI, client-side updates are more important.
    // revalidatePath(`/chat/${chatId}`);

    return { success: true };
  } catch (error) {
    console.error("Error rating message:", error);
    return { error: "An unexpected error occurred while rating the message." };
  }
}

export const submitFeedbackAction = async ({
  messageId,
  tags,
  details,
}: {
  messageId: string;
  tags: string[];
  details: string;
}) => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Validate feedback payload
  const parseResult = feedbackSchema.safeParse({ tags, details });
  if (!parseResult.success) {
    return {
      error: "Invalid feedback payload",
      issues: parseResult.error.issues,
    };
  }

  try {
    // First, verify the user owns the message they are giving feedback on
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        chat: { userId },
      },
      select: { id: true, rating: true, feedback: true },
    });

    if (!message) {
      return { error: "Message not found or you do not have permission." };
    }

    const feedbackPayload = JSON.stringify(parseResult.data);

    await prisma.message.update({
      where: { id: messageId },
      data: {
        feedback: feedbackPayload,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: "An unexpected error occurred while submitting feedback." };
  }
}

export const getLast10ChatsWithCharacters = async () => {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return [];
  }

  return await prisma.chat.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    take: 10,
    include: {
      character: true,
    },
  });
};