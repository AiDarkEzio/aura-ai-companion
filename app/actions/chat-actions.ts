// app/actions/chat-actions.ts
"use server";

import { Character, MessageRating, Prisma } from "@/app/generated/prisma";
import { getUserIdFromSession } from "@/lib/auth";
import { GenerateContentConfig, GoogleGenAI, Type, } from "@google/genai";
import { Message, StartNewChatParams } from "@/lib/types";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { feedbackSchema } from "@/lib/zodSchemas";
import { GEMINI_15_FLASH_MODEL_NAME, generateGeminiSafetyConfig, GetGeminiApiKey } from "@/lib/llm";
import { calculateMessageCost, estimateTokenCount, generateSceneOpeningMessage } from "@/lib/utils";
import { addUserCharacterMemory } from "./characterActions";
import { generateChatInstruction } from "@/lib/instructions";

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

type SendMessageActionResult =
  | { text?: string; error?: never; isNewChat: boolean; memory?: string }
  | {
      text?: never;
      error: string;
      isRateLimit?: boolean;
      isInsufficientCredits?: boolean;
      isNewChat: boolean;
      memory?: never;
    };

type AIResponse = {
  reply: string;
  userCharacterMemory?: string;
};

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
    const chatWithDetails = await prisma.chat.findUnique({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" },
          take: 25,
        },
        character: {
          include: {
            userMemories: {
              where: { userId },
            },
          },
        },
        user: {
          select: { id: true, profile: true, persona: true, credits: true },
        },
      },
    });

    if (!chatWithDetails || !chatWithDetails.chatInstruction || !chatWithDetails.user) {
      throw new Error( "Chat not found, instruction is missing, or user data is unavailable.");
    }

    isNewChat = chatWithDetails.messages.length <= 2;
    const user = chatWithDetails.user;
    const longTermMemories = chatWithDetails.character.userMemories[0]?.memories || [];
    const lastChatSummary = chatWithDetails.memorySummary;

    const dynamicInstruction = `
# Long-Term Memory (Facts about the User)
You have remembered the following key facts about the user. Weave them into the conversation naturally.
- Facts: ${ longTermMemories.length > 0 ? longTermMemories.join("; ") : "None yet."}

${lastChatSummary ? `# Conversation Previous Summary
Here is a summary of your last conversation with the user. Use it to maintain context.
- Summary: ${lastChatSummary}`: ""}

# User Profile & Preferences
Tailor your conversation to the following user preferences. This is about *how* you interact with them as your character.
${user.profile?.preferredName ? `- User's Preferred Name: ${user.profile.preferredName}` : ""}
${user.persona?.interests ? `- User's Interests (Incorporate these naturally): ${user.persona.interests}` : ""}
${user.persona?.userGoals ? `- User's Goal for this chat: ${user.persona.userGoals}` : ""}
${ user.persona?.communicationStyle ? `- User's Preferred Communication Style: ${user.persona.communicationStyle}` : ""}
${user.persona?.aiTone ? `- User's Preferred Tone to be spoken to in: ${user.persona.aiTone}` : ""}
${user.persona?.excludedTopics ? `- CRITICAL: Absolutely avoid discussing these topics: ${user.persona.excludedTopics}. This is a strict boundary.`: ""}
`;

    const systemInstruction = chatWithDetails.chatInstruction.replace(
      "<{{DYNAMIC_INSTRUCTION}}>",
      dynamicInstruction
    );

    const config: GenerateContentConfig = {
      safetySettings: generateGeminiSafetyConfig(character.nsfwTendency),
      systemInstruction: systemInstruction,
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: {
            type: Type.STRING,
            description: `# 'reply' field rules:
- This field contains your conversational response, spoken as the character "${character.name}".
- NEVER break character in the 'reply' field. Do not reveal that you are an AI or language model.`,
          },
          userCharacterMemory: {
            type: Type.STRING,
            description: `# 'userCharacterMemory' field rules:
