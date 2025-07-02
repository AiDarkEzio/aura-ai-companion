// app/actions/characterActions.ts
"use server";

import prisma from "@/lib/prisma";
import { Character, Prisma, Scene  } from "@/app/generated/prisma";
import { getUserIdFromSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CharacterSearchFilter } from "@/lib/types";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_15_FLASH_MODEL_NAME, GetGeminiApiKey } from "@/lib/llm";

export async function likeCharacterAction(characterId: string) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const existingLike = await prisma.characterLike.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId,
        },
      },
    });

    let newLikeCount;

    if (existingLike) {
      // User has already liked, so unlike it in a transaction
      const character = (await prisma.$transaction([
        prisma.characterLike.delete({
          where: {
            userId_characterId: {
              userId,
              characterId,
            },
          },
        }),
        prisma.character.update({
          where: { id: characterId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: { likeCount: true },
        }),
      ]))[1];
      newLikeCount = character.likeCount;
    } else {
      // User has not liked, so like it in a transaction
      const character = (await prisma.$transaction([
        prisma.characterLike.create({
          data: {
            userId,
            characterId,
          },
        }),
        prisma.character.update({
          where: { id: characterId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          select: { likeCount: true },
        }),
      ]))[1];
      newLikeCount = character.likeCount;
    }

    revalidatePath(`/characters/${characterId}`);

    return {
      success: true,
      isLiked: !existingLike,
      newLikeCount: newLikeCount,
    };
  } catch (error) {
    console.error("Error in likeCharacterAction:", error);
    return { error: "An unexpected error occurred." };
  }
}

export type HomepageData = {
  mainCharacter: Character;
  userCharacters: Character[];
  communityCharacters: Character[];
  platformCharacters: Character[];
  scenes: Scene[];
};

