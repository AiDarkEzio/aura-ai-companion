// Create a lib/utils.ts file and

import { Character, Scene, CreditTransactionType } from "@/app/generated/prisma";
import { GoogleGenAI } from "@google/genai";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GEMINI_15_FLASH_MODEL_NAME, generateGeminiSafetyConfig, GetGeminiApiKey } from "./llm";
import { ArrowDown, ArrowUp, Gift, MessageSquare, PlusCircle, Sparkles, User } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Uses AI to generate a dynamic opening message for a scene-based chat.
 * @param character The character starting the chat.
 * @param scene The scene the chat takes place in.
 * @returns A dynamically generated opening message string.
 */
export async function generateSceneOpeningMessage({character,scene,userName}:
  {character: Character
  scene: Scene
  userName: string}
): Promise<string> {
  try {
    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() })
    const prompt = `You are the character "${character.name}". Your Instructions are: ${character.systemInstruction}. You are starting a conversation with a user in the following scene: "${scene.title}". Your instructions for this scene are: "${scene.sceneInstruction}". User preferred name is: ${userName}. Write a single, compelling opening line to say to the user to kick off the conversation based on your character and the scene. Do not add quotes around your response. Your response should be a direct statement from you, as the character.`;
    
    const result = await genAI.models.generateContent({
      model: GEMINI_15_FLASH_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 1.0,
        maxOutputTokens: 100,
        safetySettings: generateGeminiSafetyConfig(character.nsfwTendency),
      }
    });

    if (!result || !result.text) {
      throw new Error("No response from AI model");
    }

    const responseText = result.text.trim();
    if (!responseText) {
      return character.greeting;
    }
    
    return responseText;

  } catch (error) {
    console.error("Error generating scene opening message, using fallback:", error);
    // Fallback to character's default greeting on any error
    return character.greeting;
  }
}

/**
 * Estimates the token count of a text by dividing its length by 4.
 * @param text The input string to estimate tokens for.
 * @returns Estimated token count.
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculates the credit cost for a message based on its token count.
 * @param tokenCount The total number of tokens in the prompt.
 * @returns The cost in credits.
 */
export const calculateMessageCost = (tokenCount: number): number => {
  if (tokenCount <= 0) {
    return 0;
  }
  // 1 credit for every 1000 tokens, rounded up.
  // e.g., 1-1000 tokens = 1 credit, 1001-2000 tokens = 2 credits.
  const tc = Math.ceil(tokenCount / 1000);
  return Math.max(1, tc);
};

// A helper function to format dates nicely (e.g., "5 minutes ago")
export function timeAgo(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

/**
 * Provides display properties for different credit transaction types.
 * @param type The CreditTransactionType enum value.
 * @returns An object with a label, icon component, and Tailwind CSS color class.
 */
export function getTransactionTypeDetails(type: CreditTransactionType) {
  switch (type) {
    case 'INITIAL_GRANT':
      return { label: 'Initial Credits', Icon: Gift, className: 'text-green-500' };
    case 'MONTHLY_ALLOWANCE':
      return { label: 'Monthly Allowance', Icon: User, className: 'text-green-500' };
    case 'PURCHASE':
      return { label: 'Credit Purchase', Icon: PlusCircle, className: 'text-green-500' };
    case 'REFUND':
      return { label: 'Refund', Icon: ArrowUp, className: 'text-green-500' };
    case 'MESSAGE_COST':
      return { label: 'Message Cost', Icon: MessageSquare, className: 'text-red-500' };
    case 'IMAGE_GENERATION':
      return { label: 'Image Generation', Icon: Sparkles, className: 'text-red-500' };
    default:
      return { label: 'Transaction', Icon: ArrowDown, className: 'text-light-text-secondary dark:text-dark-text-secondary' };
  }
}