1.  Only populate 'userCharacterMemory' if you learn a new, significant, and lasting fact ABOUT THE USER (e.g., their name, a key preference, a major life event).
2.  Do NOT add memories for trivial things, questions the user asks you, or your own statements.
3.  If no new significant fact is learned, you MUST return 'userCharacterMemory' as an empty string: "".
4.  The memory should be a full, self-contained sentence. For example: "The user's favorite color is blue." or "The user has a pet cat named Whiskers."`,
          },
        },
        required: ["reply"],
        additionalProperties: false,
      },
    };

    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });
    const actualHistory = history.slice(0, -1);

    const chat = genAI.chats.create({
      model: GEMINI_15_FLASH_MODEL_NAME,
      config,
      history: actualHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts.map((p) => p.text).join(" ") }],
      })),
    });

    const userNewMessage = { role: "user", parts: [{ text: message }] };
    const combinedHistory = chat.getHistory();
    combinedHistory.push(userNewMessage);

    const combinedCountTokensResponse = await genAI.models.countTokens({ model: GEMINI_15_FLASH_MODEL_NAME, contents: combinedHistory });
    const MESSAGE_COST = calculateMessageCost(combinedCountTokensResponse.totalTokens || estimateTokenCount(JSON.stringify(combinedHistory)));

    if (user.credits < MESSAGE_COST) {
      return {
        error: `You need ${MESSAGE_COST} credits to send this message, but you only have ${user.credits}.`,
        isInsufficientCredits: true,
        isNewChat: false,
      };
    }

    const result = await chat.sendMessage({message});
    const responseText = result.text;

    if (!responseText) {
      throw new Error("No response text received from AI");
    }

    let parsedResponse: AIResponse;
    try {
      parsedResponse = JSON.parse(responseText) as AIResponse;
    } catch (e) {
      console.error( "Failed to parse AI response as JSON. Falling back to raw text.", { responseText, error: e });
      parsedResponse = { reply: responseText };
    }

    if (parsedResponse.userCharacterMemory && parsedResponse.userCharacterMemory.trim().length > 0) {
      console.log( `AI identified a new memory: "${parsedResponse.userCharacterMemory}"` );
      addUserCharacterMemory(
        character.id,
        parsedResponse.userCharacterMemory
      ).catch((err) =>
        console.error("Failed to add user character memory in background:", err)
      );
    }

    if (isNewChat) {
      try {
        await resumeChat(chatId);
      } catch (err) {
        console.log("Error generating chat title:", err);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.create({ data: { chatId, content: message, role: "USER" } });

      const assistantMessage = await tx.message.create({ data: { chatId, content: parsedResponse.reply, role: "ASSISTANT"}});

      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: MESSAGE_COST,
          },
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: userId,
          amount: -MESSAGE_COST,
          type: "MESSAGE_COST",
          description: `Message to character: ${character.name}`,
          messageId: assistantMessage.id,
        },
      });

      await tx.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: new Date() },
      });
    });

    if (chatWithDetails.messages.length > 0 && chatWithDetails.messages.length % 12 === 1) {
      summarizeChat(chatId).catch((err) => console.log("Error summarizing chat:", err));
    }

    return {
      text: parsedResponse.reply,
      isNewChat,
      memory: parsedResponse.userCharacterMemory || undefined,
    };
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
        messages: { orderBy: { sentAt: "asc" } },
        character: true,
        scene: true,
      },
    });

    if (!chat) {
      console.error("SummarizeChat: Chat not found");
      return;
    }

    const conversation = chat.messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
    const existingSummary = chat.memorySummary;

    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });

    const prompt = `\nYou are a conversation summarizer.\n${
      existingSummary
        ? `The conversation had a previous summary, which is: "${existingSummary}"`
        : ""
    }\nBased on the previous summary (if any) and the latest messages, create a new, concise, and neutral summary of the entire conversation.\nThis summary will be used as long-term memory for an AI, so focus on factual information and significant conversational turns.\n\nConversation:\n${conversation}`;

    const result = await genAI.models.generateContent({
      model: GEMINI_15_FLASH_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summary = result.text;

    if (summary) {
      const newChatInstruction = generateChatInstruction({
        character: chat.character,
        scene: chat.scene,
      });
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          memorySummary: summary,
          chatInstruction: newChatInstruction,
        },
      });
    } else {
      throw new Error("No summary generated by AI");
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
        take: 2, // Only need the first couple of messages to generate a title
      },
    },
  });
  if (!chat) {
    throw new Error("Chat not found or you don't have permission to access it");
  }
  try {
    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });

    const config: GenerateContentConfig = {
      temperature: 1.1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 80,
      safetySettings: generateGeminiSafetyConfig(chat.character.nsfwTendency),
      systemInstruction: `