export async function getHomepageData(): Promise<HomepageData> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    let mainCharacter = await prisma.character.findFirst({
      where: {
        isMainPlatformCharacter: true,
      },
    });

    const userCharacters = userId ? await prisma.character.findMany({ where: { creatorId: userId, }, orderBy: { createdAt: "desc", }, }) : [];

    // const platformCharacters = await prisma.character.findMany({ where: { creatorId: null, isPublic: true, isMainPlatformCharacter: false, }, orderBy: { createdAt: "desc", }, take: 6 });
    // --- MODIFIED: Fetch random platform characters ---
    const platformCharacters: Character[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT * FROM "Character"
        WHERE "creatorId" IS NULL
        AND "isPublic" = TRUE
        AND "isMainPlatformCharacter" = FALSE
        ORDER BY RANDOM()
        LIMIT 6
      `
    );

    // const communityCharacters = await prisma.character.findMany({ where: { isPublic: true, creatorId: { not: userId, }, NOT: { creatorId: null, }, }, orderBy: { createdAt: "desc" },take: 6, });
    // --- MODIFIED: Fetch random community characters ---
    const communityCharacters: Character[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT * FROM "Character"
        WHERE "isPublic" = TRUE
        AND "creatorId" IS NOT NULL
        AND "creatorId" != ${userId}
        ORDER BY RANDOM()
        LIMIT 6
      `
    );

    const scenes: Scene[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT * FROM "Scene"
        ORDER BY RANDOM()
        LIMIT 6
      `
    );

    if (!mainCharacter) mainCharacter = userCharacters[0];
    if (!mainCharacter) mainCharacter = platformCharacters[0];
    if (!mainCharacter) mainCharacter = communityCharacters[0];

    return {
      mainCharacter,
      userCharacters,
      platformCharacters,
      communityCharacters,
      scenes,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    throw new Error("Failed to fetch homepage data.");
  }
}

export async function getCommunityCharacters(): Promise<Character[]> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    return await prisma.character.findMany({
      where: {
        isPublic: true,
        creatorId: {
          not: userId,
        },
        NOT: {
          creatorId: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching community characters data:", error);
    throw new Error("Failed to fetch community characters data.");
  }
}

export async function getPlatformCharacters(): Promise<Character[]> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    return await prisma.character.findMany({
      where: {
        creatorId: null,
        isPublic: true,
        isMainPlatformCharacter: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching platform characters data:", error);
    throw new Error("Failed to fetch platform characters data.");
  }
}

export async function getUserCharacters(): Promise<Character[]> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    return await prisma.character.findMany({
      where: {
        creatorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching user characters data:", error);
    throw new Error("Failed to fetch user characters data.");
  }
}

export async function getMainCharacter(): Promise<Character | null> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    return await prisma.character.findFirst({
      where: {
        isMainPlatformCharacter: true,
      },
    });
  }
  catch (error) {
    console.error("Error fetching main character data:", error);
    throw new Error("Failed to fetch main character data.");
  }
}

export async function getCharacter(id: string): Promise<Character | null> {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      throw new Error(
        "Unauthorized: You must be logged in to perform this action."
      );
    }

    return await prisma.character.findUnique({ where: { id } });
  }
  catch (error) {
    console.error("Error fetching character data:", error);
    throw new Error("Failed to fetch character data.");
  }
}

export async function searchCharacters(
  query: string,
  filter: CharacterSearchFilter
): Promise<Character[]> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    // Return empty array for unauthenticated users, or throw an error
    return [];
  }

  const whereClause = {
    name: {
      contains: query,
      mode: "insensitive" as Prisma.QueryMode, // Explicitly type for Prisma
    },
  };

  switch (filter) {
    case "user":
      return prisma.character.findMany({
        where: {
          ...whereClause,
          creatorId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

    case "recent":
      // This is a bit more complex. We find recent chats, get the character, then filter by name.
      const recentChats = await prisma.chat.findMany({
        where: {
          userId,
          character: whereClause,
        },
        distinct: ["characterId"],
        orderBy: {
          lastMessageAt: "desc",
        },
        take: 20,
        select: {
          character: true,
        },
      });
      // The result is an array of { character: Character }, so we map it.
      return recentChats.map((chat) => chat.character);

    case "discover":
    default:
      // Search all public characters not created by the current user
      return prisma.character.findMany({
        where: {
          ...whereClause,
          isPublic: true,
          // Optional: exclude user's own characters from discover
          creatorId: {
            not: userId,
          },
        },
        orderBy: {
          likeCount: "desc", // Show most popular first
        },
        take: 50,
      });
  }
}

interface ExtractMemoriesParams {
  chatId: string;
  userId: string;
  characterId: string;
}

// TODO: also send past user character Memories to the LLM From database that can be use to update prvious memories accroding to chat
export async function extractUserCharacterMemories({ chatId, userId, characterId }: ExtractMemoriesParams) {
    console.log(`Starting memory extraction for chat ${chatId}`);
    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: { sentAt: 'desc' },
                    take: 20 // Get the last 20 messages for context
                }
            }
        });

        if (!chat || chat.messages.length === 0) {
            console.log(`Memory extraction skipped for chat ${chatId}: No messages found.`);
            return;
        }

        const conversation = chat.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        const existingMemory = await prisma.userCharacterMemory.findUnique({
            where: { userId_characterId: { userId, characterId } }
        });

        const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() });

        const prompt = `
You are a memory consolidation AI.
Based on the provided previous memories and the latest conversation, identify new facts about the user and update existing facts if new information contradicts them.
Output the final, consolidated list of facts as a JSON array of strings.

Previous Memories:
${existingMemory ? JSON.stringify(existingMemory.memories) : '[]'}

Latest Conversation:
${conversation}`;

        const result = await genAI.models.generateContent({
            model: GEMINI_15_FLASH_MODEL_NAME,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const responseText = result.text;
        if (!responseText) {
            console.log(`Memory extraction failed for chat ${chatId}: No response from LLM.`);
            return;
        }

        let newMemories: string[] = [];
        try {
            // The model might return a markdown code block
            const jsonString = responseText.replace(/```json\n?/, '').replace(/```$/, '');
            newMemories = JSON.parse(jsonString);
            if (!Array.isArray(newMemories)) {
                throw new Error("LLM did not return a valid JSON array.");
            }
        } catch (e) {
            console.error(`Error parsing memories for chat ${chatId}:`, e);
            return;
        }


        if (newMemories.length > 0) {
            const updatedMemories = [...new Set(newMemories)]; // Use Set to ensure no duplicates

            await prisma.userCharacterMemory.upsert({
                where: { userId_characterId: { userId, characterId } },
                update: { memories: updatedMemories, updatedAt: new Date() },
                create: { userId, characterId, memories: updatedMemories }
            });
            console.log(`Successfully extracted and saved ${newMemories.length} memories for user ${userId} and character ${characterId}.`);
        } else {
            console.log(`No new memories to extract for chat ${chatId}.`);
        }

    } catch (error) {
        console.error(`Error extracting user memories for chat ${chatId}:`, error);
    }
}