- You will generate a short title based on the first message a user begins a conversation with.
- Ensure it is not more than 80 characters long.
- The title should be a summary of the user's message.
- Do not use quotes or colons.`,
    };

    const res = await genAI.models.generateContent({
      model: GEMINI_15_FLASH_MODEL_NAME,
      config,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a title for a chat that starts with this message: "${
                chat.messages.find((m) => m.role === "USER")?.content ??
                chat.messages[1]?.content
              }"`,
            },
          ],
        },
      ],
    });

    const titleText = res.text;
    if (!titleText) throw new Error("No title generated by AI");

    await prisma.chat.update({
      where: { id: chatId },
      data: { title: titleText.trim().slice(0, 80) },
    });

    revalidatePath(`/chat/${chatId}`);

    return { title: titleText.trim().slice(0, 80) };
  } catch (error: unknown) {
    console.error("Error in resumeChat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { error: `Failed to generate chat title: ${errorMessage}` };
  }
};

export const startNewChat = async ({
  characterId,
  sceneId,
}: StartNewChatParams) => {
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

  const scene = sceneId
    ? await prisma.scene.findUniqueOrThrow({ where: { id: sceneId } })
    : null;

  const chatInstruction = generateChatInstruction({
    character,
    scene,
  });

  const openingMessage = scene
    ? await generateSceneOpeningMessage({
        character,
        scene,
        userName: user.profile?.preferredName || user.name || "User",
      })
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

// export async function updateChatTitleAction(
//   chatId: string,
//   characterId: string,
//   title: string
// ) {
//   const userId = await getUserIdFromSession();
//   if (!userId) {
//     return { error: "Unauthorized" };
//   }

//   const trimmedTitle = title.trim();
//   if (trimmedTitle.length === 0) {
//     return { error: "Title cannot be empty." };
//   }
//   if (trimmedTitle.length > 150) {
//     return { error: "Title cannot be longer than 150 characters." };
//   }

//   try {
//     const updateResult = await prisma.chat.updateMany({
//       where: {
//         id: chatId,
//         userId: userId,
//       },
//       data: {
//         title: trimmedTitle,
//       },
//     });

//     if (updateResult.count === 0) {
//       return {
//         error: "Chat not found or you don't have permission to update it.",
//       };
//     }

//     revalidatePath(`/characters/${characterId}`);

//     return { success: true, newTitle: trimmedTitle };
//   } catch (error) {
//     console.error("Error updating chat title:", error);
//     return { error: "An unexpected error occurred while updating the title." };
//   }
// }

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

  const parseResult = feedbackSchema.safeParse({ tags, details });
  if (!parseResult.success) {
    return {
      error: "Invalid feedback payload",
      issues: parseResult.error.issues,
    };
  }

  try {
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
};

export const getLastXChatsWithCharacters = async (x=10) => {
  if (typeof x !== "number" || x <= 0) x = 10

  const userId = await getUserIdFromSession();
  if (!userId) {
    return [];
  }

  return await prisma.chat.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    take: x,
    include: {
      character: true,
    },
  });
};

export async function getPaginatedChats(page: number, limit: number) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return [];
  }

  const skip = (page - 1) * limit;

  return prisma.chat.findMany({
    where: {
      userId,
      messages: {
        some: {}, // Ensure the chat is not empty
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    take: limit,
    skip: skip,
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      character: {
        select: {
          id: true,
          name: true,
          image: true,
          icon: true,
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}